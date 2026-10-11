import { createFileRoute } from "@tanstack/react-router";
import { addDays, format } from "date-fns";
import { Shell } from "@/components/Shell";
import { dosesFor, useMeds } from "@/lib/meds";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — Take Your Meds" },
      { name: "description", content: "Review the doses you took or missed over the last two weeks." },
      { property: "og:title", content: "History — Take Your Meds" },
      { property: "og:description", content: "Your medicine adherence at a glance." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const s = useMeds();
  const days = Array.from({ length: 14 }, (_, i) => format(addDays(new Date(), -i), "yyyy-MM-dd"));
  const all = days.flatMap((d) => dosesFor(s, d));
  const taken = all.filter((d) => d.log?.status === "taken").length;

  return (
    <Shell title="History" sub="Last 14 days">
      <div className="mb-5 rounded-3xl bg-card p-5 shadow-sm">
        <p className="text-sm text-muted-foreground">Doses taken</p>
        <p className="font-display text-4xl">{all.length ? Math.round((taken / all.length) * 100) : 0}%</p>
      </div>
      <ul className="space-y-2">
        {days.map((d) => {
          const ds = dosesFor(s, d);
          if (!ds.length) return null;
          return (
            <li key={d} className="rounded-2xl bg-card p-4 shadow-sm">
              <p className="mb-2 text-sm font-semibold">{format(new Date(d + "T00:00"), "EEE, d MMM")}</p>
              <div className="flex flex-wrap gap-1.5">
                {ds.map((x) => (
                  <span key={x.key} title={`${x.med.name} ${x.time}`}
                    className={`rounded-lg px-2 py-1 text-xs ${x.log?.status === "taken" ? "bg-primary text-primary-foreground" : x.log?.status === "skipped" ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"}`}>
                    {x.time} {x.med.name}
                  </span>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </Shell>
  );
}
