"use client";

import { useEffect, useState } from "react";

type Props = {
  value: number;
  duration?: number;
  suffix?: string;
};

export function AnimatedCounter({ value, duration = 1000, suffix = "" }: Props) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const startAt = performance.now();

    const frame = (now: number) => {
      const progress = Math.min((now - startAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = value * eased;
      setCount(start);
      if (progress < 1) requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  }, [value, duration]);

  const shown = Number.isInteger(value) ? Math.round(count).toLocaleString() : count.toFixed(1);
  return <span>{shown + suffix}</span>;
}
