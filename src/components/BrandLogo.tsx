import Image from "next/image";

interface Props {
  /** Font size class, e.g. "text-3xl". Defaults to "text-3xl". */
  className?: string;
  /** Show the icon mark above the wordmark. */
  withIcon?: boolean;
  /** Icon size in px (only relevant when withIcon=true). Defaults to 80. */
  iconSize?: number;
}

// Per-letter colors as seen in brand guidelines
const LETTERS: { char: string; color: string }[] = [
  { char: "c", color: "#4A90D9" },
  { char: "r", color: "#5BC8AF" },
  { char: "e", color: "#5CB85C" },
  { char: "a", color: "#F5C518" },
  { char: "n", color: "#F0A500" },
  { char: "d", color: "#E8763A" },
  { char: "o", color: "#E05C3A" },
  { char: "m", color: "#D9534F" },
];

export function BrandLogo({ className = "text-3xl", withIcon = false, iconSize = 80 }: Props) {
  return (
    <span className="inline-flex flex-col items-center gap-2">
      {withIcon && (
        <Image
          src="/icon-logo.svg"
          alt="creandom icon"
          width={iconSize}
          height={iconSize}
          priority
        />
      )}
      <span className={`font-bold tracking-tight ${className}`}>
        {LETTERS.map(({ char, color }) => (
          <span key={char} style={{ color }}>
            {char}
          </span>
        ))}
      </span>
    </span>
  );
}
