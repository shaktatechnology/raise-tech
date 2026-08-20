"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";
import { pageIntroVariants } from "@/lib/motion/variants";
import { MOTION_DURATIONS, MOTION_EASINGS } from "@/lib/motion/tokens";

interface PageIntroProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function PageIntro({
  children,
  className = "",
  delay = 0.05,
  ...rest
}: PageIntroProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={pageIntroVariants}
      initial="hidden"
      animate="visible"
      transition={{
        duration: MOTION_DURATIONS.medium,
        delay,
        ease: MOTION_EASINGS.easeOutSmooth,
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
