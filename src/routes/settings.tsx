import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { testAlarm } from "@/components/Alarm";
import { loadDemo, resetAll } from "@/lib/meds";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Take Your Meds" },
      { name: "description", content: "Notifications, test alarm and on-device data controls." },
      { property: "og:title", content: "Settings — Take Your Meds" },
      { property: "og:description", content: "Everything stays on your device." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [perm, setPerm] = useState("unknown");
  useEffect(() => setPerm("Notification" in window ? Notification.permission : "unsupported"), []);

  return (
    <Shell title="Settings">
      <div className="space-y-3">
        <Card title="Notifications" text={`Status: ${perm}. Alarms also ring while the app is open.`}>
          <Button disabled={perm !== "default"} onClick={async () => setPerm(await Notification.requestPermission())}>Allow notifications</Button>
        </Card>
        <Card title="Test alarm" text="Check the sound and vibration on your phone.">
          <Button variant="outline" onClick={testAlarm}>Ring now</Button>
        </Card>
        <Card title="Install on your phone" text="In your browser menu, choose “Add to Home Screen” to open it like an app." />
        <Card title="Your data" text="All courses and history are saved only on this device. Nothing is uploaded.">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => confirm("Replace your data with demo data?") && loadDemo()}>Load demo</Button>
            <Button variant="ghost" className="text-destructive" onClick={() => confirm("Erase everything?") && resetAll()}>Erase all</Button>
          </div>
        </Card>
      </div>
    </Shell>
  );
}

function Card({ title, text, children }: { title: string; text: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm">
      <p className="font-semibold">{title}</p>
      <p className="mb-3 text-sm text-muted-foreground">{text}</p>
      {children}
    </div>
  );
}
