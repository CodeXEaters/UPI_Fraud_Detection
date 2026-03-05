"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Chrome, Loader2, Mail, Lock } from "lucide-react";
import { getSession, signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm({ googleEnabled = true }: { googleEnabled?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingCredentials, setLoadingCredentials] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const onCredentialsLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter email and password.");
      return;
    }

    setLoadingCredentials(true);
    const response = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    const session = await getSession();
    setLoadingCredentials(false);

    if (!response?.error && session?.user) {
      toast.success("Login successful.");
      router.push("/dashboard");
      router.refresh();
      return;
    }

    toast.error("Invalid email or password.");
  };

  const onGoogleLogin = async () => {
    setLoadingGoogle(true);
    await signIn("google", { callbackUrl: "/dashboard" });
    setLoadingGoogle(false);
  };

  return (
    <div className="mt-6 space-y-4">
      <form onSubmit={onCredentialsLogin} className="space-y-3">
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 pl-9"
            autoComplete="email"
          />
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 pl-9"
            autoComplete="current-password"
          />
        </div>
        <Button type="submit" size="lg" className="w-full gap-2" disabled={loadingCredentials}>
          {loadingCredentials && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in with Email
        </Button>
      </form>

      {googleEnabled && (
        <>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            OR
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full gap-2"
            onClick={onGoogleLogin}
            disabled={loadingGoogle}
          >
            {loadingGoogle ? <Loader2 className="h-4 w-4 animate-spin" /> : <Chrome className="h-4 w-4" />}
            Continue with Google
          </Button>
        </>
      )}
    </div>
  );
}
