import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Compass,
  FolderGit2,
  NotebookPen,
  Sparkles,
  TimerReset,
} from "lucide-react";

import { SmartSignInLink } from "@/components/auth/SmartSignInLink";
import { YevoraLogo } from "@/components/brand/YevoraLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const routeSuggestions = [
  {
    href: "/",
    label: "Home",
    description: "Return to the landing page and re-enter from the front door.",
    icon: Compass,
  },
  {
    href: "/login",
    label: "Sign in",
    description: "Reconnect your board and jump back into your daily queue.",
    icon: Sparkles,
  },
  {
    href: "/today",
    label: "Today",
    description: "Pick up the next useful thing without rebuilding context.",
    icon: Sparkles,
  },
  {
    href: "/focus",
    label: "Focus",
    description: "Jump straight into a timer block and keep the output visible.",
    icon: TimerReset,
  },
  {
    href: "/notes",
    label: "Notes",
    description: "Open your searchable note trail and recover the thread fast.",
    icon: NotebookPen,
  },
  {
    href: "/repos",
    label: "Repositories",
    description: "Get back to tracked repos, pull requests, and recent commit flow.",
    icon: FolderGit2,
  },
];

export default function NotFound() {
  return (
    <main className="landing-shell relative flex min-h-screen items-center overflow-hidden bg-[linear-gradient(180deg,rgba(255,252,247,1),rgba(255,255,255,1))] px-5 py-6 md:px-3 md:py-3">
      <div className="landing-orb landing-glow absolute left-1/2 top-8 -z-10 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
      <div className="landing-orb absolute left-[8%] top-[22%] -z-10 hidden h-36 w-36 rounded-full bg-amber-300/18 blur-3xl lg:block" />
      <div className="landing-orb landing-orb-delay absolute right-[8%] bottom-[18%] -z-10 hidden h-40 w-40 rounded-full bg-sky-400/14 blur-3xl lg:block" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="landing-panel relative overflow-hidden rounded-[2.4rem] border border-white/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.98),rgba(247,242,233,0.95))] p-7 shadow-[0_48px_150px_-74px_rgba(15,23,42,0.5)] md:p-10">
          <div className="absolute right-4 top-4 rounded-full border border-white/70 bg-white/78 px-3 py-1 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-muted-foreground shadow-[0_16px_40px_-30px_rgba(15,23,42,0.3)]">
            Error 404
          </div>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-center">
            <div className="relative">
              <div className="pointer-events-none absolute -top-8 left-0 text-[7rem] font-extrabold leading-none tracking-[-0.08em] text-primary/8 md:text-[9rem]">
                404
              </div>

              <Badge
                variant="outline"
                className="relative z-10 mb-6 rounded-full border-white/80 bg-background/88 px-4 py-1.5 text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground shadow-[0_20px_44px_-30px_rgba(15,23,42,0.34)]"
              >
                Wrong turn, calm recovery
              </Badge>

              <h1 className="relative z-10 max-w-3xl text-[clamp(2.9rem,7vw,5.6rem)] font-extrabold leading-[0.92] tracking-[-0.06em] text-foreground">
                This page fell
                <span className="block bg-gradient-to-r from-primary via-amber-500 to-sky-600 bg-clip-text text-transparent">
                  out of the workflow.
                </span>
              </h1>

              <p className="relative z-10 mt-6 max-w-2xl text-[1rem] leading-8 text-muted-foreground md:text-[1.06rem]">
                The route you asked for is not here, but the board is. Let&apos;s get
                you back to a place that still knows what you were doing.
              </p>

              <div className="relative z-10 mt-8 flex flex-col items-start gap-3 sm:flex-row">
                <Button asChild size="lg" className="landing-button h-12 rounded-full px-6">
                  <Link href="/today">
                    Open Today
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="landing-outline-button h-12 rounded-full px-6"
                >
                  <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to home
                  </Link>
                </Button>
              </div>
            </div>

            <div className="landing-panel rounded-[2rem] border border-white/80 bg-white/72 p-6 shadow-[0_24px_80px_-54px_rgba(15,23,42,0.4)] backdrop-blur">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-[1.2rem] border border-white/85 bg-white/88 shadow-[0_20px_44px_-30px_rgba(15,23,42,0.3)]">
                  <YevoraLogo className="h-11 w-11" priority />
                </div>
                <div>
                  <p className="text-[0.76rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Yevora
                  </p>
                  <p className="mt-1 text-xl font-semibold tracking-tight">
                    Route recovery
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {routeSuggestions.map((item) => {
                  const Icon = item.icon;

                  const content = (
                    <>
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.95rem] bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold tracking-tight text-foreground">
                            {item.label}
                          </p>
                          <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </div>
                        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </>
                  );

                  if (item.href === "/login") {
                    return (
                      <SmartSignInLink
                        key={item.href}
                        className="landing-panel flex items-start gap-4 rounded-[1.35rem] border border-white/80 bg-background/82 px-4 py-4 shadow-[0_16px_44px_-34px_rgba(15,23,42,0.28)]"
                      >
                        {content}
                      </SmartSignInLink>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="landing-panel flex items-start gap-4 rounded-[1.35rem] border border-white/80 bg-background/82 px-4 py-4 shadow-[0_16px_44px_-34px_rgba(15,23,42,0.28)]"
                    >
                      {content}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
