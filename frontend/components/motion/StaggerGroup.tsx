"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";
import { createStaggerContainer } from "@/lib/motion/variants";
import { MOTION_DURATIONS } from "@/lib/motion/tokens";

interface StaggerGroupProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
  staggerInterval?: number;
  delayChildren?: number;
  className?: string;
  amount?: number | "some" | "all";
  once?: boolean;
}

export default function StaggerGroup({
  children,
  staggerInterval = MOTION_DURATIONS.staggerNormal,
  delayChildren = 0.05,
  className = "",
  amount = 0.15,
  once = true,
  ...rest
}: StaggerGroupProps) {
  const shouldReduceMotion = useReducedMotion();
  const containerVariants = createStaggerContainer(staggerInterval, delayChildren);

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
