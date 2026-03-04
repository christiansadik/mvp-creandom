"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      router.push("/home");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1
            className="text-3xl font-bold"
            style={{
              background:
                "linear-gradient(90deg, #f472b6, #a78bfa, #60a5fa, #34d399, #facc15, #fb923c)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            creandom
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
              className="bg-zinc-900 border-zinc-700"
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
              className="bg-zinc-900 border-zinc-700"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button type="submit" className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold" disabled={loading}>
            {loading ? "Accesso..." : "Continua"}
          </Button>
        </form>

        <div className="space-y-2">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-black px-2 text-zinc-500">oppure</span>
            </div>
          </div>
          <Button variant="outline" className="w-full border-zinc-700 text-zinc-400" disabled>
            Accedi con SPID
          </Button>
          <Button variant="outline" className="w-full border-zinc-700 text-zinc-400" disabled>
            Accedi con CIE
          </Button>
        </div>

        <p className="text-center text-sm text-zinc-500">
          Non hai un account?{" "}
          <a href="/profile-select" className="text-green-400 hover:underline">
            Registrati
          </a>
        </p>

        <p className="text-center text-xs text-zinc-600">
          Continuando accetti i{" "}
          <a href="#" className="underline">Termini di Servizio</a>
          {" "}e la{" "}
          <a href="#" className="underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
