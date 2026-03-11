"use client";
import { useEffect, useState } from "react";

import { Card, CardTitle } from "@/components/ui/card";
import { buildApiUrl } from "@/lib/api";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const pieColors = ["#22c55e", "#f59e0b", "#ef4444"];

export function DashboardCharts() {
  const [trendData, setTrendData] = useState<any[]>([]);
  const [riskPieData, setRiskPieData] = useState<any[]>([]);
  const [heatmapHours, setHeatmapHours] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch(buildApiUrl("/analytics"));
        const data = await res.json();

        setTrendData(data.trend || []);
        setRiskPieData([
          { name: "safe", value: data.risk_distribution.safe },
          { name: "suspicious", value: data.risk_distribution.suspicious },
          { name: "fraud", value: data.risk_distribution.fraud },
        ]);
        setHeatmapHours(data.heatmap || []);
      } catch (err) {
        console.error("Analytics fetch failed", err);
      }
    }

    fetchAnalytics();
  }, []);
  return (
    <section id="analytics" className="grid gap-6 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardTitle className="mb-4">Fraud Trend</CardTitle>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="fraud"
                stroke="#ef4444"
                strokeWidth={2.4}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card>
        <CardTitle className="mb-4">Risk Distribution</CardTitle>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={riskPieData}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={96}
              >
                {riskPieData.map((entry: any, index: number) => (
                  <Cell
                    key={entry.name}
                    fill={pieColors[index % pieColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="xl:col-span-3">
        <CardTitle className="mb-4">24-Hour Fraud Heatmap</CardTitle>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={heatmapHours}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Bar dataKey="risk" fill="#f97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </section>
  );
}
