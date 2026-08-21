import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/pricing")({
  head: () => ({
    meta: [
      { title: "Plans — Realign" },
      {
        name: "description",
        content: "Free includes 5 listings and 3 images a month. Pro is unlimited for $29/mo.",
      },
      { property: "og:title", content: "Plans — Realign" },
      { property: "og:description", content: "Upgrade to Pro for unlimited listings and images." },
    ],
  }),
  component: PricingPage,
});

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    perks: ["5 listings per month", "3 branded images per month", "Brand voice profile", "Copy & export"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    perks: [
      "Unlimited listings",
      "Unlimited branded images",
      "Priority generation",
      "Full listings library",
    ],
  },
] as const;

function PricingPage() {
  const queryClient = useQueryClient();

  const { data: agent } = useQuery({
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

  const setPlan = async (plan: string) => {
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase.from("agents").update({ plan }).eq("id", auth.user!.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["agent"] });
    toast.success(plan === "pro" ? "You're on Pro" : "Switched to Free");
  };

  return (
    <div className="mx-auto max-w-4xl">
      <header className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">Plans</p>
        <h1 className="mt-2 text-3xl font-bold">Generate as much as you list</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Start free. Upgrade when your listing volume outgrows it.
        </p>
      </header>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {PLANS.map((plan) => {
          const current = (agent?.plan ?? "free") === plan.id;
          return (
            <div
              key={plan.id}
              className={cn(
                "rounded-xl border bg-card p-7 shadow-[var(--shadow-card)]",
                plan.id === "pro" && "border-accent shadow-[var(--shadow-lift)]",
              )}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">{plan.name}</h2>
                {current && <Badge variant="secondary">Current</Badge>}
              </div>
              <p className="mt-3 text-3xl font-bold">
                {plan.price}
                <span className="text-sm font-medium text-muted-foreground">/mo</span>
              </p>
              <ul className="mt-6 space-y-2.5 text-sm">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                    <span className="text-muted-foreground">{perk}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-7 w-full"
                variant={plan.id === "pro" ? "default" : "outline"}
                disabled={current}
                onClick={() => setPlan(plan.id)}
              >
                {current ? "Your plan" : plan.id === "pro" ? "Upgrade to Pro" : "Switch to Free"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
