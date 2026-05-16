import Link from "next/link";

import { SmartSignInLink } from "@/components/auth/SmartSignInLink";
import { YevoraLogo } from "@/components/brand/YevoraLogo";

export function Footer() {
  return (
    <footer className="border-t border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(250,247,241,0.96))] py-6 sm:py-8">
      <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 text-center sm:gap-5 md:grid-cols-[1fr_auto_1fr] md:items-center md:px-6 md:text-left">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-3 md:justify-self-start">
          <div className="flex h-10 w-11 shrink-0 items-center justify-center sm:h-11 sm:w-12">
            <YevoraLogo className="h-10 w-11 drop-shadow-[0_10px_18px_rgba(234,88,12,0.14)] sm:h-11 sm:w-12" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Yevora
            </p>
            <p className="mx-auto max-w-[17rem] text-sm leading-6 text-muted-foreground sm:mx-0">
              The personal dashboard for shipping with rhythm
            </p>
          </div>
        </div>
        <p className="text-sm font-medium text-muted-foreground md:text-center">&copy; 2026 Yevora</p>
        <div className="grid grid-cols-3 gap-1.5 rounded-2xl border border-white/80 bg-white/62 p-1.5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.24)] sm:inline-flex sm:flex-wrap sm:justify-center sm:gap-2 sm:rounded-full md:justify-self-end">
          <Link href="#features" className="rounded-xl px-3 py-2 text-center text-sm text-muted-foreground transition-colors hover:bg-white/85 hover:text-foreground sm:rounded-full sm:py-1.5">
            Features
          </Link>
          <Link href="#proof" className="rounded-xl px-3 py-2 text-center text-sm text-muted-foreground transition-colors hover:bg-white/85 hover:text-foreground sm:rounded-full sm:py-1.5">
            Momentum
          </Link>
          <SmartSignInLink className="rounded-xl px-3 py-2 text-center text-sm text-muted-foreground transition-colors hover:bg-white/85 hover:text-foreground sm:rounded-full sm:py-1.5">
            Sign in
          </SmartSignInLink>
        </div>
      </div>
    </footer>
  );
}
