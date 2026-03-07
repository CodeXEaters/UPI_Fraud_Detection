"use client";

import { Bell, LogOut, Settings2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

type Props = {
  onOpenSettings: () => void;
};

export function DashboardTopbar({ onOpenSettings }: Props) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between rounded-2xl border border-border/70 bg-card/80 px-4 py-3 shadow-soft backdrop-blur">
      <div>
        <p className="text-sm text-muted-foreground">Real-time protection intelligence</p>
        <h1 className="text-xl font-semibold">FraudLens Dashboard</h1>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="outline" size="sm" className="h-10 w-10 rounded-full p-0">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" className="gap-2" onClick={onOpenSettings}>
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
