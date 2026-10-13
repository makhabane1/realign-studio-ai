import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ImageIcon, Pencil, RefreshCw, Share2, Link2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { generateImage, regenerateListing } from "@/lib/realign.functions";
import { CopyBlock } from "@/components/realign/CopyBlock";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/listings/$id")({
  head: () => ({
    meta: [
      { title: "Listing content — Realign" },
      {
        name: "description",
        content: "Description, social caption, follow-up email and branded graphic for your listing.",
      },
      { property: "og:title", content: "Listing content — Realign" },
      { property: "og:description", content: "All your listing assets in one place." },
    ],
  }),
  component: ListingDetailPage,
});

const STATUSES = ["Draft", "Active", "Sold"];

function ListingDetailPage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const makeImage = useServerFn(generateImage);
  const [imaging, setImaging] = useState(false);
  const regen = useServerFn(regenerateListing);
  const [regenerating, setRegenerating] = useState(false);
  const runRegen = async () => {
    if (!confirm("Regenerate the title, description, caption and email? Your edits will be replaced.")) return;
    setRegenerating(true);
    try {
      await regen({ data: { listingId: id } });
      await queryClient.invalidateQueries({ queryKey: ["listing", id] });
      toast.success("Fresh copy generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Regeneration failed");
    } finally {
      setRegenerating(false);
    }
  };
  const saveField = async (field: "description" | "social_caption" | "follow_up_email", value: string) => {
    const { error } = await supabase.from("listings").update({ [field]: value } as { description: string }).eq("id", id);
    if (error) { toast.error(error.message); return false; }
    await queryClient.invalidateQueries({ queryKey: ["listing", id] });
    toast.success("Saved");
    return true;
  };
  const togglePublic = async (is_public: boolean) => {
    const { error } = await supabase.from("listings").update({ is_public }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    await queryClient.invalidateQueries({ queryKey: ["listing", id] });
  };
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/share/${id}` : "";

  const { data: listing, isPending } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: imageUrl } = useQuery({
    queryKey: ["listing-image", listing?.image_url],
    enabled: Boolean(listing?.image_url),
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("listing-images")
        .createSignedUrl(listing!.image_url!, 3600);
      if (error) throw error;
      return data.signedUrl;
    },
  });

  const runImage = async () => {
    setImaging(true);
    try {
      await makeImage({ data: { listingId: id } });
      await queryClient.invalidateQueries({ queryKey: ["listing", id] });
      toast.success("Branded graphic ready");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image generation failed");
    } finally {
      setImaging(false);
    }
  };

  const setStatus = async (status: string) => {
    const { error } = await supabase.from("listings").update({ status }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["listing", id] });
    await queryClient.invalidateQueries({ queryKey: ["listings"] });
  };

  if (isPending) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-xl font-semibold">Listing not found</h1>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/dashboard">Back to library</Link>
        </Button>
      </div>
    );
  }

  const details = (listing.property_details ?? {}) as Record<string, string>;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Library
      </Link>

      <header className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold leading-tight">{listing.title || "Untitled listing"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {[details['property_type'], details['neighborhood'], details['bedrooms'] && `${details['bedrooms']} bd`, details['bathrooms'] && `${details['bathrooms']} ba`, details['price']]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={runRegen} disabled={regenerating}>
          <RefreshCw className={regenerating ? "size-4 animate-spin" : "size-4"} />
          {regenerating ? "Regenerating…" : "Regenerate copy"}
        </Button>
        <Select value={listing.status} onValueChange={setStatus}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        </div>
      </header>

      <section className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
        <div className="flex items-center gap-3">
          <Share2 className="size-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-semibold">Public share link</p>
            <p className="text-xs text-muted-foreground">Anyone with the link can view the description, photo and highlights.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {listing.is_public && (
            <Button size="sm" variant="outline" onClick={async () => { await navigator.clipboard.writeText(shareUrl); toast.success("Link copied"); }}>
              <Link2 className="size-4" /> Copy link
            </Button>
          )}
          <Switch checked={listing.is_public} onCheckedChange={togglePublic} aria-label="Make listing public" />
        </div>
      </section>

      <section className="mt-8 rounded-xl border bg-card p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold tracking-tight">Branded graphic</h2>
          <Button variant="outline" size="sm" onClick={runImage} disabled={imaging}>
            <ImageIcon className="size-4" />
            {imaging ? "Generating…" : listing.image_url ? "Regenerate" : "Generate image"}
          </Button>
        </div>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Branded marketing graphic for ${listing.title}`}
            className="mt-4 w-full rounded-lg border"
            loading="lazy"
          />
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No graphic yet — generate one styled to your brand colors and visual style.
          </p>
        )}
      </section>

      <div className="mt-6 space-y-4">
        <EditableBlock label="Listing description" value={listing.description ?? ""} filename="listing-description.txt" onSave={(v) => saveField("description", v)} />
        <EditableBlock label="Social caption" value={listing.social_caption ?? ""} filename="social-caption.txt" onSave={(v) => saveField("social_caption", v)} />
        <EditableBlock label="Follow-up email" value={listing.follow_up_email ?? ""} filename="follow-up-email.txt" onSave={(v) => saveField("follow_up_email", v)} />
      </div>
    </div>
  );
}

function EditableBlock({ label, value, filename, onSave }: { label: string; value: string; filename: string; onSave: (v: string) => Promise<boolean> }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  if (!editing) {
    return (
      <div className="relative">
        <CopyBlock label={label} value={value} filename={filename} />
        <Button size="sm" variant="ghost" className="absolute right-28 top-3" onClick={() => { setDraft(value); setEditing(true); }} aria-label={`Edit ${label}`}>
          <Pencil className="size-4" /> Edit
        </Button>
      </div>
    );
  }
  return (
    <div className="rounded-xl border bg-card p-6">
      <h2 className="text-sm font-semibold tracking-tight">{label}</h2>
      <Textarea className="mt-3 min-h-48" value={draft} onChange={(e) => setDraft(e.target.value)} />
      <div className="mt-3 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
        <Button size="sm" disabled={saving} onClick={async () => { setSaving(true); if (await onSave(draft)) setEditing(false); setSaving(false); }}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
