"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { buildApiUrl } from "@/lib/api";
import { Bell, LogOut, Settings2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

type Props = {
  onOpenSettings: () => void;
};

export function DashboardTopbar({ onOpenSettings }: Props) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await fetch(buildApiUrl("/fraud-alerts"));
        const data = await res.json();
        setAlerts(data);
      } catch (err) {
        console.error("Alert fetch error", err);
      }
    }

    fetchAlerts();
  }, []);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between rounded-2xl border border-border/70 bg-card/80 px-4 py-3 shadow-soft backdrop-blur">
      <div>
        <p className="text-sm text-muted-foreground">
          Real-time protection intelligence
        </p>
        <h1 className="text-xl font-semibold">FraudLens Dashboard</h1>
      </div>

      <div className="flex items-center gap-2 relative">
        <ThemeToggle />

        {/* Notification Button */}
        <Button
          variant="outline"
          size="sm"
          className="h-10 w-10 rounded-full p-0"
          onClick={() => setShowAlerts(!showAlerts)}
        >
          <Bell className="h-4 w-4" />
        </Button>

        {/* Alert Dropdown */}
        {showAlerts && alerts.length > 0 && (
          <div className="absolute right-0 top-12 w-72 rounded-xl border bg-card p-3 shadow-lg">
            <p className="text-sm font-semibold mb-2">Fraud Alerts</p>

            {alerts.map((a, i) => (
              <p key={i} className="text-sm text-red-400 border-b py-1">
                {a.message}
              </p>
            ))}
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={onOpenSettings}
        >
          <Settings2 className="h-4 w-4" />
          Settings
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}
