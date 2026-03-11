import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret:
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV === "development" ? "fraudlens-dev-only-secret-change-in-prod" : undefined),
  providers: [
    ...(googleEnabled
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET
          })
        ]
      : []),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize(credentials) {
        const demoEmail = process.env.AUTH_DEMO_EMAIL ?? "demo@fraudlens.com";
        const demoPassword = process.env.AUTH_DEMO_PASSWORD ?? "Demo@12345";
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");

        if (email === demoEmail.toLowerCase() && password === demoPassword) {
          return {
            id: "demo-user",
            name: "Demo Analyst",
            email: demoEmail
          };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt"
  }
});
