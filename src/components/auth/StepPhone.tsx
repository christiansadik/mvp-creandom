"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc/client";

interface Props {
  userId: string;
  onSuccess: () => void;
}

export function StepPhone({ userId, onSuccess }: Props) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const mutation = trpc.auth.signupStep3Phone.useMutation({
    onSuccess,
    onError: (e) => setError(e.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    mutation.mutate({ userId, phone });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-white">Numero di telefono</h2>
      <p className="text-zinc-400 text-sm">Invieremo un codice OTP per la verifica.</p>
      <div className="space-y-2">
        <Label>Telefono *</Label>
        <Input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+39 333 000 0000"
          required
          className="bg-zinc-900 border-zinc-700"
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <Button type="submit" className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold" disabled={mutation.isPending}>
        {mutation.isPending ? "..." : "Invia codice"}
      </Button>
    </form>
  );
}
