import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { Check, Undo2, X } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { dosesFor, logDose, today, useMeds } from "@/lib/meds";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today — Take Your Meds" },
      { name: "description", content: "See today's medicine doses and mark them taken. Works fully offline on your phone." },
      { property: "og:title", content: "Today — Take Your Meds" },
      { property: "og:description", content: "Private, on-device medicine reminders." },
    ],
  }),
  component: Today,
});

function Today() {
  const s = useMeds();
  const doses = dosesFor(s, today());
  const done = doses.filter((d) => d.log).length;
  const now = format(new Date(), "HH:mm");

  return (
    <Shell title="Today" sub={format(new Date(), "EEEE, d MMMM")}>
      {doses.length === 0 ? (
        <div className="rounded-3xl bg-card p-8 text-center shadow-sm">
          <p className="font-display text-xl">No doses today</p>
          <p className="mt-1 text-sm text-muted-foreground">Add a course to start getting reminders.</p>
          <Button asChild className="mt-4"><Link to="/courses">Add a course</Link></Button>
        </div>
      ) : (
        <>
          <div className="mb-5 rounded-3xl bg-primary p-5 text-primary-foreground">
            <p className="text-sm opacity-80">Progress</p>
            <p className="font-display text-4xl">{done}<span className="text-xl opacity-70"> / {doses.length} doses</span></p>
            <div className="mt-3 h-2 rounded-full bg-primary-foreground/20">
              <div className="h-2 rounded-full bg-accent transition-all" style={{ width: `${(done / doses.length) * 100}%` }} />
            </div>
          </div>
          <ul className="space-y-3">
            {doses.map((d) => {
              const late = !d.log && d.time < now;
              return (
                <li key={d.key} className={`rounded-2xl bg-card p-4 shadow-sm ${d.log ? "opacity-60" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className={`rounded-xl px-2.5 py-1.5 text-sm font-semibold ${late ? "bg-destructive/15 text-destructive" : "bg-secondary text-secondary-foreground"}`}>{d.time}</div>
                    <div className="flex-1">
                      <p className="font-semibold">{d.med.name} <span className="font-normal text-muted-foreground">· {d.med.dose}</span></p>
                      <p className="text-xs text-muted-foreground">{d.course.name}{d.med.note ? ` · ${d.med.note}` : ""}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {d.log ? (
                      <>
                        <span className="flex-1 self-center text-sm">{d.log.status === "taken" ? "✓ Taken" : "Skipped"} at {format(d.log.at, "h:mm a")}</span>
                        <Button size="sm" variant="ghost" onClick={() => logDose(d.key, null)}><Undo2 />Undo</Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" className="flex-1" onClick={() => logDose(d.key, "taken")}><Check />Taken</Button>
                        <Button size="sm" variant="outline" onClick={() => logDose(d.key, "skipped")}><X />Skip</Button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Shell>
  );
}
