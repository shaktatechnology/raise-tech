"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: "admin" | "customer";
  status?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
    phone?: string
  ) => Promise<User>;
  googleLogin: (credentialToken: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const clearCookies = () => {
    document.cookie = "auth_token=; path=/; max-age=0";
    document.cookie = "user_data=; path=/; max-age=0";
  };

  const logoutLocally = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    clearCookies();
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("auth_token");
      const storedUser = localStorage.getItem("user_data");

      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {}
        }
        // Verify current session with Laravel API
        try {
          const res = await fetchApi<{ user: User }>("/me");
          setUser(res.user);
          localStorage.setItem("user_data", JSON.stringify(res.user));
        } catch {
          logoutLocally();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const setCookies = (token: string, user: User) => {
    const maxAge = 60 * 60 * 24 * 7; // 7 days
    document.cookie = `auth_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
    document.cookie = `user_data=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${maxAge}; SameSite=Lax`;
  };

  const login = async (email: string, password: string): Promise<User> => {
    const res = await fetchApi<{ user: User; access_token: string }>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem("auth_token", res.access_token);
    localStorage.setItem("user_data", JSON.stringify(res.user));
    setCookies(res.access_token, res.user);

    return res.user;
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
    phone?: string
  ): Promise<User> => {
    const res = await fetchApi<{ user: User; access_token: string }>("/register", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        phone: phone || null,
        password,
        password_confirmation,
      }),
    });

    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem("auth_token", res.access_token);
    localStorage.setItem("user_data", JSON.stringify(res.user));
    setCookies(res.access_token, res.user);

    return res.user;
  };

  const googleLogin = async (credentialToken: string): Promise<User> => {
    const res = await fetchApi<{ user: User; access_token: string }>("/google-login", {
      method: "POST",
      body: JSON.stringify({ token: credentialToken }),
    });

    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem("auth_token", res.access_token);
    localStorage.setItem("user_data", JSON.stringify(res.user));
    setCookies(res.access_token, res.user);

    return res.user;
  };

  const logout = async (): Promise<void> => {
    try {
      if (token) await fetchApi("/logout", { method: "POST" });
    } finally {
      logoutLocally();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}