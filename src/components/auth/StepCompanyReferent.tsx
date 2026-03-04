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

export function StepCompanyReferent({ userId, onSuccess }: Props) {
  const [referenteName, setReferenteName] = useState("");
  const [referenteEmail, setReferenteEmail] = useState("");
  const [referenteCF, setReferenteCF] = useState("");
  const [error, setError] = useState("");

  const mutation = trpc.auth.signupStep2bCompanyRef.useMutation({
    onSuccess,
    onError: (e) => setError(e.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    mutation.mutate({ userId, referenteName, referenteEmail, referenteCF });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-white">Referente aziendale</h2>
      <div className="space-y-2">
        <Label>Nome referente *</Label>
        <Input value={referenteName} onChange={(e) => setReferenteName(e.target.value)} required className="bg-zinc-900 border-zinc-700" />
      </div>
      <div className="space-y-2">
        <Label>Email referente *</Label>
        <Input type="email" value={referenteEmail} onChange={(e) => setReferenteEmail(e.target.value)} required className="bg-zinc-900 border-zinc-700" />
      </div>
      <div className="space-y-2">
        <Label>Codice Fiscale referente</Label>
        <Input value={referenteCF} onChange={(e) => setReferenteCF(e.target.value)} className="bg-zinc-900 border-zinc-700" />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <Button type="submit" className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold" disabled={mutation.isPending}>
        {mutation.isPending ? "..." : "Continua"}
      </Button>
    </form>
  );
}
