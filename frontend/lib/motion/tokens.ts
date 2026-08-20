/**
 * Motion Tokens for Raise Tech
 * Defines consistent durations, easing curves, and springs for the site-wide motion system.
 */

export const MOTION_DURATIONS = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.35,
  medium: 0.5,
  slow: 0.7,
  staggerFast: 0.05,
  staggerNormal: 0.08,
} as const;

export const MOTION_EASINGS = {
  // Smooth deceleration - standard for entries and reveals
  easeOutSmooth: [0.16, 1, 0.3, 1] as const,
  // Standard acceleration/deceleration - for smooth symmetric state transitions
  easeInOutSmooth: [0.4, 0, 0.2, 1] as const,
  // Snappy ease out - for quick micro-interactions (buttons, badges)
  easeOutSnappy: [0.25, 1, 0.5, 1] as const,
} as const;

export const MOTION_SPRINGS = {
  gentle: {
    type: "spring",
    stiffness: 350,
    damping: 30,
  } as const,
  bouncy: {
    type: "spring",
    stiffness: 450,
    damping: 25,
  } as const,
  stiff: {
    type: "spring",
    stiffness: 500,
    damping: 35,
  } as const,
} as const;
