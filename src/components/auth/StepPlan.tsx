"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { UserRole, PlanType } from "@prisma/client";
import { cn } from "@/lib/utils";

interface Props {
  userId: string;
  role: UserRole;
  onSuccess: () => void;
}

const CREATIVE_PLANS = [
  { id: PlanType.JUST_ONE_TRY, name: "Just one try", price: "Gratis", description: "1 timestamp, 1 NDA" },
  { id: PlanType.JUST_FEW_DATES, name: "Just few dates", price: "€17.50", description: "Accesso mensile" },
  { id: PlanType.JUST_CANT_STOP, name: "Just can't stop!", price: "€89.99/anno", description: "Illimitato" },
];

const COMPANY_PLANS = [
  { id: PlanType.FREE, name: "Free", price: "Gratis", description: "Funzionalità base" },
  { id: PlanType.STUDIO, name: "Studio", price: "€199.99/anno", description: "Tutto incluso" },
];

export function StepPlan({ userId, role, onSuccess }: Props) {
  const plans = role === "COMPANY" ? COMPANY_PLANS : CREATIVE_PLANS;
  const [selected, setSelected] = useState<PlanType>(plans[0].id);
  const [error, setError] = useState("");

  const setPlan = trpc.auth.signupStep5Plan.useMutation({
    onError: (e) => setError(e.message),
  });
  const complete = trpc.auth.signupComplete.useMutation({
    onSuccess,
    onError: (e) => setError(e.message),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    await setPlan.mutateAsync({ userId, plan: selected });
    await complete.mutateAsync({ userId });
  }

  const loading = setPlan.isPending || complete.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-white">Scegli il tuo piano</h2>
      <div className="space-y-3">
        {plans.map((plan) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => setSelected(plan.id)}
            className={cn(
              "w-full rounded-xl border-2 p-4 text-left transition",
              selected === plan.id
                ? "border-green-400 bg-zinc-800"
                : "border-zinc-700 bg-zinc-900 hover:bg-zinc-800"
            )}
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold text-white">{plan.name}</span>
              <span className="text-green-400 font-bold text-sm">{plan.price}</span>
            </div>
            <p className="text-zinc-400 text-xs mt-1">{plan.description}</p>
          </button>
        ))}
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <Button type="submit" className="w-full bg-green-500 hover:bg-green-400 text-black font-semibold" disabled={loading}>
        {loading ? "..." : "Completa registrazione"}
      </Button>
    </form>
  );
}
