import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutGrid, Sparkles, Palette, Crown, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: StudioLayout,
});

const NAV = [
  { to: "/dashboard", label: "Listings", icon: LayoutGrid },
  { to: "/new", label: "New listing", icon: Sparkles },
  { to: "/brand", label: "Brand voice", icon: Palette },
  { to: "/pricing", label: "Plan", icon: Crown },
] as const;

function StudioLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = Route.useRouteContext();

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-sidebar px-4 py-6 text-sidebar-foreground md:flex">
        <Link to="/dashboard" className="px-2 text-lg font-extrabold tracking-tight">
          Realign
        </Link>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&.active]:bg-sidebar-accent [&.active]:text-sidebar-accent-foreground"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border pt-4">
          <p className="truncate px-3 text-xs text-sidebar-foreground/60">{user.email}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="mt-2 w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-2 border-b bg-card px-4 py-3 md:hidden">
          <Link to="/dashboard" className="text-base font-extrabold tracking-tight">
            Realign
          </Link>
          <nav className="flex gap-1">
            {NAV.map((item) => (
              <Link key={item.to} to={item.to} className="rounded-md p-2 text-muted-foreground [&.active]:text-accent">
                <item.icon className="size-4" />
              </Link>
            ))}
            <button onClick={signOut} className="rounded-md p-2 text-muted-foreground">
              <LogOut className="size-4" />
            </button>
          </nav>
        </header>
        <main className="min-w-0 flex-1 px-5 py-8 md:px-10 md:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
