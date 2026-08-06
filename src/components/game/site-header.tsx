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
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md border border-primary/50 bg-primary/15">
            <svg viewBox="0 0 24 24" className="size-4 fill-primary" aria-hidden>
              <path d="M12 2 4 6v6c0 5 3.4 9.1 8 10 4.6-.9 8-5 8-10V6z" opacity="0.3" />
              <path d="M12 6.5 8 8.5V12c0 2.6 1.6 4.8 4 5.5 2.4-.7 4-2.9 4-5.5V8.5z" />
            </svg>
          </span>
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
