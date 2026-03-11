"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BarChart3, BrainCircuit, ShieldCheck, Siren, Users, Zap } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/animated-counter";

const features = [
  {
    title: "Real-Time UPI Verification",
    icon: ShieldCheck,
    description: "Instantly score risk and fraud probability before every transaction."
  },
  {
    title: "Community Fraud Reporting",
    icon: Users,
    description: "Leverage crowdsourced intelligence from verified payment incidents."
  },
  {
    title: "Risk Score Engine",
    icon: Zap,
    description: "Behavioral signals and pattern analysis converted to a clear trust score."
  },
  {
    title: "Fraud Analytics Dashboard",
    icon: BarChart3,
    description: "Track fraud trends, risk distributions, and operational metrics."
  },
  {
    title: "AI Risk Explanation",
    icon: BrainCircuit,
    description: "Understand why an ID is risky with interpretable signal breakdowns."
  }
];

const stats = [
  { value: 1000000, suffix: "+", label: "UPI Checks" },
  { value: 98, suffix: "%", label: "Detection Accuracy" },
  { value: 50000, suffix: "+", label: "Fraud Reports" }
];

export default function LandingPage() {
  return (
    <main>
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="mx-auto flex min-h-[78vh] w-full max-w-7xl flex-col items-center justify-center px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm text-primary">
              <Siren className="h-4 w-4" />
              UPI Threat Intelligence
            </p>
            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">Verify UPI Before You Pay.</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              AI-powered real-time fraud detection to make digital payments safer.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/verify">Verify UPI</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/dashboard">View Dashboard</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16">
        <h2 className="mb-8 text-center text-3xl font-semibold">Why FraudLens</h2>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
              >
                <Card className="h-full">
                  <Icon className="h-6 w-6 text-primary" />
                  <CardTitle className="mt-3">{feature.title}</CardTitle>
                  <CardDescription className="mt-2">{feature.description}</CardDescription>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16">
        <div className="grid gap-5 md:grid-cols-3">
          {stats.map((item) => (
            <Card key={item.label} className="text-center">
              <p className="text-4xl font-semibold text-primary">
                <AnimatedCounter value={item.value} suffix={item.suffix} />
              </p>
              <p className="mt-2 text-muted-foreground">{item.label}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-20 pt-6 text-center">
        <Card className="border-primary/30 bg-primary/10">
          <h3 className="text-3xl font-semibold">Make Every Payment Safe</h3>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Add a trust layer before every UPI transfer with fast, explainable fraud signals.
          </p>
          <div className="mt-6">
            <Button asChild size="lg">
              <Link href="/verify">Start Verifying</Link>
            </Button>
          </div>
        </Card>
      </section>
    </main>
  );
}
