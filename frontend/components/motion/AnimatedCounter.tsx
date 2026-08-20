"use client";

import React, { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
}

export default function AnimatedCounter({
  value,
  duration = 1.6,
  prefix = "",
  suffix = "",
  className = "",
  decimals = 0,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const ref = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number>(0);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    // Reduced-motion: no animation needed — value is rendered directly in JSX.
    if (shouldReduceMotion) return;
    if (!isInView) return;

    const start = 0;
    const startTime = performance.now();
    const durationMs = duration * 1000;

    let cancelled = false;

    const updateCounter = (currentTime: number) => {
      if (cancelled) return;

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);

      // Ease-out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = start + (value - start) * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(updateCounter);
      } else {
        setDisplayValue(value);
      }
    };

    rafRef.current = requestAnimationFrame(updateCounter);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
    };
  }, [isInView, value, duration, shouldReduceMotion]);

  // When reduced motion is preferred, display the final value directly.
  const resolvedValue = shouldReduceMotion ? value : displayValue;

  const formatted =
    decimals > 0
      ? resolvedValue.toFixed(decimals)
      : Math.round(resolvedValue).toLocaleString();

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
