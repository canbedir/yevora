import Link from "next/link";
import {
  ArrowRight,
  Flame,
  GitPullRequest,
  NotebookPen,
  Search,
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
const heroStats = [
  { label: "Weekly commits", value: "34", tone: "from-primary/14 to-primary/4" },
  { label: "Focus streak", value: "11 days", tone: "from-sky-500/12 to-sky-500/4" },
  { label: "Open PR visibility", value: "100%", tone: "from-emerald-500/12 to-emerald-500/4" },
];
const rhythmTags = ["GitHub synced", "Commit-aware focus", "Searchable notes"];
const overviewStats = [
  { label: "Commits", value: "34" },
  { label: "Focus", value: "14h" },
  { label: "Streak", value: "11d" },
];
const focusDetails = [
  { label: "Session output", value: "2 commits" },
  { label: "Next target", value: "Auth polish" },
];
const noteItems = [
  "Review auth PR before lunch",
  "Convert focus logs into streak points",
  "Ship landing polish after the next break",
];
const commitLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface HeroSectionProps {
  isAuthenticated: boolean;
}

export function HeroSection({ isAuthenticated }: HeroSectionProps) {
  const ctaHref = isAuthenticated ? "/today" : "/login";
  const ctaLabel = isAuthenticated ? "Open Today" : "Start with GitHub";

  return (
    <section className="relative overflow-hidden pb-28 pt-16 md:pb-36 md:pt-20">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(236,170,58,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(32,174,210,0.14),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.88),rgba(253,249,241,0.96)_54%,rgba(255,255,255,1))]" />
      <div className="landing-orb landing-glow absolute left-1/2 top-0 -z-10 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
      <div className="landing-orb landing-orb-delay absolute left-[10%] top-28 -z-10 hidden h-32 w-32 rounded-full bg-amber-300/18 blur-3xl lg:block" />
      <div className="landing-orb absolute right-[9%] top-44 -z-10 hidden h-36 w-36 rounded-full bg-sky-400/16 blur-3xl lg:block" />
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="mx-auto w-full max-w-[88rem] px-5 md:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <Badge
            variant="outline"
            className="mb-7 h-auto rounded-full border-white/80 bg-background/88 px-4 py-1.5 text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground shadow-[0_20px_44px_-30px_rgba(15,23,42,0.34)]"
          >
            GitHub + Pomodoro + Notes + Streaks
          </Badge>

          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {rhythmTags.map((tag) => (
              <span
                key={tag}
                className="landing-outline-button rounded-full px-3 py-1.5 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="mx-auto max-w-4xl text-[clamp(3.5rem,10vw,7.5rem)] font-extrabold leading-[0.9] tracking-[-0.06em] text-foreground">
            Your developer
            <span className="block">rhythm,</span>
            <span className="block bg-gradient-to-r from-primary via-amber-500 to-sky-600 bg-clip-text text-transparent">
              visible in one board.
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-[1.05rem] leading-8 text-muted-foreground md:text-xl md:leading-9">
            Yevora pulls your repositories, pull requests, notes, focus sessions, and
            weekly streaks into a single command center so your momentum never disappears
            between tabs.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="landing-button h-13 rounded-full px-7 text-[0.95rem]"
            >
              <Link href={ctaHref}>
                {ctaLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="landing-outline-button h-13 rounded-full px-7 text-[0.95rem]"
            >
              <Link href="#proof">See the workflow</Link>
            </Button>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
            {heroStats.map((item) => (
              <div
                key={item.label}
                className={cn(
                  "landing-panel cursor-default rounded-[1.75rem] border border-white/85 bg-gradient-to-br p-5 shadow-[0_28px_64px_-48px_rgba(15,23,42,0.42)] backdrop-blur",
                  item.tone
                )}
              >
                <p className="relative z-10 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {item.label}
                </p>
                <p className="relative z-10 mt-3 text-[2rem] font-semibold tracking-[-0.04em]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto mt-18 w-full max-w-6xl">
          <div className="landing-orb absolute -left-10 top-10 hidden h-40 w-40 rounded-full bg-primary/18 blur-3xl xl:block" />
          <div className="landing-orb landing-orb-delay absolute -right-12 bottom-12 hidden h-44 w-44 rounded-full bg-sky-500/16 blur-3xl xl:block" />
          <div className="absolute left-8 top-6 hidden rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground shadow-[0_18px_42px_-28px_rgba(15,23,42,0.3)] lg:block">
            Live command center
          </div>
          <div className="absolute bottom-8 right-8 hidden rounded-[1.35rem] border border-white/75 bg-white/72 px-4 py-3 text-left shadow-[0_22px_56px_-34px_rgba(15,23,42,0.36)] backdrop-blur lg:block">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Weekly clarity
            </p>
            <p className="mt-2 text-lg font-semibold tracking-tight">8 commits today</p>
          </div>

          <div className="landing-panel relative overflow-hidden rounded-[2.6rem] border border-white/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.98),rgba(247,242,233,0.95))] p-5 shadow-[0_48px_150px_-70px_rgba(15,23,42,0.52)]">
            <div className="mb-4 flex items-center justify-between rounded-[1.4rem] border border-white/75 bg-background/78 px-4 py-3 backdrop-blur">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-primary/85" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-sky-500/80" />
              </div>
              <div className="rounded-full border border-emerald-500/18 bg-emerald-500/10 px-3 py-1 text-xs font-medium tracking-[0.14em] text-emerald-700 uppercase">
                Synced live
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/75 bg-background/92 p-5 md:p-6">
              <div className="landing-panel rounded-[1.45rem] border border-border/55 bg-[linear-gradient(135deg,rgba(255,255,255,1),rgba(248,244,237,0.96))] p-5 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      This week
                    </p>
                    <p className="mt-2 text-xl font-semibold tracking-tight">
                      Commit momentum looks strong
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      One board for code, focus, and note recovery.
                    </p>
                  </div>
                  <Badge className="rounded-full bg-emerald-500/12 px-3 py-1.5 text-emerald-700">
                    +18%
                  </Badge>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 md:max-w-md">
                  {overviewStats.map((item) => (
                    <div
                      key={item.label}
                      className="landing-panel rounded-[1.1rem] border border-white/80 bg-white/82 px-4 py-3"
                    >
                      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
                <div className="space-y-5">
                  <div className="landing-panel rounded-[1.55rem] border border-border/55 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(250,247,241,0.86))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-medium">Commit rhythm</p>
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          7-day GitHub sync
                        </p>
                      </div>
                      <GitPullRequest className="h-4 w-4 text-primary" />
                    </div>

                    <div className="mt-6 rounded-[1.35rem] border border-border/40 bg-white/70 px-5 pb-5 pt-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                      <div className="flex h-48 items-end gap-3 md:gap-4">
                        {cadence.map((value, index) => (
                          <div key={value + index} className="flex flex-1 flex-col items-center gap-3">
                            <div
                              className="w-full rounded-t-[1rem] bg-gradient-to-t from-primary via-amber-500 to-amber-300 shadow-[0_12px_26px_-18px_var(--color-primary)]"
                              style={{ height: `${value}%` }}
                            />
                            <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground/90">
                              {commitLabels[index]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="landing-panel rounded-[1.55rem] border border-border/55 bg-white/90 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-medium">Activity heatmap</p>
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          Commit + focus consistency
                        </p>
                      </div>
                      <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-700">
                        <Flame className="h-4 w-4" />
                        11-day streak
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-7 gap-2.5">
                      {heatmap.map((value, index) => (
                        <div
                          key={value + index}
                          className={cn("aspect-square rounded-xl border border-border/35 bg-primary/10")}
                          style={{ opacity: value }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="landing-panel rounded-[1.55rem] border border-sky-500/15 bg-[linear-gradient(180deg,rgba(238,247,255,0.9),rgba(255,255,255,0.96))] p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-medium">Focus session</p>
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          Current Pomodoro
                        </p>
                      </div>
                      <TimerReset className="h-4 w-4 text-sky-600" />
                    </div>

                    <div className="mt-5 rounded-[1.3rem] border border-white/75 bg-white/80 p-5">
                      <p className="text-[3.35rem] font-semibold leading-none tracking-[-0.06em]">
                        18:42
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Deep work in progress. Commits are being logged into this session.
                      </p>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                      {focusDetails.map((item) => (
                        <div
                          key={item.label}
                          className="landing-panel rounded-[1.05rem] border border-white/75 bg-white/82 px-4 py-3"
                        >
                          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            {item.label}
                          </p>
                          <p className="mt-2 text-sm font-medium text-foreground">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="landing-panel rounded-[1.55rem] border border-border/55 bg-white/90 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-medium">Developer notes</p>
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          Markdown search ready
                        </p>
                      </div>
                      <NotebookPen className="h-4 w-4 text-amber-600" />
                    </div>

                    <div className="mt-4 rounded-[1.1rem] border border-border/55 bg-background/80 px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Search className="h-4 w-4" />
                        auth polish
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {noteItems.map((item) => (
                        <div
                          key={item}
                          className="landing-panel rounded-[1.1rem] border border-border/55 bg-muted/24 px-4 py-3 text-sm leading-6 text-muted-foreground"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
