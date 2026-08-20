"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";
import { MOTION_EASINGS } from "@/lib/motion/tokens";

interface HoverLiftProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
  lift?: number;
  scale?: number;
  className?: string;
}

export default function HoverLift({
  children,
  lift = -5,
  scale = 1.01,
  className = "",
  ...rest
}: HoverLiftProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      whileHover={{
        y: lift,
        scale,
        transition: { duration: 0.25, ease: MOTION_EASINGS.easeOutSmooth },
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.15, ease: "easeOut" },
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
