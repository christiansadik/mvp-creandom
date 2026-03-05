interface Props {
  className?: string;
}

export function BrandLogo({ className = "text-3xl" }: Props) {
  return (
    <span
      className={`font-bold ${className}`}
      style={{
        background: "linear-gradient(90deg, #f472b6, #a78bfa, #60a5fa, #34d399, #facc15, #fb923c)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      creandom
    </span>
  );
}
