import { Flame, Search, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const columns = [
  { day: "Mon", commits: 4, focus: "2h 10m" },
  { day: "Tue", commits: 7, focus: "3h 05m" },
  { day: "Wed", commits: 3, focus: "1h 45m" },
  { day: "Thu", commits: 8, focus: "3h 20m" },
  { day: "Fri", commits: 6, focus: "2h 55m" },
];

export function StatsPreviewSection() {
  return (
    <section id="proof" data-landing-section className="relative overflow-hidden py-28">
      <div
        data-landing-parallax
        className="landing-orb absolute left-[8%] top-24 h-36 w-36 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        data-landing-parallax
        className="landing-orb landing-orb-delay absolute right-[10%] bottom-18 h-36 w-36 rounded-full bg-sky-500/10 blur-3xl"
      />
      <div className="mx-auto grid w-full max-w-[88rem] gap-16 px-5 md:px-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(520px,1.08fr)] xl:items-center">
        <div data-landing-item="section" className="max-w-xl xl:pr-4">
          <Badge
            variant="outline"
            className="rounded-full border-sky-500/20 bg-sky-500/8 px-4 py-1.5 text-sky-700 shadow-[0_18px_42px_-32px_rgba(14,165,233,0.28)]"
          >
            Weekly visibility
          </Badge>
          <h2 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            The dashboard should answer one question fast:
            <span className="block text-muted-foreground">am I actually moving this week?</span>
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Yevora turns raw activity into signals you can act on. Commit graphs, focus time,
            searchable notes, and streak indicators sit next to each other so you can read the
            whole story instead of isolated metrics.
          </p>
          <div data-landing-stagger="proof-copy" className="mt-10 space-y-4">
            {[
              "GitHub activity stays visible while you work, not after the fact.",
              "Markdown notes become searchable context for tomorrow-you.",
              "Focus sessions convert into proof, not just elapsed time.",
            ].map((item) => (
              <div
                key={item}
                data-landing-item="group"
                className="landing-panel flex items-start gap-3 rounded-[1.35rem] border border-white/80 bg-background/76 px-4 py-4 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.42)]"
              >
                <Sparkles className="mt-1 h-4 w-4 shrink-0 text-primary" />
                <p className="text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div data-landing-item="section" className="relative">
          <div className="absolute inset-0 -z-10 rounded-[2.4rem] bg-gradient-to-br from-primary/12 via-transparent to-sky-500/12 blur-2xl" />
          <div className="landing-panel overflow-hidden rounded-[2.4rem] border border-white/85 bg-background/92 shadow-[0_40px_130px_-62px_rgba(15,23,42,0.52)]">
            <div className="border-b border-border/70 px-6 py-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Weekly summary
                  </p>
                  <p className="mt-1 text-lg font-semibold tracking-tight">
                    Focus and output finally share the same room
                  </p>
                </div>
                <Badge className="rounded-full bg-emerald-500/12 px-3 py-1 text-emerald-700">
                  11 day streak
                </Badge>
              </div>
            </div>

            <div className="grid gap-5 p-6 xl:grid-cols-[1fr_0.88fr]">
              <div className="landing-panel rounded-[1.6rem] border border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(249,247,241,0.92))] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-medium">Commit + focus cadence</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">This week</p>
                  </div>
                  <Flame className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-7 flex h-48 items-end gap-3">
                  {columns.map((column) => (
                    <div key={column.day} className="flex flex-1 flex-col items-center gap-3">
                      <div className="flex w-full flex-col justify-end gap-1">
                        <div
                          className="rounded-t-[1rem] bg-sky-500/25"
                          style={{ height: `${column.commits * 11}px` }}
                        />
                        <div
                          className="rounded-t-[1rem] bg-gradient-to-t from-primary to-amber-400"
                          style={{ height: `${column.commits * 8}px` }}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium">{column.day}</p>
                        <p className="text-[11px] text-muted-foreground">{column.focus}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <div className="landing-panel rounded-[1.6rem] border border-border/60 bg-card p-5">
                  <p className="text-base font-medium">Searchable notes</p>
                  <div className="mt-4 rounded-[1.25rem] border border-border/60 bg-background px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Search className="h-4 w-4" />
                      retry oauth callback
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {[
                      "Found in 'Sprint notes / Friday ship checklist'",
                      "Related to 2 repositories and 1 open pull request",
                    ].map((item) => (
                      <div
                        key={item}
                        className="landing-panel rounded-[1.15rem] bg-muted/35 px-4 py-3 text-sm leading-6 text-muted-foreground"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="landing-panel rounded-[1.6rem] border border-border/60 bg-card p-5">
                  <p className="text-base font-medium">What you notice instantly</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {[
                      { label: "Open PRs", value: "05" },
                      { label: "Commits today", value: "08" },
                      { label: "Focus total", value: "14h" },
                      { label: "Notes searched", value: "19" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="landing-panel rounded-[1.15rem] border border-border/60 bg-muted/25 px-4 py-4"
                      >
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          {item.label}
                        </p>
                        <p className="mt-2 text-2xl font-semibold tracking-tight">{item.value}</p>
                      </div>
                    ))}
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
