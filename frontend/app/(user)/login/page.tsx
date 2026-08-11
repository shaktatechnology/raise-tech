"use client";

import React, { Suspense } from "react";
import UserLoginForm from "@/components/auth/UserLoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          Loading...
        </div>
      }
    >
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <UserLoginForm />
      </div>
    </Suspense>
  );
}
