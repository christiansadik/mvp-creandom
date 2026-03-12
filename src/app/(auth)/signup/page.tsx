"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { StepSignup } from "@/components/auth/StepSignup";
import { StepPersonalInfo } from "@/components/auth/StepPersonalInfo";
import { StepCompanyInfo } from "@/components/auth/StepCompanyInfo";
import { StepCompanyReferent } from "@/components/auth/StepCompanyReferent";
import { StepPhone } from "@/components/auth/StepPhone";
import { StepOTP } from "@/components/auth/StepOTP";
import { StepPlan } from "@/components/auth/StepPlan";
import { UserRole } from "@prisma/client";

function SignupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = (searchParams.get("role") === "company" ? "COMPANY" : "CREATIVE") as UserRole;

  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);

  const totalSteps = role === "COMPANY" ? 6 : 5;

  function next() {
    setStep((s) => s + 1);
  }

  function handleComplete() {
    router.push("/login?registered=1");
  }

  const progressPercent = Math.round((step / totalSteps) * 100);

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-zinc-500">
          <span>Step {step} di {totalSteps}</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-zinc-800">
          <div
            className="h-1.5 rounded-full bg-green-400 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {step === 1 && (
        <StepSignup
          role={role}
          onSuccess={(id) => { setUserId(id); next(); }}
        />
      )}
      {step === 2 && role === "CREATIVE" && (
        <StepPersonalInfo userId={userId!} onSuccess={next} />
      )}
      {step === 2 && role === "COMPANY" && (
        <StepCompanyInfo userId={userId!} onSuccess={next} />
      )}
      {step === 3 && role === "COMPANY" && (
        <StepCompanyReferent userId={userId!} onSuccess={next} />
      )}
      {((step === 3 && role === "CREATIVE") || (step === 4 && role === "COMPANY")) && (
        <StepPhone userId={userId!} onSuccess={next} />
      )}
      {((step === 4 && role === "CREATIVE") || (step === 5 && role === "COMPANY")) && (
        <StepOTP userId={userId!} onSuccess={next} />
      )}
      {((step === 5 && role === "CREATIVE") || (step === 6 && role === "COMPANY")) && (
        <StepPlan userId={userId!} role={role} onSuccess={handleComplete} />
      )}
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <Suspense fallback={<div className="text-zinc-400 text-sm">Caricamento...</div>}>
        <SignupContent />
      </Suspense>
    </div>
  );
}
