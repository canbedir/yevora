import Link from "next/link";

import { YevoraLogo } from "@/components/brand/YevoraLogo";

export function Footer() {
  return (
    <footer className="border-t border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(250,247,241,0.96))] py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-12 shrink-0 items-center justify-center">
            <YevoraLogo className="h-11 w-12 drop-shadow-[0_10px_18px_rgba(234,88,12,0.14)]" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Yevora
            </p>
            <p className="text-sm text-muted-foreground">
              The personal dashboard for shipping with rhythm.
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">&copy; 2026 Yevora. Built for developers who like clarity.</p>
        <div className="flex gap-2 rounded-full border border-white/80 bg-white/62 p-1.5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.24)]">
          <Link href="#features" className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white/85 hover:text-foreground">
            Features
          </Link>
          <Link href="#proof" className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white/85 hover:text-foreground">
            Momentum
          </Link>
          <Link href="/login" className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white/85 hover:text-foreground">
            Sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}
