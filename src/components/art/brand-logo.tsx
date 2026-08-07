import { brandAsset } from "@/lib/site";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  size?: number;
  className?: string;
  /** @deprecated Both sizes use the same centered master crop. */
  variant?: "sm" | "lg";
  priority?: boolean;
};

/**
 * Brand mark shared by navbar, home hero, and any other UI surface.
 * Always loads the same centered asset (version-busted for cache).
 */
export function BrandLogo({
  size = 36,
  className,
  priority = false,
}: BrandLogoProps) {
  // PNG keeps ring centering; webp lossy can nudge edge color detection/look.
  const src = brandAsset(
    size >= 96 ? "/brand/logo.png" : "/brand/logo-256.png",
  );

  return (
    <span
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-full border border-primary/80 bg-black/50",
        "shadow-[0_0_0_1px_rgba(232,163,23,0.16),0_0_16px_rgba(232,163,23,0.42),0_0_32px_rgba(232,163,23,0.18)]",
        className,
      )}
      style={{ width: size, height: size, maxWidth: "100%" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- circular crop; avoid next/image layout quirks */}
      <img
        src={src}
        alt="La Leyenda"
        width={size}
        height={size}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        draggable={false}
        className="pointer-events-none absolute inset-0 block size-full max-w-none select-none object-cover object-center"
      />
    </span>
  );
}
