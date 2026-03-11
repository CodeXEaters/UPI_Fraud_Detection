"use client";

import { buildApiUrl } from "@/lib/api";
import { useEffect, useState } from "react";

export function RecentActivity() {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const res = await fetch(buildApiUrl("/verifications"));
        const data = await res.json();
        setActivities(data);
      } catch (error) {
        console.error("Failed to fetch activities", error);
      }
    }

    fetchActivities();
  }, []);

  return (
    <div className="mt-6 rounded-xl border border-border/70 bg-muted/20 p-4">
      <h3 className="mb-4 text-lg font-semibold">Live Verification Logs</h3>

      <div className="space-y-2">
        {activities.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-sm"
          >
            <span>{item.upi_id}</span>

            <span>{item.prediction}</span>

            <span>{item.risk_score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
