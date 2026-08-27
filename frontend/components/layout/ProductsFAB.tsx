"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";

export default function ProductsFAB() {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href="/products/shop"
      id="products-fab"
      aria-label="Go to Products"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: hovered ? "0.65rem 1.1rem" : "0.75rem",
        borderRadius: "9999px",
        background: "linear-gradient(135deg, #f97316 0%, #ef4444 100%)",
        color: "#fff",
        boxShadow: hovered
          ? "0 8px 30px rgba(249,115,22,0.55)"
          : "0 4px 16px rgba(249,115,22,0.35)",
        textDecoration: "none",
        transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        transform: hovered ? "scale(1.08)" : "scale(1)",
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
    >
      <ShoppingBag size={22} strokeWidth={2} />
      <span
        style={{
          maxWidth: hovered ? "120px" : "0px",
          opacity: hovered ? 1 : 0,
          overflow: "hidden",
          fontSize: "0.875rem",
          fontWeight: 600,
          letterSpacing: "0.02em",
          transition: "max-width 0.3s ease, opacity 0.25s ease",
        }}
      >
        Products
      </span>
    </Link>
  );
}
