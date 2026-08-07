import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  /** Pixel size when not overridden by className sizing utilities. */
  size?: number;
  className?: string;
  /** Prefer 256 for small UI, full logo for hero. */
  variant?: "sm" | "lg";
  priority?: boolean;
};

/**
 * Circular brand mark: art is pre-centered + masked; CSS only frames with
 * primary border + glow and keeps the image perfectly centered.
 */
export function BrandLogo({
  size = 36,
  className,
  variant = "sm",
  priority = false,
}: BrandLogoProps) {
  const src =
    variant === "lg" ? "/brand/logo.webp" : "/brand/logo-256.webp";
  const renderSize = Math.max(size, variant === "lg" ? 112 : 36);

  return (
    <span
      className={cn(
        "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full border border-primary/75 bg-black/40 shadow-[0_0_0_1px_rgba(232,163,23,0.14),0_0_16px_rgba(232,163,23,0.4),0_0_32px_rgba(232,163,23,0.16)]",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt="La Leyenda"
        width={renderSize}
        height={renderSize}
        priority={priority}
        draggable={false}
        className="pointer-events-none block h-full w-full max-w-none select-none object-contain object-center"
      />
    </span>
  );
}
