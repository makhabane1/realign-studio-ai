import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const detailsSchema = z.object({
  property_type: z.string().min(1),
  bedrooms: z.string().default(""),
  bathrooms: z.string().default(""),
  price: z.string().default(""),
  neighborhood: z.string().min(1),
  target_buyer: z.string().default(""),
  key_features: z.string().default(""),
});

const FREE_LISTINGS = 5;
const FREE_IMAGES = 3;

export const generateListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => detailsSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (agentError) throw new Error(agentError.message);
    if (!agent) throw new Error("Set up your brand voice first.");

    if (agent.plan !== "pro") {
      const since = new Date();
      since.setDate(1);
      since.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("agent_id", userId)
        .gte("created_at", since.toISOString());
      if ((count ?? 0) >= FREE_LISTINGS) {
        throw new Error(
          `Free plan limit reached (${FREE_LISTINGS} listings this month). Upgrade to Pro for unlimited listings.`,
        );
      }
    }

    const { generateListingContent } = await import("./ai.server");
    const content = await generateListingContent(
      {
        name: agent.name,
        brokerage: agent.brokerage,
        tone_tags: agent.tone_tags,
        buyer_type: agent.buyer_type,
        visual_style: agent.visual_style,
        brand_colors: agent.brand_colors,
      },
      data,
    );

    const { data: listing, error } = await supabase
      .from("listings")
      .insert({
        agent_id: userId,
        title: content.title,
        property_details: data,
        description: content.description,
        social_caption: content.social_caption,
        follow_up_email: content.follow_up_email,
        status: "Draft",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    return { id: listing.id };
  });

export const generateImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ listingId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: agent } = await supabase.from("agents").select("*").eq("id", userId).maybeSingle();
    if (!agent) throw new Error("Set up your brand voice first.");

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("*")
      .eq("id", data.listingId)
      .maybeSingle();
    if (listingError) throw new Error(listingError.message);
    if (!listing) throw new Error("Listing not found.");

    if (agent.plan !== "pro") {
      const since = new Date();
      since.setDate(1);
      since.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("agent_id", userId)
        .not("image_url", "is", null)
        .gte("created_at", since.toISOString());
      if ((count ?? 0) >= FREE_IMAGES && !listing.image_url) {
        throw new Error(
          `Free plan limit reached (${FREE_IMAGES} images this month). Upgrade to Pro for unlimited images.`,
        );
      }
    }

    const details = detailsSchema.parse(listing.property_details);
    const { generateListingImage } = await import("./ai.server");
    const bytes = await generateListingImage(
      {
        name: agent.name,
        brokerage: agent.brokerage,
        tone_tags: agent.tone_tags,
        buyer_type: agent.buyer_type,
        visual_style: agent.visual_style,
        brand_colors: agent.brand_colors,
      },
      details,
    );

    const path = `${userId}/${listing.id}-${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from("listing-images")
      .upload(path, bytes, { contentType: "image/png", upsert: true });
    if (uploadError) throw new Error(uploadError.message);

    const { error: updateError } = await supabase
      .from("listings")
      .update({ image_url: path })
      .eq("id", listing.id);
    if (updateError) throw new Error(updateError.message);

    return { path };
  });
