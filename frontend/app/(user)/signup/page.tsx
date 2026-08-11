"use client";

import React, { Suspense } from "react";
import UserSignupForm from "@/components/auth/UserSignupForm";

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          Loading...
        </div>
      }
    >
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <UserSignupForm />
      </div>
    </Suspense>
  );
}
