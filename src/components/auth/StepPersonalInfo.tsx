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

export function StepPersonalInfo({ userId, onSuccess }: Props) {
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [codiceFiscale, setCodiceFiscale] = useState("");
  const [partitaIva, setPartitaIva] = useState("");
  const [error, setError] = useState("");

  const mutation = trpc.auth.signupStep2Creative.useMutation({
    onSuccess,
    onError: (e) => setError(e.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    mutation.mutate({ userId, fullName, birthDate, birthPlace, codiceFiscale, partitaIva });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-white">Informazioni personali</h2>
      <div className="space-y-2">
        <Label>Nome completo *</Label>
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="bg-zinc-900 border-zinc-700" />
      </div>
      <div className="space-y-2">
        <Label>Data di nascita</Label>
        <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="bg-zinc-900 border-zinc-700" />
      </div>
      <div className="space-y-2">
        <Label>Luogo di nascita</Label>
        <Input value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} className="bg-zinc-900 border-zinc-700" />
      </div>
      <div className="space-y-2">
        <Label>Codice Fiscale</Label>
        <Input value={codiceFiscale} onChange={(e) => setCodiceFiscale(e.target.value)} className="bg-zinc-900 border-zinc-700" />
      </div>
      <div className="space-y-2">
        <Label>Partita IVA (opzionale)</Label>
        <Input value={partitaIva} onChange={(e) => setPartitaIva(e.target.value)} className="bg-zinc-900 border-zinc-700" />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <Button type="submit" className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold" disabled={mutation.isPending}>
        {mutation.isPending ? "..." : "Continua"}
      </Button>
    </form>
  );
}
