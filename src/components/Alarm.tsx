import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { BellRing, Check, Clock, X } from "lucide-react";
import { dosesFor, logDose, today, useMeds, type Dose } from "@/lib/meds";
import { Button } from "@/components/ui/button";

const snoozed = new Map<string, number>();
let forced: (() => void) | null = null;
export function testAlarm() { forced?.(); }

function beepLoop() {
  const Ctx = window.AudioContext || (window as any).webkitAudioContext;
  const ctx = new Ctx();
  const tick = () => {
    [0, 0.25].forEach((t) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.frequency.value = 880; o.type = "sine";
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.2);
      o.connect(g).connect(ctx.destination); o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.22);
    });
    navigator.vibrate?.([200, 100, 200]);
  };
  tick();
  const id = setInterval(tick, 1500);
  return () => { clearInterval(id); ctx.close(); };
}

export function AlarmWatcher() {
  const s = useMeds();
  const [due, setDue] = useState<Dose[]>([]);
  const [test, setTest] = useState(false);
  const notified = useRef(new Set<string>());

  useEffect(() => { forced = () => setTest(true); return () => { forced = null; }; }, []);

  useEffect(() => {
    const check = () => {
      const now = format(new Date(), "HH:mm");
      const from = format(new Date(Date.now() - 60 * 60000), "HH:mm");
      const list = dosesFor(s, today()).filter(
        (d) => !d.log && d.time <= now && (from > now || d.time >= from) && (snoozed.get(d.key) ?? 0) < Date.now(),
      );
      setDue(list);
      list.forEach((d) => {
        if (notified.current.has(d.key)) return;
        notified.current.add(d.key);
        if ("Notification" in window && Notification.permission === "granted")
          new Notification(`Time for ${d.med.name}`, { body: `${d.med.dose} · ${d.time}` });
      });
    };
    check();
    const id = setInterval(check, 15000);
    return () => clearInterval(id);
  }, [s]);

  const open = test || due.length > 0;
  useEffect(() => (open ? beepLoop() : undefined), [open]);
  if (!open) return null;

  const close = () => setTest(false);
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-primary p-6 text-primary-foreground">
      <div className="mt-10 flex flex-col items-center text-center">
        <BellRing className="h-16 w-16 animate-bounce" />
        <h2 className="mt-4 font-display text-4xl">Time to take your meds</h2>
        <p className="mt-1 opacity-80">{format(new Date(), "EEEE, h:mm a")}</p>
      </div>
      <div className="mt-8 flex-1 space-y-3 overflow-auto">
        {test && due.length === 0 && (
          <div className="rounded-2xl bg-primary-foreground/10 p-4">Test alarm — sound and vibration working.</div>
        )}
        {due.map((d) => (
          <div key={d.key} className="rounded-2xl bg-primary-foreground/10 p-4">
            <div className="flex justify-between"><b className="text-lg">{d.med.name}</b><span>{d.time}</span></div>
            <p className="opacity-80">{d.med.dose}{d.med.note ? ` · ${d.med.note}` : ""}</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <Button variant="secondary" onClick={() => logDose(d.key, "taken")}><Check />Taken</Button>
              <Button variant="secondary" onClick={() => { snoozed.set(d.key, Date.now() + 10 * 60000); setDue((x) => x.filter((y) => y.key !== d.key)); }}><Clock />10 min</Button>
              <Button variant="secondary" onClick={() => logDose(d.key, "skipped")}><X />Skip</Button>
            </div>
          </div>
        ))}
      </div>
      {test && <Button variant="secondary" size="lg" onClick={close}>Dismiss</Button>}
    </div>
  );
}
