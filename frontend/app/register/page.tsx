"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api, extractErrorMessage } from "@/lib/api";
import { saveSession } from "@/lib/auth";
import { AuthResponse } from "@/lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post<AuthResponse>("/api/auth/register", { username, email, password });
      saveSession(data.token, { username: data.username, email: data.email });
      router.push("/search");
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't create your account. Try a different username."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-signature-gradient-soft blur-3xl" aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-gradient">Create your library</h1>
          <p className="text-sm text-muted mt-1">Takes about 20 seconds.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-xs font-medium text-muted">Username</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              autoComplete="username"
              className="rounded-lg bg-elevated border border-border px-3 py-2.5 text-sm text-ink outline-none focus:border-violet/50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-medium text-muted">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
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
              minLength={6}
              autoComplete="new-password"
              className="rounded-lg bg-elevated border border-border px-3 py-2.5 text-sm text-ink outline-none focus:border-violet/50"
            />
            <span className="text-[11px] text-muted">At least 6 characters</span>
          </div>

          {error && <p className="text-sm text-pink">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-signature-gradient text-white font-medium py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-ink font-medium hover:text-gradient">
            Sign in
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
