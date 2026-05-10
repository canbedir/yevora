import Link from "next/link";
import { ArrowRight, GitBranch, TimerReset } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CTASectionProps {
  isAuthenticated: boolean;
}

const ctaSignals = [
  { label: "Connected repos", value: "06", tone: "text-primary" },
  { label: "Focus this week", value: "14h", tone: "text-sky-700" },
];

export function CTASection({ isAuthenticated }: CTASectionProps) {
  const href = isAuthenticated ? "/dashboard" : "/login";
  const label = isAuthenticated ? "Go to dashboard" : "Connect GitHub";

  return (
    <section id="workflow" className="relative overflow-hidden border-t border-border/70 py-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(236,170,58,0.12),transparent_35%),linear-gradient(180deg,rgba(252,249,244,0.8),rgba(255,255,255,1))]" />
      <div className="landing-orb absolute left-[12%] top-10 -z-10 h-32 w-32 rounded-full bg-primary/12 blur-3xl" />
      <div className="landing-orb landing-orb-delay absolute right-[12%] bottom-0 -z-10 h-36 w-36 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="landing-panel overflow-hidden rounded-[2.5rem] border border-border/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(245,240,231,0.92))] p-8 shadow-[0_36px_120px_-70px_rgba(15,23,42,0.6)] md:p-10">
          <Badge variant="outline" className="rounded-full border-primary/20 bg-background/80 px-3 py-1 text-muted-foreground">
            Your calm command center
          </Badge>
          <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_22rem] lg:items-end">
            <div className="max-w-3xl">
              <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
                Less tab switching, more visible progress.
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                Sign in once and let the dashboard hold the context: what you are building,
                what is waiting for review, how focused you were, and what deserves attention next.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-2">
                  <GitBranch className="h-4 w-4 text-primary" />
                  GitHub repos and pull requests
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-2">
                  <TimerReset className="h-4 w-4 text-sky-700" />
                  Commit-aware Pomodoro sessions
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {ctaSignals.map((item) => (
                  <div
                    key={item.label}
                    className="landing-panel rounded-[1.45rem] border border-white/80 bg-white/72 px-4 py-4 shadow-[0_22px_58px_-40px_rgba(15,23,42,0.32)]"
                  >
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      {item.label}
                    </p>
                    <p className={`mt-2 text-2xl font-semibold tracking-tight ${item.tone}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <Button
                asChild
                size="lg"
                className="landing-button h-13 w-full rounded-full border border-[#c87410] bg-[#e58b19] px-7 text-primary-foreground shadow-[0_22px_58px_-24px_var(--color-primary)] hover:bg-[#e58b19] hover:shadow-[0_30px_70px_-28px_var(--color-primary)] [&_svg]:transition-transform [&_svg]:duration-500 hover:[&_svg]:translate-x-0.5"
              >
                <Link href={href}>
                  {label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
