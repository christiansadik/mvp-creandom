"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ProfileKey = "creative" | "company";

interface ProfileInfo {
  title: string;
  icon: string;
  body: string;
}

const INFO: Record<ProfileKey, ProfileInfo> = {
  creative: {
    title: "Creativo",
    icon: "💡",
    body: "Se sei proprietario delle tue idee e vuoi essere sicuro di proteggerle legalmente, sei nel posto giusto! Questo profilo è pensato per tutti i creativi, senza distinzioni: che tu sia un freelance o una persona con tante idee da condividere, Creandom sarà la protezione smart che cercavi.",
  },
  company: {
    title: "Azienda",
    icon: "👥",
    body: "Se la tua realtà lavora con la creatività e vuoi tutelare i flussi creativi della tua azienda, sei nel posto giusto! Con Creandom potrai comunicare e creare documenti in modo smart e veloce, sia per collaborare con i creativi, sia per creare rapporti sicuri con altre aziende partner.",
  },
};

export default function ProfileSelectPage() {
  const router = useRouter();
  const [modal, setModal] = useState<ProfileKey | null>(null);
  const [fading, setFading] = useState(false);

  function navigate(role: ProfileKey) {
    setFading(true);
    setTimeout(() => router.push(`/signup?role=${role}`), 400);
  }

  const info = modal ? INFO[modal] : null;

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-black px-6 transition-opacity duration-400"
      style={{ opacity: fading ? 0 : 1 }}
    >
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <BrandLogo withIcon iconSize={72} className="text-3xl" />
        </div>

        {/* Cards */}
        <div className="space-y-4">
          {/* Creativo */}
          <div
            onClick={() => navigate("creative")}
            className="relative cursor-pointer rounded-2xl border-2 border-yellow-400 bg-zinc-900 p-5 transition hover:bg-zinc-800 active:scale-[0.98]"
          >
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setModal("creative"); }}
              className="absolute top-4 right-4 text-yellow-400 hover:text-yellow-300 text-lg leading-none"
              aria-label="Info Creativo"
            >
              ℹ
            </button>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">💡</span>
              <h2 className="text-yellow-400 font-bold text-lg">Creativo</h2>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Stanco di condividere le tue idee con la paura che te le rubino?<br />
              Un gesto semplice ma efficace che parla come te!
            </p>
          </div>

          {/* Azienda */}
          <div
            onClick={() => navigate("company")}
            className="relative cursor-pointer rounded-2xl border-2 border-blue-400 bg-zinc-900 p-5 transition hover:bg-zinc-800 active:scale-[0.98]"
          >
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setModal("company"); }}
              className="absolute top-4 right-4 text-blue-400 hover:text-blue-300 text-lg leading-none"
              aria-label="Info Azienda"
            >
              ℹ
            </button>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">👥</span>
              <h2 className="text-blue-400 font-bold text-lg">Azienda</h2>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Sei pronto a ricevere e condividere idee in sicurezza?<br />
              Traccia il tuo flusso creativo con Creandom!
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-zinc-500">
          Hai già un account?{" "}
          <a href="/login" className="text-green-400 hover:underline font-medium">
            Accedi
          </a>
        </p>
      </div>

      {/* Info modal */}
      <Dialog open={modal !== null} onOpenChange={(open) => !open && setModal(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-700 rounded-2xl max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white text-lg font-bold">
              <span>{info?.icon}</span>
              <span>{info?.title}</span>
            </DialogTitle>
          </DialogHeader>
          <p className="text-zinc-300 text-sm leading-relaxed mt-2">
            {info?.body}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
