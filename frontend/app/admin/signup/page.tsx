"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface RegisterResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    status: string;
    email_verified_at: string | null;
  };
  access_token: string;
  token_type: string;
}

function AdminSignupContent() {
  const router = useRouter();
  const { setTokenAndFetchUser } = useAuth() as any;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name,
        email,
        phone: phone.trim() ? phone : null,
        password,
        password_confirmation: passwordConfirmation,
      };

      const res = await fetchApi<RegisterResponse>("/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSuccessMessage(res.message || "Registration successful. Please verify your email.");

      // Store access token if returned
      if (res.access_token) {
        localStorage.setItem("auth_token", res.access_token);
        if (res.user) {
          localStorage.setItem("user_data", JSON.stringify(res.user));
        }
      }

      // Automatically redirect to admin dashboard or login after 2 seconds
      setTimeout(() => {
        if (res.user?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/admin/login");
        }
      }, 1500);

    } catch (err: any) {
      if (err.data?.errors) {
        const firstErrorKey = Object.keys(err.data.errors)[0];
        setError(err.data.errors[firstErrorKey][0]);
      } else {
        setError(err.message || "Registration failed. Please check your inputs.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Header Icon */}
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-center">
            <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Admin Registration</h2>
          <p className="text-slate-400 text-xs mt-1">Create a new administrator account for Raise Tech</p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl text-center font-medium">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={255}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              placeholder="e.g. Shakta Admin"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              required
              maxLength={255}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              placeholder="admin@raisetech.com"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Phone Number <span className="text-slate-500 text-[11px]">(Optional)</span>
            </label>
            <input
              type="text"
              maxLength={20}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              placeholder="+977 9800000000"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Password <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition shadow-lg shadow-cyan-950/40 disabled:opacity-50 mt-2 cursor-pointer"
          >
            {isSubmitting ? "Creating Admin Account..." : "Register Admin Account"}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800/80">
          <p className="text-xs text-slate-400">
            Already registered?{" "}
            <Link href="/admin/login" className="text-cyan-400 hover:underline font-semibold">
              Sign In to Admin Panel
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminSignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          Loading...
        </div>
      }
    >
      <AdminSignupContent />
    </Suspense>
  );
}
