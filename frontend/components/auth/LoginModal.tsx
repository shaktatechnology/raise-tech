"use client";

import React, { useState, useEffect, Suspense } from "react";
import UserLoginForm from "./UserLoginForm";
import UserSignupForm from "./UserSignupForm";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
}

export default function LoginModal({ isOpen, onClose, initialMode = "login" }: LoginModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, isOpen]);

  // Lock scroll when open & handle Escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Container */}
      <div className="relative z-10 w-full max-w-md animate-in zoom-in-95 duration-200">
        <Suspense
          fallback={
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
              Loading...
            </div>
          }
        >
          {mode === "login" ? (
            <UserLoginForm
              isModal={true}
              onClose={onClose}
              onSwitchToSignup={() => setMode("signup")}
            />
          ) : (
            <UserSignupForm
              isModal={true}
              onClose={onClose}
              onSwitchToLogin={() => setMode("login")}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
}
