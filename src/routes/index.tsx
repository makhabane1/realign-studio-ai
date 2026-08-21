import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Image as ImageIcon, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Realign — AI listing content studio for real estate agents" },
      {
        name: "description",
        content:
          "Turn one property input into an on-brand listing description, social caption, follow-up email and branded graphic.",
      },
      { property: "og:title", content: "Realign — AI listing content studio" },
      {
        property: "og:description",
        content: "On-brand listing content for agents, generated in seconds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const OUTPUTS = [
  { icon: FileText, title: "Listing description", body: "MLS-ready copy shaped by your tone." },
  { icon: MessageSquare, title: "Social caption", body: "Post-ready caption with hashtags." },
  { icon: Mail, title: "Follow-up email", body: "Warm nurture email for interested buyers." },
  { icon: ImageIcon, title: "Branded graphic", body: "Marketing image in your brand colors." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-lg font-extrabold tracking-tight">Realign</span>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/auth">Get started</Link>
          </Button>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 pb-20 pt-12 md:pt-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            For listing agents
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
            One property input. Every piece of marketing content.
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground">
            Realign learns your voice once, then writes listing descriptions, social captions and
            follow-up emails — and designs a matching branded graphic — for every new listing.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/auth">Start free</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth">See your studio</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Free plan: 5 listings and 3 branded images every month.
          </p>
        </section>

        <section className="border-y bg-card">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
            {OUTPUTS.map((item) => (
              <div key={item.title}>
                <item.icon className="size-5 text-accent" />
                <h2 className="mt-3 text-sm font-semibold">{item.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-2xl font-bold">How it works</h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              ["Set your voice", "Pick tone attributes, target buyer, visual style and brand colors."],
              ["Add the property", "Type, beds, baths, price, neighborhood and standout features."],
              ["Ship the content", "Copy, export or regenerate anything from your listings library."],
            ].map(([title, body], i) => (
              <li key={title} className="rounded-xl border bg-card p-6 shadow-[var(--shadow-card)]">
                <span className="text-xs font-semibold text-accent">0{i + 1}</span>
                <h3 className="mt-2 font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-xs text-muted-foreground">
          <span>Realign — AI content studio for real estate agents.</span>
          <Link to="/auth" className="hover:text-foreground">
            Sign in
          </Link>
        </div>
      </footer>
    </div>
  );
}
