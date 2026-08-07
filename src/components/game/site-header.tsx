import Link from "next/link";

import { BrandLogo } from "@/components/art/brand-logo";

const LINKS = [
  { href: "/", label: "Jugar" },
  { href: "/ranking", label: "Ranking" },
  { href: "/profile", label: "Perfil" },
];

export function SiteHeader() {
  return (
    <header className="shrink-0 border-b border-border/50 bg-black/40 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-4">
        <Link href="/" className="group flex min-w-0 items-center gap-2 sm:gap-2.5">
          <BrandLogo
            size={36}
            priority
            className="transition duration-300 group-hover:scale-105 group-hover:border-primary group-hover:shadow-[0_0_0_1px_rgba(232,163,23,0.22),0_0_18px_rgba(232,163,23,0.55),0_0_36px_rgba(232,163,23,0.22)]"
          />
          <div className="min-w-0 leading-none">
            <p className="truncate text-sm font-black tracking-wide">LA LEYENDA</p>
            <p className="hidden text-[9px] uppercase tracking-[0.2em] text-muted-foreground sm:block">
              CS2 Career Simulator
            </p>
          </div>
        </Link>

        <nav className="flex shrink-0 items-center gap-0.5 text-sm sm:gap-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-2 py-1.5 text-[12px] text-muted-foreground transition hover:bg-muted hover:text-foreground sm:px-2.5 sm:text-[13px]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
