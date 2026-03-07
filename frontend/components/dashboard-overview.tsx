import { DashboardCharts } from "@/components/dashboard-charts";
import { RecentActivity } from "@/components/recent-activity";
import { StatCard } from "@/components/stat-card";
import { statItems } from "@/lib/mock-data";

export function DashboardOverview() {
  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statItems.map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} suffix={item.suffix} />
        ))}
      </section>
      <DashboardCharts />
      <RecentActivity />
    </>
  );
}
