import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { courseEnd, deleteCourse, isActive, saveCourse, today, uid, useMeds, type Course } from "@/lib/meds";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Courses — Take Your Meds" },
      { name: "description", content: "Create medicine courses with doses, times and duration." },
      { property: "og:title", content: "Courses — Take Your Meds" },
      { property: "og:description", content: "Set up your medicine schedule in seconds." },
    ],
  }),
  component: Courses,
});

const blank = (): Course => ({
  id: uid(), name: "", startDate: today(), days: 7,
  meds: [{ id: uid(), name: "", dose: "", times: ["08:00"] }],
});

function Courses() {
  const s = useMeds();
  const [edit, setEdit] = useState<Course | null>(null);

  return (
    <Shell title="Courses" action={<Button size="sm" onClick={() => setEdit(blank())}><Plus />New</Button>}>
      {s.courses.length === 0 && <p className="text-muted-foreground">No courses yet. Tap “New” to add one.</p>}
      <ul className="space-y-3">
        {s.courses.map((c) => (
          <li key={c.id} className="rounded-2xl bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-xl">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {format(parseISO(c.startDate), "d MMM")} – {format(parseISO(courseEnd(c)), "d MMM")} · {c.days} days
                  {isActive(c, today()) ? " · Active" : ""}
                </p>
              </div>
              <div className="flex">
                <Button size="icon" variant="ghost" onClick={() => setEdit(structuredClone(c))}><Pencil /></Button>
                <Button size="icon" variant="ghost" onClick={() => confirm(`Delete ${c.name}?`) && deleteCourse(c.id)}><Trash2 /></Button>
              </div>
            </div>
            <ul className="mt-2 space-y-1 text-sm">
              {c.meds.map((m) => (
                <li key={m.id}>💊 <b>{m.name}</b> {m.dose} — {m.times.join(", ")}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <Sheet open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <SheetContent side="bottom" className="max-h-[92vh] overflow-auto rounded-t-3xl">
          <SheetHeader><SheetTitle className="font-display text-2xl">Course</SheetTitle></SheetHeader>
          {edit && <Editor c={edit} onChange={setEdit} onDone={() => setEdit(null)} />}
        </SheetContent>
      </Sheet>
    </Shell>
  );
}

function Editor({ c, onChange, onDone }: { c: Course; onChange: (c: Course) => void; onDone: () => void }) {
  const upMed = (i: number, patch: Partial<Course["meds"][0]>) =>
    onChange({ ...c, meds: c.meds.map((m, j) => (j === i ? { ...m, ...patch } : m)) });
  const valid = c.name.trim() && c.days > 0 && c.meds.every((m) => m.name.trim() && m.times.length);

  return (
    <div className="space-y-4 px-4 pb-6">
      <div><Label>Course name</Label><Input value={c.name} placeholder="e.g. Antibiotics" onChange={(e) => onChange({ ...c, name: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Start</Label><Input type="date" value={c.startDate} onChange={(e) => onChange({ ...c, startDate: e.target.value })} /></div>
        <div><Label>Days</Label><Input type="number" min={1} value={c.days} onChange={(e) => onChange({ ...c, days: +e.target.value })} /></div>
      </div>
      {c.meds.map((m, i) => (
        <div key={m.id} className="space-y-2 rounded-2xl bg-secondary p-3">
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Medicine" value={m.name} onChange={(e) => upMed(i, { name: e.target.value })} />
            <Input placeholder="Dose (500 mg)" value={m.dose} onChange={(e) => upMed(i, { dose: e.target.value })} />
          </div>
          <Input placeholder="Note (after food)" value={m.note ?? ""} onChange={(e) => upMed(i, { note: e.target.value })} />
          <div className="flex flex-wrap items-center gap-2">
            {m.times.map((t, k) => (
              <div key={k} className="flex items-center">
                <Input type="time" className="w-28" value={t} onChange={(e) => upMed(i, { times: m.times.map((x, y) => (y === k ? e.target.value : x)).sort() })} />
                <Button size="icon" variant="ghost" onClick={() => upMed(i, { times: m.times.filter((_, y) => y !== k) })}>×</Button>
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={() => upMed(i, { times: [...m.times, "12:00"].sort() })}>+ time</Button>
          </div>
          {c.meds.length > 1 && <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onChange({ ...c, meds: c.meds.filter((_, j) => j !== i) })}>Remove medicine</Button>}
        </div>
      ))}
      <Button variant="outline" className="w-full" onClick={() => onChange({ ...c, meds: [...c.meds, { id: uid(), name: "", dose: "", times: ["08:00"] }] })}><Plus />Add medicine</Button>
      <Button className="w-full" size="lg" disabled={!valid} onClick={() => { saveCourse(c); onDone(); }}>Save course</Button>
    </div>
  );
}
