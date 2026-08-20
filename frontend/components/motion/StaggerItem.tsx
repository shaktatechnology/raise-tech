"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";
import { staggerItemVariants } from "@/lib/motion/variants";

interface StaggerItemProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
  className?: string;
}

export default function StaggerItem({
  children,
  className = "",
  ...rest
}: StaggerItemProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={staggerItemVariants}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
