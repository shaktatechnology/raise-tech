"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useAuth, User } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Script from "next/script";

declare global {
  interface Window {
    google?: any;
  }
}

function LoginFormContent() {
  const { googleLogin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect");

  const [error, setError] = useState<string | null>(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handlePostLoginRedirect = (user: User) => {
    if (redirectTarget) {
      router.push(redirectTarget);
    } else {
      router.push("/"); // customers always go to homepage
    }
  };

  const handleGoogleCallback = useCallback(
    async (response: any) => {
      setError(null);
      try {
        const user = await googleLogin(response.credential);
        handlePostLoginRedirect(user);
      } catch (err: any) {
        setError(err.message || "Google Login Failed.");
      }
    },
    [googleLogin, redirectTarget, router]
  );

  const initGoogleScript = useCallback(() => {
    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      setGoogleLoaded(true);
      if (googleClientId) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCallback,
        });

        const btnContainer = document.getElementById("google-signin-btn");
        if (btnContainer) {
          btnContainer.innerHTML = "";
          window.google.accounts.id.renderButton(btnContainer, {
            theme: "outline",
            size: "large",
            text: "signin_with",
            shape: "rectangular",
            width: 400,
          });
        }
      }
    }
  }, [googleClientId, handleGoogleCallback]);

  useEffect(() => {
    initGoogleScript();
  }, [initGoogleScript]);

  const handleCustomGoogleClick = () => {
    if (!googleClientId) {
      setError(
        "Google Client ID is missing. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your frontend .env file."
      );
      return;
    }
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={initGoogleScript}
        strategy="afterInteractive"
      />

      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-slate-400 text-sm mt-1">
              Sign in to your account to continue
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg text-center">
              {error}
            </div>
          )}

          {/* Google Sign In */}
          <div className="flex justify-center">
            {googleClientId && googleLoaded ? (
              <div id="google-signin-btn" className="w-full flex justify-center min-h-[40px]" />
            ) : (
              <button
                type="button"
                onClick={handleCustomGoogleClick}
                className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg border border-slate-700 transition"
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

          <p className="text-center text-xs text-slate-400 mt-8">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          Loading...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
