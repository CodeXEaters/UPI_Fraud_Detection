"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function DashboardSettingsPanel({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/50 p-4 backdrop-blur-sm">
      <div className="ml-auto h-full w-full max-w-md">
        <Card id="settings" className="flex h-full flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <CardTitle>Settings</CardTitle>
              <CardDescription className="mt-1">Manage dashboard and alert preferences.</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-9 w-9 rounded-full p-0" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/20 px-3 py-3 text-sm">
              Email Alerts
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-cyan-500" />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/20 px-3 py-3 text-sm">
              Push Notifications
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-cyan-500" />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/20 px-3 py-3 text-sm">
              Auto-refresh Dashboard
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-cyan-500" />
            </label>
            <label className="block rounded-xl border border-border/70 bg-muted/20 px-3 py-3 text-sm">
              Risk Threshold
              <select className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-2 text-sm">
                <option>High (80+)</option>
                <option>Medium (50+)</option>
                <option>Low (30+)</option>
              </select>
            </label>
          </div>

          <div className="mt-auto pt-4">
            <Button className="w-full" onClick={onClose}>
              Save Settings
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
