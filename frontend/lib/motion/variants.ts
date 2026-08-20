import type { Variants } from "motion/react";
import { MOTION_DURATIONS, MOTION_EASINGS } from "./tokens";

/**
 * Standard Motion Variants for Raise Tech
 * Hardware-accelerated (transform & opacity only), zero-layout shift.
 */

export const fadeInVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: MOTION_DURATIONS.medium,
      ease: MOTION_EASINGS.easeOutSmooth,
    },
  },
};

export const fadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.medium,
      ease: MOTION_EASINGS.easeOutSmooth,
    },
  },
};

export const fadeDownVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.medium,
      ease: MOTION_EASINGS.easeOutSmooth,
    },
  },
};

export const slideLeftVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -28,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: MOTION_DURATIONS.medium,
      ease: MOTION_EASINGS.easeOutSmooth,
    },
  },
};

export const slideRightVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 28,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: MOTION_DURATIONS.medium,
      ease: MOTION_EASINGS.easeOutSmooth,
    },
  },
};

export const scaleUpVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: MOTION_DURATIONS.medium,
      ease: MOTION_EASINGS.easeOutSmooth,
    },
  },
};

export const createStaggerContainer = (
  staggerChildren: number = MOTION_DURATIONS.staggerNormal,
  delayChildren: number = 0.05
): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.normal,
      ease: MOTION_EASINGS.easeOutSmooth,
    },
  },
};

export const pageIntroVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.medium,
      ease: MOTION_EASINGS.easeOutSmooth,
    },
  },
};

export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: MOTION_DURATIONS.fast, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    transition: { duration: MOTION_DURATIONS.fast, ease: "easeIn" },
  },
};

export const modalContentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: MOTION_DURATIONS.normal,
      ease: MOTION_EASINGS.easeOutSmooth,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 6,
    transition: {
      duration: MOTION_DURATIONS.fast,
      ease: "easeIn",
    },
  },
};
