import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Newspaper, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateMarketUpdate } from "@/lib/market.functions";
import { CopyBlock } from "@/components/realign/CopyBlock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/market")({
  head: () => ({
    meta: [
      { title: "Market update newsletter — Realign" },
      {
        name: "description",
        content:
          "Turn monthly market stats into a client-friendly newsletter written in your brand voice.",
      },
      { property: "og:title", content: "Market update newsletter — Realign" },
      {
        property: "og:description",
        content: "A few stats in, a polished client newsletter out.",
      },
    ],
  }),
  component: MarketUpdatePage,
});

function MarketUpdatePage() {
  const queryClient = useQueryClient();
  const generate = useServerFn(generateMarketUpdate);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<{ id: string; period: string; newsletter: string } | null>(
    null,
  );
  const [form, setForm] = useState({
    period: "",
    area: "",
    median_price: "",
    days_on_market: "",
    inventory: "",
    notes: "",
  });

  const { data: history, isPending } = useQuery({
    queryKey: ["market_updates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("market_updates")
        .select("id, period, newsletter, stats, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await generate({ data: form });
      toast.success("Newsletter generated");
      setSelected({ id: result.id, period: form.period, newsletter: result.newsletter });
      await queryClient.invalidateQueries({ queryKey: ["market_updates"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">Digest</p>
        <h1 className="mt-2 text-3xl font-bold">Market update newsletter</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Drop in a few monthly stats — Realign writes a client-friendly digest in your voice.
        </p>
      </header>

      <form onSubmit={submit} className="mt-8 space-y-6">
        <section className="space-y-4 rounded-xl border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="period">Period</Label>
              <Input
                id="period"
                required
                placeholder="August 2026"
                value={form.period}
                onChange={set("period")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Area</Label>
              <Input
                id="area"
                required
                placeholder="Highland Park, Los Angeles"
                value={form.area}
                onChange={set("area")}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="median">Median price</Label>
              <Input
                id="median"
                placeholder="$1.15M"
                value={form.median_price}
                onChange={set("median_price")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dom">Days on market</Label>
              <Input
                id="dom"
                placeholder="21"
                value={form.days_on_market}
                onChange={set("days_on_market")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inventory">Inventory</Label>
              <Input
                id="inventory"
                placeholder="2.1 months of supply"
                value={form.inventory}
                onChange={set("inventory")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="Rates eased slightly, well-priced homes still getting multiple offers…"
              value={form.notes}
              onChange={set("notes")}
            />
          </div>
        </section>

        <Button type="submit" size="lg" disabled={loading}>
          <Newspaper className="size-4" />
          {loading ? "Writing newsletter…" : "Generate newsletter"}
        </Button>
      </form>

      {selected && (
        <div className="mt-8">
          <CopyBlock
            label={`Newsletter — ${selected.period}`}
            value={selected.newsletter}
            filename={`market-update-${selected.period.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`}
          />
        </div>
      )}

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Past newsletters</h2>
        {isPending ? (
          <div className="mt-4 space-y-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : !history?.length ? (
          <p className="mt-4 rounded-xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
            Nothing here yet — your generated newsletters will appear in this list.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {history.map((update) => {
              const stats = (update.stats ?? {}) as Record<string, string>;
              const isActive = selected?.id === update.id;
              return (
                <li key={update.id}>
                  <button
                    type="button"
                    onClick={() =>
                      setSelected({
                        id: update.id,
                        period: update.period,
                        newsletter: update.newsletter,
                      })
                    }
                    className={`w-full rounded-xl border bg-card p-4 text-left shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-lift)] ${
                      isActive ? "ring-2 ring-accent" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{update.period}</p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(update.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[stats["area"], stats["median_price"], stats["days_on_market"] && `${stats["days_on_market"]} DOM`]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
