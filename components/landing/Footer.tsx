import Link from "next/link";
import { Code2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-background py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
            <Code2 className="h-5 w-5" />
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
        <div className="flex gap-4">
          <Link href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="#proof" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Momentum
          </Link>
          <Link href="/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}
