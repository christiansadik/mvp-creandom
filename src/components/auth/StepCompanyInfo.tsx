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

export function StepCompanyInfo({ userId, onSuccess }: Props) {
  const [ragioneSociale, setRagioneSociale] = useState("");
  const [formaGiuridica, setFormaGiuridica] = useState("");
  const [indirizzoSede, setIndirizzoSede] = useState("");
  const [codiceFiscaleIva, setCodiceFiscaleIva] = useState("");
  const [codiceSDI, setCodiceSDI] = useState("");
  const [error, setError] = useState("");

  const mutation = trpc.auth.signupStep2Company.useMutation({
    onSuccess,
    onError: (e) => setError(e.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    mutation.mutate({ userId, ragioneSociale, formaGiuridica, indirizzoSede, codiceFiscaleIva, codiceSDI });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-white">Dati aziendali</h2>
      <div className="space-y-2">
        <Label>Ragione sociale *</Label>
        <Input value={ragioneSociale} onChange={(e) => setRagioneSociale(e.target.value)} required className="bg-zinc-900 border-zinc-700" />
      </div>
      <div className="space-y-2">
        <Label>Forma giuridica</Label>
        <Input value={formaGiuridica} onChange={(e) => setFormaGiuridica(e.target.value)} placeholder="es. SRL, SPA" className="bg-zinc-900 border-zinc-700" />
      </div>
      <div className="space-y-2">
        <Label>Indirizzo sede</Label>
        <Input value={indirizzoSede} onChange={(e) => setIndirizzoSede(e.target.value)} className="bg-zinc-900 border-zinc-700" />
      </div>
      <div className="space-y-2">
        <Label>Codice Fiscale / P.IVA</Label>
        <Input value={codiceFiscaleIva} onChange={(e) => setCodiceFiscaleIva(e.target.value)} className="bg-zinc-900 border-zinc-700" />
      </div>
      <div className="space-y-2">
        <Label>Codice SDI</Label>
        <Input value={codiceSDI} onChange={(e) => setCodiceSDI(e.target.value)} className="bg-zinc-900 border-zinc-700" />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <Button type="submit" className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold" disabled={mutation.isPending}>
        {mutation.isPending ? "..." : "Continua"}
      </Button>
    </form>
  );
}
