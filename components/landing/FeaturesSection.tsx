import {
  BarChart3,
  Clock3,
  FolderGit2,
  NotebookPen,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    title: "GitHub you can actually read",
    description:
      "Your repos, open pull requests, issues, and recent commits stay on one screen instead of being buried under browser tabs.",
    icon: FolderGit2,
    accent: "bg-primary/12 text-primary",
  },
  {
    title: "Pomodoro that measures output",
    description:
      "Every focus session is linked to real coding work, so the timer becomes a productivity signal instead of a guilt machine.",
    icon: Clock3,
    accent: "bg-sky-500/12 text-sky-700",
  },
  {
    title: "Notes that belong to the work",
    description:
      "Write markdown notes next to your flow state, then search them later when the idea has value again.",
    icon: NotebookPen,
    accent: "bg-amber-500/12 text-amber-700",
  },
  {
    title: "Weekly momentum, not vanity stats",
    description:
      "Streaks, graphs, and summaries help you spot your best weeks and recover faster when your cadence drops.",
    icon: TrendingUp,
    accent: "bg-emerald-500/12 text-emerald-700",
  },
  {
    title: "One workflow instead of four dashboards",
    description:
      "Yevora connects focus, coding, reading, and note capture into a single daily operating system.",
    icon: Sparkles,
    accent: "bg-rose-500/12 text-rose-700",
  },
  {
    title: "A board that rewards consistency",
    description:
      "Your activity graph becomes something you can react to every day, not just a chart you forget to open.",
    icon: BarChart3,
    accent: "bg-stone-700/10 text-stone-700",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="border-y border-border/70 bg-[linear-gradient(180deg,rgba(247,244,238,0.75),rgba(255,255,255,0.95))] py-24">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div className="max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Built for daily flow
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              The parts of your day that usually fall through the cracks.
            </h2>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              Most dashboards track numbers. Yevora tracks the rhythm behind the numbers:
              what you shipped, how focused you were, and whether you are actually building
              momentum.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="group rounded-[1.75rem] border border-border/70 bg-background/88 p-6 shadow-[0_24px_80px_-56px_rgba(15,23,42,0.5)] transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feature.accent}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight">{feature.title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
