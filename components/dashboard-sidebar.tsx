"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Flag, Home, ShieldCheck, Siren, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const items = [
  { label: "Overview", href: "/dashboard", icon: Home },
  { label: "Verify", href: "/dashboard/verify", icon: ShieldCheck },
  { label: "Reports", href: "/dashboard/reports", icon: Flag },
  { label: "Analytics", href: "/dashboard#analytics", icon: BarChart3 },
  { label: "Trending IDs", href: "/dashboard#trending", icon: TrendingUp }
];

type Props = {
  collapsed: boolean;
  onToggle: () => void;
};

export function DashboardSidebar({ collapsed, onToggle }: Props) {
  const path = usePathname();

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen border-r border-border/70 bg-card/50 p-4 backdrop-blur lg:block",
        collapsed ? "w-[90px]" : "w-[260px]"
      )}
    >
      <div className="mb-8 flex items-center justify-between">
        <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
          <Siren className="h-6 w-6 text-primary" />
          {!collapsed && <span className="font-semibold tracking-wide">FraudLens</span>}
        </div>
        <Button size="sm" variant="outline" onClick={onToggle}>
          {collapsed ? ">" : "<"}
        </Button>
      </div>
      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/dashboard" ? path === item.href : path.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center"
              )}
            >
              <Icon className="h-4 w-4" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
