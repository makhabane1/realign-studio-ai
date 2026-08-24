import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, MapPin, Check, Plus } from "lucide-react";
import { generateListing, generateHighlights } from "@/lib/realign.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/new")({
  head: () => ({
    meta: [
      { title: "New listing — Realign" },
      {
        name: "description",
        content: "Enter property details once and generate on-brand listing content instantly.",
      },
      { property: "og:title", content: "New listing — Realign" },
      { property: "og:description", content: "One property input. Every piece of content." },
    ],
  }),
  component: NewListingPage,
});

function NewListingPage() {
  const navigate = useNavigate();
  const generate = useServerFn(generateListing);
  const genHighlights = useServerFn(generateHighlights);
  const [loading, setLoading] = useState(false);
  const [highlightsLoading, setHighlightsLoading] = useState(false);
  const [highlights, setHighlights] = useState<{ bullets: string[]; paragraph: string } | null>(
    null,
  );
  const [includeHighlights, setIncludeHighlights] = useState(false);
  const [form, setForm] = useState({
    property_type: "",
    bedrooms: "",
    bathrooms: "",
    price: "",
    neighborhood: "",
    target_buyer: "",
    key_features: "",
  });

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const buildHighlights = async () => {
    if (!form.neighborhood.trim()) {
      toast.error("Enter a neighborhood first");
      return;
    }
    setHighlightsLoading(true);
    try {
      const result = await genHighlights({
        data: {
          neighborhood: form.neighborhood,
          property_type: form.property_type,
          target_buyer: form.target_buyer,
        },
      });
      setHighlights(result);
      setIncludeHighlights(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not generate highlights");
    } finally {
      setHighlightsLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await generate({
        data: {
          ...form,
          neighborhood_highlights: highlights
            ? highlights.bullets.map((b) => `• ${b}`).join("\n")
            : undefined,
          append_highlights: includeHighlights && highlights ? highlights.paragraph : undefined,
        },
      });
      toast.success("Listing content generated");
      navigate({ to: "/listings/$id", params: { id: result.id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">Generate</p>
        <h1 className="mt-2 text-3xl font-bold">New listing</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Describe the property. Realign handles the description, caption, email and graphic.
        </p>
      </header>

      <form onSubmit={submit} className="mt-8 space-y-6">
        <section className="space-y-4 rounded-xl border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Property type</Label>
              <Input
                id="type"
                required
                placeholder="Mid-century ranch"
                value={form.property_type}
                onChange={set("property_type")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hood">Neighborhood</Label>
              <Input
                id="hood"
                required
                placeholder="Highland Park"
                value={form.neighborhood}
                onChange={set("neighborhood")}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={buildHighlights}
              disabled={highlightsLoading || !form.neighborhood.trim()}
            >
              <MapPin className="size-4" />
              {highlightsLoading ? "Generating highlights…" : "Generate Neighborhood Highlights"}
            </Button>

            {highlights && (
              <div className="rounded-xl border bg-muted/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                  Neighborhood highlights
                </p>
                <ul className="mt-3 space-y-2">
                  {highlights.bullets.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  type="button"
                  variant={includeHighlights ? "secondary" : "default"}
                  size="sm"
                  className="mt-4"
                  onClick={() => setIncludeHighlights((prev) => !prev)}
                >
                  {includeHighlights ? <Check className="size-4" /> : <Plus className="size-4" />}
                  {includeHighlights ? "Added to description" : "Add to description"}
                </Button>
                {includeHighlights && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    A highlights paragraph will be appended to the listing description when you
                    generate.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="beds">Bedrooms</Label>
              <Input id="beds" placeholder="4" value={form.bedrooms} onChange={set("bedrooms")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baths">Bathrooms</Label>
              <Input id="baths" placeholder="2.5" value={form.bathrooms} onChange={set("bathrooms")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" placeholder="$875,000" value={form.price} onChange={set("price")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyer">Target buyer (optional)</Label>
            <Input
              id="buyer"
              placeholder="Leave blank to use your brand default"
              value={form.target_buyer}
              onChange={set("target_buyer")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="features">Key features</Label>
            <Textarea
              id="features"
              rows={4}
              placeholder="Vaulted ceilings, walnut kitchen, west-facing garden, walkable to the arts district"
              value={form.key_features}
              onChange={set("key_features")}
            />
          </div>
        </section>

        <Button type="submit" size="lg" disabled={loading}>
          <Sparkles className="size-4" />
          {loading ? "Generating…" : "Generate content"}
        </Button>
      </form>
    </div>
  );
}
