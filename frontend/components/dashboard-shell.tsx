"use client";

import { type ReactNode, useState } from "react";
import { DashboardSettingsPanel } from "@/components/dashboard-settings-panel";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard-topbar";

export function DashboardShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <main className="flex min-h-screen">
      <DashboardSidebar collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />
      <div className="w-full flex-1 p-4 sm:p-6">
        <div className="mx-auto w-full max-w-7xl space-y-6">
          <DashboardTopbar onOpenSettings={() => setSettingsOpen(true)} />
          {children}
        </div>
      </div>
      <DashboardSettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </main>
  );
}
