import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Listings library — Realign" },
      {
        name: "description",
        content: "Every listing you've generated, with descriptions, captions, emails and graphics.",
      },
      { property: "og:title", content: "Listings library — Realign" },
      { property: "og:description", content: "Browse and reuse your generated listing content." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data, isPending } = useQuery({
    queryKey: ["listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("id, title, status, created_at, property_details, description")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Library</p>
          <h1 className="mt-2 text-3xl font-bold">Your listings</h1>
        </div>
        <Button asChild>
          <Link to="/new">
            <Sparkles className="size-4" /> New listing
          </Link>
        </Button>
      </header>

      {isPending ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : !data?.length ? (
        <div className="mt-10 rounded-xl border border-dashed bg-card p-12 text-center">
          <h2 className="text-lg font-semibold">No listings yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Add one property and Realign writes the description, caption, email and a branded
            graphic in your voice.
          </p>
          <Button asChild className="mt-6">
            <Link to="/new">Generate your first listing</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {data.map((listing) => {
            const details = (listing.property_details ?? {}) as Record<string, string>;
            return (
              <Link
                key={listing.id}
                to="/listings/$id"
                params={{ id: listing.id }}
                className="rounded-xl border bg-card p-5 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-lift)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold leading-snug">{listing.title || "Untitled listing"}</h2>
                  <Badge variant="secondary">{listing.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {[details['property_type'], details['neighborhood'], details['price']]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                  {listing.description}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
