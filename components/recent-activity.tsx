import { Activity } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { recentLogs } from "@/lib/mock-data";

export function RecentActivity() {
  return (
    <Card id="trending">
      <CardTitle className="mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-primary" />
        Live Verification Logs
      </CardTitle>
      <div className="space-y-3">
        {recentLogs.map((log, index) => (
          <div key={log} className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/30 px-3 py-2 text-sm">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <p>{log}</p>
            <span className="ml-auto text-xs text-muted-foreground">{index + 1}m ago</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
