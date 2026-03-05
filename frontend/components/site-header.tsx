import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-wide">
          <ShieldCheck className="h-5 w-5 text-primary" />
          FraudLens
        </Link>
        <nav className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="outline" size="sm">
            <Link href="/verify">Verify</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link href="/report">Report</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
            <Link href="/login">Login</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
