"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BrandLogo } from "@/components/BrandLogo";

type Phase = "motion" | "black" | "logo";

export default function SplashPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("motion");
  const navTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function navigate() {
    if (navTimer.current) clearTimeout(navTimer.current);
    router.push("/login");
  }

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("black"), 1400);
    const t2 = setTimeout(() => setPhase("logo"), 1800);
    // Auto-navigate after 3s on logo (1800 + 3000)
    navTimer.current = setTimeout(() => router.push("/login"), 4800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (navTimer.current) clearTimeout(navTimer.current);
    };
  }, [router]);

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black"
      onClick={phase === "logo" ? navigate : undefined}
      style={{ cursor: phase === "logo" ? "pointer" : "default" }}
    >
      {/* Motion SVG */}
      <div
        className="absolute inset-0 transition-opacity duration-400"
        style={{ opacity: phase === "motion" ? 1 : 0, pointerEvents: "none" }}
      >
        <Image
          src="/motion.svg"
          alt=""
          fill
          priority
          className="object-cover"
          aria-hidden
        />
      </div>

      {/* Logo */}
      <div
        className="relative z-10 transition-all duration-700"
        style={{
          opacity: phase === "logo" ? 1 : 0,
          transform: phase === "logo" ? "scale(1)" : "scale(0.85)",
        }}
      >
        <BrandLogo withIcon iconSize={100} className="text-5xl" />
      </div>
    </div>
  );
}
