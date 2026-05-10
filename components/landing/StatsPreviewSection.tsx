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
    <section id="proof" className="py-24">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 md:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)] lg:items-center">
        <div className="max-w-xl">
          <Badge variant="outline" className="rounded-full border-sky-500/20 bg-sky-500/8 px-3 py-1 text-sky-700">
            Weekly visibility
          </Badge>
          <h2 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">
            The dashboard should answer one question fast:
            <span className="block text-muted-foreground">am I actually moving this week?</span>
          </h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Yevora turns raw activity into signals you can act on. Commit graphs, focus time,
            searchable notes, and streak indicators sit next to each other so you can read the
            whole story instead of isolated metrics.
          </p>
          <div className="mt-8 space-y-4">
            {[
              "GitHub activity stays visible while you work, not after the fact.",
              "Markdown notes become searchable context for tomorrow-you.",
              "Focus sessions convert into proof, not just elapsed time.",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <Sparkles className="mt-1 h-4 w-4 text-primary" />
                <p className="text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/12 via-transparent to-sky-500/12 blur-2xl" />
          <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-background/92 shadow-[0_36px_120px_-60px_rgba(15,23,42,0.55)]">
            <div className="border-b border-border/70 px-5 py-4">
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

            <div className="grid gap-4 p-5 xl:grid-cols-[1fr_0.82fr]">
              <div className="rounded-[1.5rem] border border-border/70 bg-muted/25 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Commit + focus cadence</p>
                    <p className="text-xs text-muted-foreground">This week</p>
                  </div>
                  <Flame className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-6 flex h-44 items-end gap-3">
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

              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-border/70 bg-card p-4">
                  <p className="text-sm font-medium">Searchable notes</p>
                  <div className="mt-4 rounded-2xl border border-border/60 bg-background px-3 py-3">
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
                        className="rounded-2xl bg-muted/35 px-3 py-2 text-sm text-muted-foreground"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-border/70 bg-card p-4">
                  <p className="text-sm font-medium">What you notice instantly</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {[
                      { label: "Open PRs", value: "05" },
                      { label: "Commits today", value: "08" },
                      { label: "Focus total", value: "14h" },
                      { label: "Notes searched", value: "19" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-border/60 bg-muted/25 px-3 py-3"
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
