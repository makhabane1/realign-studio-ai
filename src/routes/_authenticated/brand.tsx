import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/brand")({
  head: () => ({
    meta: [
      { title: "Brand voice — Realign" },
      {
        name: "description",
        content: "Define your agent voice: tone, buyer type, visual style and brand colors.",
      },
      { property: "og:title", content: "Brand voice — Realign" },
      { property: "og:description", content: "Your voice profile powers every generation." },
    ],
  }),
  component: BrandPage,
});

const TONES = [
  "Luxury",
  "Friendly",
  "Direct",
  "Warm",
  "Data-driven",
  "Playful",
  "Editorial",
  "Concierge",
];
const STYLES = ["Minimal", "Bold", "Luxury", "Warm"];
const BUYERS = [
  "First-time buyers",
  "Luxury buyers",
  "Investors",
  "Downsizers",
  "Growing families",
  "Relocating professionals",
];

function BrandPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: agent, isPending } = useQuery({
    queryKey: ["agent"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .eq("id", auth.user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [name, setName] = useState("");
  const [brokerage, setBrokerage] = useState("");
  const [tones, setTones] = useState<string[]>([]);
  const [buyer, setBuyer] = useState("");
  const [style, setStyle] = useState("Minimal");
  const [colors, setColors] = useState<string[]>(["#12233F", "#C4653A"]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!agent) return;
    setName(agent.name);
    setBrokerage(agent.brokerage);
    setTones(agent.tone_tags);
    setBuyer(agent.buyer_type);
    setStyle(agent.visual_style);
    setColors(agent.brand_colors.length >= 2 ? agent.brand_colors : ["#12233F", "#C4653A"]);
  }, [agent]);

  const toggleTone = (tone: string) =>
    setTones((prev) =>
      prev.includes(tone) ? prev.filter((t) => t !== tone) : prev.length >= 3 ? prev : [...prev, tone],
    );

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("agents")
      .update({
        name,
        brokerage,
        tone_tags: tones,
        buyer_type: buyer,
        visual_style: style,
        brand_colors: colors,
        onboarded: true,
      })
      .eq("id", auth.user!.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["agent"] });
    toast.success("Voice profile saved");
    if (!agent?.onboarded) navigate({ to: "/new" });
  };

  if (isPending) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">Voice profile</p>
        <h1 className="mt-2 text-3xl font-bold">Your brand voice</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Everything Realign writes and designs follows these settings.
        </p>
      </header>

      <form onSubmit={save} className="mt-8 space-y-6">
        <section className="rounded-xl border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Agent name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brokerage">Brokerage</Label>
              <Input
                id="brokerage"
                value={brokerage}
                onChange={(e) => setBrokerage(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-6 shadow-[var(--shadow-card)]">
          <Label>Tone attributes <span className="text-muted-foreground">(up to 3)</span></Label>
          <div className="mt-3 flex flex-wrap gap-2">
            {TONES.map((tone) => (
              <button
                key={tone}
                type="button"
                onClick={() => toggleTone(tone)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  tones.includes(tone)
                    ? "border-accent bg-accent text-accent-foreground"
                    : "bg-background text-muted-foreground hover:border-accent/50",
                )}
              >
                {tone}
              </button>
            ))}
          </div>

          <Label className="mt-6 block">Target buyer</Label>
          <div className="mt-3 flex flex-wrap gap-2">
            {BUYERS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBuyer(b)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  buyer === b
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:border-primary/40",
                )}
              >
                {b}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-xl border bg-card p-6 shadow-[var(--shadow-card)]">
          <Label>Visual style</Label>
          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            {STYLES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStyle(s)}
                className={cn(
                  "rounded-lg border p-4 text-left text-sm font-semibold transition-all",
                  style === s ? "border-accent shadow-[var(--shadow-lift)]" : "hover:border-accent/40",
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <Label className="mt-6 block">Brand colors</Label>
          <div className="mt-3 flex gap-4">
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="color"
                  aria-label={`Brand color ${i + 1}`}
                  value={colors[i] ?? "#12233F"}
                  onChange={(e) =>
                    setColors((prev) => prev.map((c, idx) => (idx === i ? e.target.value : c)))
                  }
                  className="size-10 cursor-pointer rounded-md border bg-background"
                />
                <span className="font-mono text-xs text-muted-foreground">{colors[i]}</span>
              </div>
            ))}
          </div>
        </section>

        <Button type="submit" size="lg" disabled={saving}>
          {saving ? "Saving…" : "Save voice profile"}
        </Button>
      </form>
    </div>
  );
}
