import Link from "next/link";
import {
  ArrowRight,
  Flame,
  GitPullRequest,
  NotebookPen,
  TimerReset,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const cadence = [36, 58, 44, 72, 65, 80, 90];
const heatmap = [
  0.25, 0.48, 0.18, 0.65, 0.88, 0.52, 0.36,
  0.56, 0.72, 0.44, 0.3, 0.92, 0.38, 0.6,
  0.2, 0.4, 0.76, 0.58, 0.94, 0.62, 0.5,
];
const noteItems = [
  "Review the open auth PR before lunch",
  "Convert focus logs into weekly streak points",
  "Write release notes after the next Pomodoro",
];

interface HeroSectionProps {
  isAuthenticated: boolean;
}

export function HeroSection({ isAuthenticated }: HeroSectionProps) {
  const ctaHref = isAuthenticated ? "/dashboard" : "/login";
  const ctaLabel = isAuthenticated ? "Open Dashboard" : "Start with GitHub";

  return (
    <section className="relative overflow-hidden pb-24 pt-16 md:pb-28 md:pt-20">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(236,170,58,0.18),transparent_35%),radial-gradient(circle_at_top_right,rgba(32,174,210,0.16),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(253,250,245,0.98))]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="mx-auto grid w-full max-w-7xl gap-14 px-4 md:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)] lg:items-center">
        <div className="max-w-2xl">
          <Badge
            variant="outline"
            className="mb-6 h-auto rounded-full border-primary/20 bg-background/80 px-3 py-1 text-[0.72rem] uppercase tracking-[0.18em] text-muted-foreground"
          >
            GitHub + Pomodoro + Notes + Streaks
          </Badge>
          <h1 className="max-w-4xl text-5xl font-extrabold leading-[0.95] tracking-[-0.05em] text-foreground md:text-7xl">
            Your developer rhythm,
            <span className="block bg-gradient-to-r from-primary via-amber-500 to-sky-600 bg-clip-text text-transparent">
              visible in one board.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground md:text-lg">
            Yevora pulls your repositories, pull requests, notes, focus sessions, and
            weekly streaks into a single command center so your momentum never disappears
            between tabs.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full px-6 shadow-[0_18px_40px_-20px_var(--color-primary)]"
            >
              <Link href={ctaHref}>
                {ctaLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 rounded-full px-6">
              <Link href="#proof">See the workflow</Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Weekly commits", value: "34" },
              { label: "Focus streak", value: "11 days" },
              { label: "Open PR visibility", value: "100%" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-3xl border border-border/70 bg-background/75 p-4 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.6)] backdrop-blur"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-12 top-8 hidden h-32 w-32 rounded-full bg-primary/18 blur-3xl lg:block" />
          <div className="absolute -right-10 bottom-10 hidden h-36 w-36 rounded-full bg-sky-500/18 blur-3xl lg:block" />
          <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.95),rgba(246,241,233,0.9))] p-4 shadow-[0_40px_140px_-60px_rgba(15,23,42,0.55)]">
            <div className="rounded-[1.6rem] border border-border/60 bg-background/90 p-4">
              <div className="flex items-center justify-between rounded-[1.3rem] border border-border/60 bg-muted/35 px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    This week
                  </p>
                  <p className="mt-1 text-lg font-semibold tracking-tight">
                    Commit momentum looks strong
                  </p>
                </div>
                <Badge className="rounded-full bg-emerald-500/12 px-3 py-1 text-emerald-700">
                  +18%
                </Badge>
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-[1.3rem] border border-border/60 bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Commit cadence</p>
                      <p className="text-xs text-muted-foreground">7-day GitHub sync</p>
                    </div>
                    <GitPullRequest className="h-4 w-4 text-primary" />
                  </div>
                  <div className="mt-6 flex h-36 items-end gap-2">
                    {cadence.map((value, index) => (
                      <div key={value + index} className="flex flex-1 flex-col items-center gap-2">
                        <div
                          className="w-full rounded-t-full bg-gradient-to-t from-primary to-amber-400"
                          style={{ height: `${value}%` }}
                        />
                        <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[1.3rem] border border-border/60 bg-card p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Focus session</p>
                        <p className="text-xs text-muted-foreground">Current Pomodoro</p>
                      </div>
                      <TimerReset className="h-4 w-4 text-sky-600" />
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <p className="text-4xl font-semibold tracking-tight">18:42</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          2 commits logged in this session
                        </p>
                      </div>
                      <div className="rounded-2xl bg-sky-500/10 px-3 py-2 text-right text-sm text-sky-700">
                        <p className="font-medium">On track</p>
                        <p className="text-xs">Next break in 18 min</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.3rem] border border-border/60 bg-card p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Developer notes</p>
                        <p className="text-xs text-muted-foreground">Markdown search ready</p>
                      </div>
                      <NotebookPen className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="mt-4 space-y-2">
                      {noteItems.map((item) => (
                        <div
                          key={item}
                          className="rounded-2xl border border-border/60 bg-muted/30 px-3 py-2 text-sm text-muted-foreground"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[1.3rem] border border-border/60 bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Activity heatmap</p>
                    <p className="text-xs text-muted-foreground">Commit + focus consistency</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                    <Flame className="h-4 w-4" />
                    11-day streak
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-7 gap-2">
                  {heatmap.map((value, index) => (
                    <div
                      key={value + index}
                      className={cn("aspect-square rounded-lg border border-border/40 bg-primary/10")}
                      style={{ opacity: value }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
