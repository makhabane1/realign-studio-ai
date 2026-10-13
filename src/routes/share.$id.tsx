import { createFileRoute, notFound } from "@tanstack/react-router";
import { getSharedListing } from "@/lib/realign.functions";

export const Route = createFileRoute("/share/$id")({
  loader: async ({ params }) => {
    const listing = await getSharedListing({ data: { id: params.id } });
    if (!listing) throw notFound();
    return listing;
  },
  head: ({ loaderData }) => {
    const title = loaderData?.title ? `${loaderData.title} — Realign` : "Shared listing — Realign";
    const desc = (loaderData?.description ?? "A property listing shared via Realign.").slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-md p-16 text-center">
      <h1 className="text-xl font-semibold">This listing isn't available</h1>
      <p className="mt-2 text-sm text-muted-foreground">The link may have been turned off by the agent.</p>
    </div>
  ),
  component: SharePage,
});

function SharePage() {
  const l = Route.useLoaderData();
  const d = l.details ?? {};
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">
        {[l.agentName, l.brokerage].filter(Boolean).join(" · ")}
      </p>
      <h1 className="mt-2 text-3xl font-bold leading-tight md:text-4xl">{l.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {[d["property_type"], d["neighborhood"], d["bedrooms"] && `${d["bedrooms"]} bd`, d["bathrooms"] && `${d["bathrooms"]} ba`, d["price"]]
          .filter(Boolean)
          .join(" · ")}
      </p>
      {l.imageUrl && <img src={l.imageUrl} alt={l.title} className="mt-8 w-full rounded-xl border" />}
      <article className="mt-8 whitespace-pre-line leading-relaxed">{l.description}</article>
      {l.highlights && (
        <section className="mt-10 rounded-xl border bg-card p-6">
          <h2 className="text-sm font-semibold">About the neighborhood</h2>
          <div className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{l.highlights}</div>
        </section>
      )}
    </main>
  );
}
