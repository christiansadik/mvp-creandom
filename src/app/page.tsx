"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <h1
        className="text-5xl font-bold tracking-tight select-none"
        style={{
          background:
            "linear-gradient(90deg, #f472b6, #a78bfa, #60a5fa, #34d399, #facc15, #fb923c)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        creandom
      </h1>
    </div>
  );
}
