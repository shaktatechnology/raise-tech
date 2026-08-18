"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth, User } from "@/context/AuthContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useToast } from "@/context/ToastContext";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { getImageUrl } from "@/lib/api";

declare global {
  interface Window {
    google?: any;
  }
}

interface UserLoginFormProps {
  isModal?: boolean;
  onClose?: () => void;
  onSwitchToSignup?: () => void;
}

export default function UserLoginForm({
  isModal = false,
  onClose,
  onSwitchToSignup,
}: UserLoginFormProps) {
  const { googleLogin } = useAuth();
  const { settings } = useSiteSettings();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get("redirect");

  const [googleLoaded, setGoogleLoaded] = useState(false);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handlePostLoginRedirect = (user: User) => {
    if (onClose) onClose();
    toast.success(`Welcome back, ${user.name || "User"}!`);
    if (redirectTarget) {
      router.push(redirectTarget);
    } else {
      router.push("/");
    }
  };

  const handleGoogleCallback = useCallback(
    async (response: any) => {
      try {
        const user = await googleLogin(response.credential);
        handlePostLoginRedirect(user);
      } catch (err: any) {
        const msg = err.message || "Invalid email or password.";
        toast.error(msg);
      }
    },
    [googleLogin, redirectTarget, router, onClose, toast]
  );

  const initGoogleScript = useCallback(() => {
    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      setGoogleLoaded(true);
      if (googleClientId) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCallback,
          });

          const btnId = isModal ? "google-signin-btn-modal" : "google-signin-btn-page";
          setTimeout(() => {
            const btnContainer = document.getElementById(btnId);
            if (btnContainer) {
              btnContainer.innerHTML = "";
              window.google.accounts.id.renderButton(btnContainer, {
                theme: "outline",
                size: "large",
                text: "signin_with",
                shape: "rectangular",
                width: 340,
              });
            }
          }, 50);
        } catch (e) {
          console.error("GSI error:", e);
        }
      }
    }
  }, [googleClientId, handleGoogleCallback, isModal]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      initGoogleScript();
    } else {
      const interval = setInterval(() => {
        if (typeof window !== "undefined" && window.google?.accounts?.id) {
          initGoogleScript();
          clearInterval(interval);
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [initGoogleScript]);

  const handleCustomGoogleClick = () => {
    if (!googleClientId) {
      toast.error("Google Client ID is missing. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your frontend .env file.");
      return;
    }
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      toast.error("Google Sign-In is initializing. Please try again in a moment.");
    }
  };

  const btnContainerId = isModal ? "google-signin-btn-modal" : "google-signin-btn-page";

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={initGoogleScript}
        strategy="afterInteractive"
      />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl relative">
        {/* Close Button for Modal */}
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <div className="text-center mb-8">
          {settings?.logo && (
            <div className="flex justify-center mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getImageUrl(settings.logo)}
                alt="Site Logo"
                className="h-12 w-auto object-contain"
              />
            </div>
          )}
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-slate-400 text-sm mt-1">
            Sign in to your account to continue
          </p>
        </div>

        {/* Google Sign In */}
        <div className="flex flex-col items-center justify-center">
          <div id={btnContainerId} className="w-full flex justify-center min-h-[40px]" />

          {/* Custom fallback button if GSI container is not rendered */}
          {(!googleClientId || !googleLoaded) && (
            <button
              type="button"
              onClick={handleCustomGoogleClick}
              className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg border border-slate-700 transition cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>
          )}
        </div>

        {/* <p className="text-center text-xs text-slate-400 mt-8">
          Don&apos;t have an account?{" "}
          {isModal && onSwitchToSignup ? (
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
            >
              Sign Up
            </button>
          ) : (
            <Link
              href="/signup"
              onClick={() => { if (onClose) onClose(); }}
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Sign Up
            </Link>
          )}
        </p> */}
      </div>
    </>
  );
}
