import { Link } from "@tanstack/react-router";
import { CalendarCheck, History, Pill, Settings } from "lucide-react";
import type { ReactNode } from "react";

const tabs = [
  { to: "/", label: "Today", icon: CalendarCheck },
  { to: "/courses", label: "Courses", icon: Pill },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function Shell({ title, sub, children, action }: { title: string; sub?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-md pb-24">
      <header className="flex items-end justify-between px-5 pb-4 pt-8">
        <div>
          {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
          <h1 className="font-display text-3xl text-foreground">{title}</h1>
        </div>
        {action}
      </header>
      <main className="px-5">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {tabs.map((t) => (
            <Link key={t.to} to={t.to} className="flex flex-col items-center gap-1 py-3 text-xs text-muted-foreground"
              activeProps={{ className: "text-primary font-semibold" }} activeOptions={{ exact: true }}>
              <t.icon className="h-5 w-5" />{t.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
