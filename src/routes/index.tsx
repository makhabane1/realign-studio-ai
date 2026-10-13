import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Image as ImageIcon, Mail, MessageSquare, Sparkles, Check } from "lucide-react";
import hero from "@/assets/hero-home.jpg";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />

      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <span className="grid size-7 place-items-center rounded-lg bg-accent text-accent-foreground"><Sparkles className="size-4" /></span>
            Realign
          </span>
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex"><Link to="/auth">Sign in</Link></Button>
            <Button asChild size="sm" className="rounded-full"><Link to="/auth">Get started</Link></Button>
          </nav>
        </div>
      </header>

      <main className="relative">
        <section className="mx-auto max-w-6xl px-6 pb-16 pt-16 text-center md:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="size-1.5 rounded-full bg-accent" /> AI content studio for listing agents
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
            One property. <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">Every piece</span> of marketing.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
            Realign learns your voice once, then writes descriptions, captions and follow-up emails — and designs a matching branded graphic — for every listing.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-full px-6 shadow-[var(--shadow-lift)]">
              <Link to="/auth">Start free <ArrowRight className="size-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-6"><Link to="/auth">See your studio</Link></Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Free: 5 listings + 3 branded images a month. No card needed.</p>
        </section>

        <section className="mx-auto max-w-6xl px-6">
          <div className="relative overflow-hidden rounded-3xl border shadow-[var(--shadow-lift)]">
            <img src={hero} alt="Modern home at golden hour" width={1600} height={1008} className="h-[280px] w-full object-cover md:h-[480px]" />
            <div className="absolute inset-x-4 bottom-4 max-w-md rounded-2xl border border-border/60 bg-card/85 p-5 text-left backdrop-blur-xl md:inset-x-auto md:left-8 md:bottom-8">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-accent"><Sparkles className="size-3.5" /> Generated in 12s</p>
              <p className="mt-2 text-sm font-semibold">Sunset-wrapped modern retreat with ocean glimpses</p>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">Floor-to-ceiling glass frames golden-hour light across an open living space designed for slow evenings…</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-24">
          <h2 className="max-w-lg text-3xl font-bold tracking-tight md:text-4xl">Four assets from a single input.</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {OUTPUTS.map((item) => (
              <div key={item.title} className="group rounded-2xl border bg-card p-6 transition hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
                <span className="grid size-10 place-items-center rounded-xl bg-accent/10 text-accent transition group-hover:bg-accent group-hover:text-accent-foreground">
                  <item.icon className="size-5" />
                </span>
                <h3 className="mt-5 font-semibold">{item.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="grid gap-10 rounded-3xl bg-primary p-8 text-primary-foreground md:grid-cols-2 md:p-14">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
              <p className="mt-3 text-primary-foreground/70">Set up in two minutes. Ship every listing in seconds.</p>
              <Button asChild size="lg" variant="secondary" className="mt-8 rounded-full"><Link to="/auth">Create your studio</Link></Button>
            </div>
            <ol className="space-y-5">
              {[
                ["Set your voice", "Tone, target buyer, visual style and brand colors."],
                ["Add the property", "Beds, baths, price, neighborhood and standout features."],
                ["Ship the content", "Edit, copy, export or share from your library."],
              ].map(([title, body], i) => (
                <li key={title} className="flex gap-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold text-accent-foreground">{i + 1}</span>
                  <div><h3 className="font-semibold">{title}</h3><p className="text-sm text-primary-foreground/70">{body}</p></div>
                </li>
              ))}
              <li className="flex items-center gap-2 pt-2 text-sm text-primary-foreground/70"><Check className="size-4 text-accent" /> Neighborhood highlights & monthly market newsletters included</li>
            </ol>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-xs text-muted-foreground">
          <span>© Realign — AI content studio for real estate agents.</span>
          <Link to="/auth" className="hover:text-foreground">Sign in</Link>
        </div>
      </footer>
    </div>
  );
}
