"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/BrandLogo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fading, setFading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Credenziali non valide");
    } else {
      setFading(true);
      setTimeout(() => router.push("/home"), 500);
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-black px-4 transition-opacity duration-500"
      style={{ opacity: fading ? 0 : 1 }}
    >
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-3">
          <h1 className="flex justify-center">
            <BrandLogo withIcon iconSize={80} />
          </h1>
          <p className="text-zinc-400 text-sm">Accedi al tuo account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-zinc-900 border-zinc-700 rounded-full px-4"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-zinc-900 border-zinc-700 rounded-full px-4"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button
            type="submit"
            className="w-full bg-green-700 hover:bg-green-600 text-white font-semibold h-12 text-base"
            disabled={loading}
          >
            {loading ? "Accesso..." : "Continua"}
          </Button>
        </form>

        <div className="space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-black px-2 text-zinc-500">oppure</span>
            </div>
          </div>

          {/* SPID */}
          <button
            type="button"
            disabled
            className="w-full h-12 flex items-center gap-3 rounded-full border-2 border-green-500 bg-zinc-900 px-5 text-green-400 font-semibold text-sm opacity-60 cursor-not-allowed"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-white shrink-0">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            </span>
            Entra con SPID
          </button>

          {/* CIE */}
          <button
            type="button"
            disabled
            className="w-full h-12 flex items-center gap-3 rounded-full border-2 border-green-500 bg-zinc-900 px-5 text-green-400 font-semibold text-sm opacity-60 cursor-not-allowed"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-800 border border-green-500 text-green-400 shrink-0">
              <span className="text-[8px] font-bold leading-tight text-center">Cie<br />ID</span>
            </span>
            Entra con CIE
          </button>
        </div>

        <p className="text-center text-sm text-zinc-500">
          Non hai un account?{" "}
          <a href="/profile-select" className="text-green-400 hover:underline font-medium">
            Registrati
          </a>
        </p>

        <p className="text-center text-xs text-zinc-500">
          Continuando accetti i{" "}
          <a href="#" className="text-white underline font-medium hover:text-zinc-300">
            Termini di Servizio
          </a>
          {" "}e la{" "}
          <a href="#" className="text-white underline font-medium hover:text-zinc-300">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
