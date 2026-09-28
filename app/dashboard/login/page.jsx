"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase-auth";

export default function DashboardLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard/programs");
    } catch {
      setError("Couldn't sign in. Check your email and password and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-ivory px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-charcoal/10 bg-white/40 p-8"
      >
        <div className="relative h-8 w-32">
          <Image
            src="/brand/logo-wordmark.png"
            alt="Tasia"
            fill
            className="object-contain object-left"
            sizes="128px"
          />
        </div>
        <p className="mt-1 text-sm text-charcoal/60">Dashboard sign in</p>

        <div className="mt-6 flex flex-col gap-4">
          <div>
            <label className="text-xs text-charcoal/60">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-charcoal/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-navy"
            />
          </div>
          <div>
            <label className="text-xs text-charcoal/60">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-charcoal/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-navy"
            />
          </div>

          {error && <p className="text-sm text-navy">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-navy px-6 py-3 text-sm font-medium text-warm-ivory transition-colors hover:bg-navy-dark disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </div>

        <p className="mt-6 text-xs text-charcoal/50">
          Create your admin account from the Firebase console under
          Authentication → Users.
        </p>
      </form>
    </div>
  );
}
