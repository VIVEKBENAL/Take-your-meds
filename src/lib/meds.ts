import { useSyncExternalStore } from "react";
import { addDays, format, differenceInCalendarDays, parseISO } from "date-fns";

export type Med = { id: string; name: string; dose: string; times: string[]; note?: string };
export type Course = { id: string; name: string; startDate: string; days: number; meds: Med[] };
export type LogEntry = { status: "taken" | "skipped"; at: number };
export type State = { courses: Course[]; logs: Record<string, LogEntry> };
export type Dose = { key: string; course: Course; med: Med; date: string; time: string; log: LogEntry | undefined };

const KEY = "take-your-meds-v1";
const empty: State = { courses: [], logs: {} };
let state: State = empty;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = JSON.parse(raw);
  } catch {}
}
function set(next: State) {
  state = next;
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}
export function useMeds(): State {
  return useSyncExternalStore(
    (l) => { load(); listeners.add(l); l(); return () => listeners.delete(l); },
    () => { load(); return state; },
    () => empty,
  );
}
export const uid = () => Math.random().toString(36).slice(2, 10);
export const today = () => format(new Date(), "yyyy-MM-dd");

export function saveCourse(c: Course) {
  load();
  const exists = state.courses.some((x) => x.id === c.id);
  set({ ...state, courses: exists ? state.courses.map((x) => (x.id === c.id ? c : x)) : [...state.courses, c] });
}
export function deleteCourse(id: string) {
  load();
  set({ ...state, courses: state.courses.filter((c) => c.id !== id) });
}
export function logDose(key: string, status: LogEntry["status"] | null) {
  load();
  const logs = { ...state.logs };
  if (status) logs[key] = { status, at: Date.now() };
  else delete logs[key];
  set({ ...state, logs });
}
export function resetAll() { set(empty); }

export function courseEnd(c: Course) {
  return format(addDays(parseISO(c.startDate), c.days - 1), "yyyy-MM-dd");
}
export function isActive(c: Course, date: string) {
  const d = differenceInCalendarDays(parseISO(date), parseISO(c.startDate));
  return d >= 0 && d < c.days;
}
export function dosesFor(s: State, date: string): Dose[] {
  const out: Dose[] = [];
  for (const course of s.courses) {
    if (!isActive(course, date)) continue;
    for (const med of course.meds)
      for (const time of med.times) {
        const key = `${med.id}|${date}|${time}`;
        out.push({ key, course, med, date, time, log: s.logs[key] });
      }
  }
  return out.sort((a, b) => a.time.localeCompare(b.time));
}

export function loadDemo() {
  const start = format(addDays(new Date(), -2), "yyyy-MM-dd");
  const c1: Course = {
    id: uid(), name: "Antibiotic course", startDate: start, days: 7,
    meds: [
      { id: uid(), name: "Amoxicillin", dose: "500 mg", times: ["08:00", "14:00", "20:00"], note: "After food" },
      { id: uid(), name: "Probiotic", dose: "1 capsule", times: ["09:00"] },
    ],
  };
  const c2: Course = {
    id: uid(), name: "Daily vitamins", startDate: start, days: 30,
    meds: [{ id: uid(), name: "Vitamin D3", dose: "1000 IU", times: ["08:30"] }],
  };
  const s: State = { courses: [c1, c2], logs: {} };
  for (let i = -2; i < 0; i++) {
    const d = format(addDays(new Date(), i), "yyyy-MM-dd");
    dosesFor(s, d).forEach((x, j) => (s.logs[x.key] = { status: j % 5 === 3 ? "skipped" : "taken", at: Date.now() }));
  }
  set(s);
}
