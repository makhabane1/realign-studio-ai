import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const statsSchema = z.object({
  period: z.string().min(1),
  area: z.string().min(1),
  median_price: z.string().default(""),
  days_on_market: z.string().default(""),
  inventory: z.string().default(""),
  notes: z.string().default(""),
});

export const generateMarketUpdate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => statsSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (agentError) throw new Error(agentError.message);
    if (!agent) throw new Error("Set up your brand voice first.");

    const { generateMarketNewsletter } = await import("./ai.server");
    const content = await generateMarketNewsletter(
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

    const newsletter = `Subject: ${content.subject}\n\n${content.body}`;

    const { data: update, error } = await supabase
      .from("market_updates")
      .insert({
        agent_id: userId,
        period: data.period,
        stats: {
          area: data.area,
          median_price: data.median_price,
          days_on_market: data.days_on_market,
          inventory: data.inventory,
          notes: data.notes,
        },
        newsletter,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    return { id: update.id, newsletter };
  });
