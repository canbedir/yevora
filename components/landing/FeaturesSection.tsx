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
    <section
      id="features"
      data-landing-section
      className="relative overflow-hidden border-y border-border/70 bg-[linear-gradient(180deg,rgba(247,244,238,0.76),rgba(255,255,255,0.96))] py-28"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
      <div
        data-landing-parallax
        className="landing-orb absolute left-[-6rem] top-18 h-44 w-44 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        data-landing-parallax
        className="landing-orb landing-orb-delay absolute right-[-4rem] bottom-10 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl"
      />
      <div className="mx-auto w-full max-w-[88rem] px-5 md:px-8">
        <div className="grid gap-12 xl:grid-cols-[0.72fr_1.28fr] xl:items-start">
          <div data-landing-item="section" className="max-w-lg xl:sticky xl:top-28">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Built for daily flow
            </p>
            <h2 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">
              The parts of your day that usually fall through the cracks.
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Most dashboards track numbers. Yevora tracks the rhythm behind the numbers:
              what you shipped, how focused you were, and whether you are actually building
              momentum.
            </p>
            <div className="landing-panel mt-8 rounded-[1.6rem] border border-white/80 bg-white/58 p-5 shadow-[0_26px_70px_-56px_rgba(15,23,42,0.48)] backdrop-blur">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Design direction
              </p>
              <p className="mt-3 text-lg font-semibold tracking-tight">
                Calm surfaces, fast signal, softer motion.
              </p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Every card now reacts like it belongs to one polished operating system rather
                than a group of isolated widgets.
              </p>
            </div>
          </div>

          <div data-landing-stagger="features" className="grid gap-5 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  data-landing-item="group"
                  className="landing-panel group rounded-[1.9rem] border border-white/85 bg-background/90 p-7 shadow-[0_24px_80px_-56px_rgba(15,23,42,0.5)] hover:border-primary/18"
                >
                  <div className="absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-white/85 to-transparent opacity-80" />
                  <div
                    className={`relative z-10 flex h-13 w-13 items-center justify-center rounded-[1.15rem] ${feature.accent} shadow-[0_18px_42px_-28px_rgba(15,23,42,0.35)] transition-shadow duration-200 ease-out group-hover:shadow-[0_20px_44px_-30px_rgba(15,23,42,0.38)]`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="mt-6 text-[1.35rem] font-semibold tracking-tight">{feature.title}</h3>
                    <p className="mt-3.5 leading-7 text-muted-foreground">{feature.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
