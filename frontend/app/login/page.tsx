"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api, extractErrorMessage } from "@/lib/api";
import { saveSession } from "@/lib/auth";
import { AuthResponse } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post<AuthResponse>("/api/auth/login", { username, password });
      saveSession(data.token, { username: data.username, email: data.email });
      router.push("/search");
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't sign you in. Check your username and password."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-signature-gradient-soft blur-3xl" aria-hidden />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-signature-gradient-soft blur-3xl" aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="flex items-end justify-center gap-1 h-8 mb-4">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="w-1.5 rounded-full bg-signature-gradient animate-pulse_bar"
                style={{ height: "100%", animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </div>
          <h1 className="font-display text-3xl font-bold text-gradient">SunnyPlays</h1>
          <p className="text-sm text-muted mt-1">Your taste, catalogued and charted.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-xs font-medium text-muted">Username</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="rounded-lg bg-elevated border border-border px-3 py-2.5 text-sm text-ink outline-none focus:border-violet/50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-medium text-muted">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="rounded-lg bg-elevated border border-border px-3 py-2.5 text-sm text-ink outline-none focus:border-violet/50"
            />
          </div>

          {error && <p className="text-sm text-pink">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-signature-gradient text-white font-medium py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-5">
          New here?{" "}
          <Link href="/register" className="text-ink font-medium hover:text-gradient">
            Create an account
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
