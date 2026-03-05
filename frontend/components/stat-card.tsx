import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/animated-counter";

type Props = {
  label: string;
  value: number;
  suffix?: string;
};

export function StatCard({ label, value, suffix }: Props) {
  return (
    <Card>
      <CardDescription>{label}</CardDescription>
      <CardTitle className="mt-2 text-3xl">
        <AnimatedCounter value={value} suffix={suffix} />
      </CardTitle>
    </Card>
  );
}
