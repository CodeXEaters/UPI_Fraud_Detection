import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import { LoginForm } from "@/components/login-form";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function LoginPage() {
  const session = await auth();
  const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span className="font-semibold tracking-wide">FraudLens</span>
        </div>
        <CardTitle className="text-2xl">Login to FraudLens</CardTitle>
        <CardDescription className="mt-2">
          Sign in with email/password or Google to access verification history and dashboard analytics.
        </CardDescription>
        <LoginForm googleEnabled={googleEnabled} />

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Demo email login uses credentials from `.env.local`.
        </p>
        <Button asChild variant="outline" className="mt-4 w-full">
          <Link href="/">Back to Home</Link>
        </Button>
      </Card>
    </main>
  );
}
