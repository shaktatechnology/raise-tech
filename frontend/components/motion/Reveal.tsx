"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";
import {
  fadeInVariants,
  fadeUpVariants,
  fadeDownVariants,
  slideLeftVariants,
  slideRightVariants,
  scaleUpVariants,
} from "@/lib/motion/variants";
import { MOTION_DURATIONS, MOTION_EASINGS } from "@/lib/motion/tokens";

export type RevealVariant =
  | "fadeUp"
  | "fadeIn"
  | "fadeDown"
  | "slideLeft"
  | "slideRight"
  | "scaleUp";

interface RevealProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  className?: string;
  amount?: number | "some" | "all";
  once?: boolean;
}

const VARIANT_MAP = {
  fadeUp: fadeUpVariants,
  fadeIn: fadeInVariants,
  fadeDown: fadeDownVariants,
  slideLeft: slideLeftVariants,
  slideRight: slideRightVariants,
  scaleUp: scaleUpVariants,
};

export default function Reveal({
  children,
  variant = "fadeUp",
  delay = 0,
  duration,
  className = "",
  amount = 0.15,
  once = true,
  ...rest
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const selectedVariants = VARIANT_MAP[variant];

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={selectedVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      transition={{
        duration: duration ?? MOTION_DURATIONS.medium,
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
