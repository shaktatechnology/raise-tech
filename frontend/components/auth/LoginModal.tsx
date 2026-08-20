"use client";

import React, { useCallback, useState, useEffect, Suspense } from "react";
import UserLoginForm from "./UserLoginForm";
import UserSignupForm from "./UserSignupForm";
import type { User } from "@/context/AuthContext";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
  onAuthenticated?: (user: User) => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  initialMode = "login",
  onAuthenticated,
}: LoginModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const handleClose = useCallback(() => {
    setMode(initialMode);
    onClose();
  }, [initialMode, onClose]);

  // Lock scroll when open & handle Escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") handleClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [handleClose, isOpen]);

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
        onClick={handleClose}
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
              onClose={handleClose}
              onSwitchToSignup={() => setMode("signup")}
              onAuthenticated={onAuthenticated}
            />
          ) : (
            <UserSignupForm
              isModal={true}
              onClose={handleClose}
              onSwitchToLogin={() => setMode("login")}
              onAuthenticated={onAuthenticated}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
}
