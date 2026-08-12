"use client";

import React, { useState, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

function AdminLoginContent() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const user = await login(email, password);
      if (user.role !== "admin") {
        setError("Access denied. Admin credentials required.");
        return;
      }
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">

        {/* Lock icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-indigo-600/20 border border-indigo-500/30 rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white">Admin Login</h2>
          <p className="text-slate-500 text-xs mt-1">Restricted access — admins only</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition text-sm"
              placeholder="admin@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition text-sm"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition disabled:opacity-50 mt-2 text-sm cursor-pointer"
          >
            {isSubmitting ? "Signing in..." : "Sign In as Admin"}
          </button>

          <div className="text-center mt-4">
            <p className="text-xs text-slate-400">
              Need an admin account?{" "}
              <a href="/admin/signup" className="text-indigo-400 hover:underline font-semibold">
                Register Admin
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          Loading...
        </div>
      }
    >
      <AdminLoginContent />
    </Suspense>
  );
}
