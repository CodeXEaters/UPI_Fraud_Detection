"use client";

import { DashboardCharts } from "@/components/dashboard-charts";
import { RecentActivity } from "@/components/recent-activity";
import { StatCard } from "@/components/stat-card";
import { buildApiUrl } from "@/lib/api";
import { useEffect, useState } from "react";

export function DashboardOverview() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(buildApiUrl("/dashboard/stats"));
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    }

    fetchStats();
  }, []);

  const statItems = [
    {
      label: "Total Verifications",
      value: stats?.total_verifications ?? 0,
    },
    {
      label: "Fraud Detected",
      value: stats?.fraud_detected ?? 0,
    },
    {
      label: "Fraud Rate",
      value: stats?.fraud_rate ?? 0,
      suffix: "%",
    },
    {
      label: "Community Reports",
      value: stats?.community_reports ?? 0,
    },
  ];

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statItems.map((item) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            suffix={item.suffix}
          />
        ))}
      </section>

      <DashboardCharts />

      <RecentActivity />
    </>
  );
}
