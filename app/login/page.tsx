import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft, Flame, FolderGit2, Search, TimerReset } from "lucide-react";

import { LoginPanel } from "@/components/login/LoginPanel";
import { Badge } from "@/components/ui/badge";
import { authOptions } from "@/lib/auth";

export const unstable_instant = false;

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(236,170,58,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.15),transparent_24%),linear-gradient(180deg,rgba(255,252,247,1),rgba(255,255,255,1))]" />
      <div className="absolute left-1/2 top-10 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2rem] border border-border/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.92),rgba(245,240,231,0.9))] p-7 shadow-[0_36px_120px_-70px_rgba(15,23,42,0.55)] md:p-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to landing
          </Link>

          <Badge variant="outline" className="mt-8 rounded-full border-primary/20 bg-background/80 px-3 py-1 text-muted-foreground">
            Personal developer command center
          </Badge>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            Sign in once.
            <span className="block bg-gradient-to-r from-primary to-sky-600 bg-clip-text text-transparent">
              Keep your whole workflow in view.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            GitHub data, focus sessions, notes, and streaks live in one quiet interface so
            you can spend less energy reconstructing context.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: FolderGit2,
                title: "GitHub activity",
                description: "Repos, pull requests, and issues without context switching.",
                tone: "text-primary bg-primary/10",
              },
              {
                icon: TimerReset,
                title: "Focus sessions",
                description: "Pomodoros tied back to real commit output.",
                tone: "text-sky-700 bg-sky-500/10",
              },
              {
                icon: Search,
                title: "Searchable notes",
                description: "Markdown thoughts saved to Postgres and easy to recover.",
                tone: "text-amber-700 bg-amber-500/10",
              },
              {
                icon: Flame,
                title: "Visible momentum",
                description: "Weekly graphs and streaks that make progress obvious.",
                tone: "text-emerald-700 bg-emerald-500/10",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-[1.6rem] border border-border/70 bg-background/80 p-5"
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold tracking-tight">{item.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="flex items-center">
          <LoginPanel />
        </section>
      </div>
    </div>
  );
}
