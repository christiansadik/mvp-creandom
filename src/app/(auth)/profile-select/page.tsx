"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ProfileSelectPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-white">Benvenuto in Creandom</h2>
          <p className="text-zinc-400 text-sm">Come vuoi registrarti?</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => router.push("/signup?role=creative")}
            className="flex flex-col items-center gap-3 rounded-2xl border-2 border-yellow-400 bg-zinc-900 p-6 transition hover:bg-zinc-800"
          >
            <span className="text-3xl">🎨</span>
            <span className="text-white font-semibold">Creativo</span>
            <span className="text-zinc-400 text-xs text-center">Artisti, designer, freelancer</span>
          </button>

          <button
            onClick={() => router.push("/signup?role=company")}
            className="flex flex-col items-center gap-3 rounded-2xl border-2 border-blue-400 bg-zinc-900 p-6 transition hover:bg-zinc-800"
          >
            <span className="text-3xl">🏢</span>
            <span className="text-white font-semibold">Azienda</span>
            <span className="text-zinc-400 text-xs text-center">Imprese e professionisti</span>
          </button>
        </div>

        <p className="text-center text-sm text-zinc-500">
          Hai già un account?{" "}
          <a href="/login" className="text-green-400 hover:underline">
            Accedi
          </a>
        </p>
      </div>
    </div>
  );
}
