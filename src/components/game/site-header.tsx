import Image from "next/image";
import Link from "next/link";

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
          <Image
            src="/brand/logo-256.webp"
            alt="La Leyenda"
            width={36}
            height={36}
            priority
            className="size-9 drop-shadow-[0_0_12px_rgba(245,158,11,0.35)] transition duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_16px_rgba(245,158,11,0.55)]"
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
