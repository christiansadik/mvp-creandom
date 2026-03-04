"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc/client";
import { UserRole } from "@prisma/client";

interface Props {
  role: UserRole;
  onSuccess: (userId: string) => void;
}

export function StepSignup({ role, onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const mutation = trpc.auth.signupStep1.useMutation({
    onSuccess: (data) => onSuccess(data.userId),
    onError: (e) => setError(e.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    mutation.mutate({ email, password, role });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-white">
        {role === "COMPANY" ? "Registra la tua Azienda" : "Crea il tuo account"}
      </h2>
      {role === "CREATIVE" && (
        <div className="space-y-2">
          <Label>Nome completo</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mario Rossi"
            className="bg-zinc-900 border-zinc-700"
          />
        </div>
      )}
      <div className="space-y-2">
        <Label>Email</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-zinc-900 border-zinc-700"
        />
      </div>
      <div className="space-y-2">
        <Label>Password</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="bg-zinc-900 border-zinc-700"
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <Button
        type="submit"
        className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "..." : "Continua"}
      </Button>
    </form>
  );
}
