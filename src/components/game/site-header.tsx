import Link from "next/link";

import { BrandLogo } from "@/components/art/brand-logo";

const LINKS = [
  { href: "/", label: "Jugar" },
  { href: "/ranking", label: "Ranking" },
  { href: "/profile", label: "Perfil" },
];

export function SiteHeader() {
  return (
    <header className="shrink-0 border-b border-border/50 bg-black/40 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-3 px-4 py-2">
        <Link href="/" className="group flex items-center gap-2.5">
          <BrandLogo
            size={36}
            priority
            className="transition duration-300 group-hover:scale-105 group-hover:border-primary group-hover:shadow-[0_0_0_1px_rgba(232,163,23,0.22),0_0_18px_rgba(232,163,23,0.55),0_0_36px_rgba(232,163,23,0.22)]"
          />
          <div className="leading-none">
            <p className="text-sm font-black tracking-wide">LA LEYENDA</p>
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              CS2 Career Simulator
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-2.5 py-1 text-[13px] text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
