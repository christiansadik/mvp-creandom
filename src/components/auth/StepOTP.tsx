"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";

interface Props {
  userId: string;
  onSuccess: () => void;
}

export function StepOTP({ userId, onSuccess }: Props) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const mutation = trpc.auth.signupStep4VerifyOTP.useMutation({
    onSuccess,
    onError: (e) => setError(e.message),
  });

  function handleChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const otp = digits.join("");
    if (otp.length < 6) return;
    mutation.mutate({ userId, otp });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-white">Verifica OTP</h2>
      <p className="text-zinc-400 text-sm">Inserisci il codice a 6 cifre ricevuto. (Demo: usa 123456)</p>
      <div className="flex gap-2 justify-center">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { inputs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            className="w-10 h-12 text-center text-lg font-bold rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-green-400"
          />
        ))}
      </div>
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      <Button type="submit" className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold" disabled={mutation.isPending || digits.join("").length < 6}>
        {mutation.isPending ? "..." : "Verifica"}
      </Button>
    </form>
  );
}
