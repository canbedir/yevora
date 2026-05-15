import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  FolderGit2,
  NotebookPen,
  ShieldCheck,
  TimerReset,
} from "lucide-react";

import { LoginPanel } from "@/components/login/LoginPanel";
import { authOptions } from "@/lib/auth";

export const unstable_instant = false;

interface LoginPageProps {
  searchParams: Promise<{
    error?: string | string[];
  }>;
}

const highlights = [
  {
    icon: FolderGit2,
    title: "GitHub activity",
    description: "Repos, PRs, and review queues stay visible",
  },
  {
    icon: TimerReset,
    title: "Focus sessions",
    description: "Pomodoro connected to real output",
  },
  {
    icon: NotebookPen,
    title: "Searchable notes",
    description: "Loose thoughts close to the work",
  },
  {
    icon: ShieldCheck,
    title: "Visible momentum",
    description: "Streaks make progress obvious",
  },
];

export default async function Page({ searchParams }: LoginPageProps) {
  const session = await getServerSession(authOptions);
  const resolvedSearchParams = await searchParams;
  const error = Array.isArray(resolvedSearchParams.error)
    ? resolvedSearchParams.error[0]
    : resolvedSearchParams.error;

  if (session) {
    redirect("/today");
  }

  return (
    <div className="min-h-screen bg-[#f7f2ea] lg:h-screen lg:overflow-hidden">
      <div className="mx-auto grid min-h-screen w-full max-w-[1120px] gap-12 px-6 py-8 lg:h-screen lg:grid-cols-[1fr_0.94fr] lg:items-center lg:px-8 lg:py-6">
        <section className="max-w-[500px]">
          <h1 className="mt-6 max-w-[480px] text-[clamp(2.65rem,5vw,4.55rem)] font-semibold leading-[0.96] tracking-[-0.06em] text-[#181411]">
            A calmer way to{" "}
            <span className="text-[#cc8717]">re-enter your workday.</span>
          </h1>

          <p className="mt-6 max-w-[470px] text-[1rem] leading-7 text-[#675f55]">
            Keep repositories, review queues, notes, and weekly momentum in one
            composed surface so you can resume work without rebuilding context.
          </p>

          <div className="mt-9 grid gap-3.5 sm:grid-cols-2">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-[1.45rem] border border-[#eadfce] bg-[#fbf8f2] px-4 py-4 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset]"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1eadf] text-[#7a7062]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h2 className="mt-5 text-[0.98rem] font-semibold tracking-[-0.03em] text-[#181411]">
                    {item.title}
                  </h2>
                  <p className="mt-1.5 text-[0.92rem] leading-6 text-[#6e675d]">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="flex justify-center lg:justify-end">
          <LoginPanel error={error ?? null} />
        </section>
      </div>
    </div>
  );
}
