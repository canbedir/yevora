"use client";

import { useTransition } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { ArrowUpRight, Clock3, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

const sessionSignals = [
  {
    label: "Identity",
    value: "GitHub OAuth",
    icon: ShieldCheck,
  },
  {
    label: "Setup",
    value: "Under a minute",
    icon: Clock3,
  },
  {
    label: "Result",
    value: "Board ready",
    icon: Sparkles,
  },
];

const firstMinuteItems = [
  "GitHub session connects your identity",
  "Repos and PRs load into one dashboard",
  "Land with context already arranged",
];

export function LoginPanel() {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="w-full max-w-[430px]">
      <div className="rounded-[1.75rem] border border-[#e8dcc9] bg-[#fffdfa] p-6 shadow-[0_14px_30px_rgba(60,45,20,0.05),0_2px_3px_rgba(60,45,20,0.06)] sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#f6ecd8] px-3 py-1 text-[0.78rem] font-medium text-[#d28d1d]">
            Secure GitHub Sign In
          </span>
          <span className="rounded-full bg-[#f1ebe1] px-3 py-1 text-[0.78rem] font-medium text-[#746b5f]">
            Ready in under a minute
          </span>
        </div>

        <div className="mt-6">
          <h2 className="text-[1.9rem] font-semibold leading-tight tracking-[-0.05em] text-[#181411] sm:text-[2.05rem]">
            Bring your board online.
          </h2>
          <p className="mt-3 max-w-[360px] text-[0.96rem] leading-7 text-[#675f55]">
            Sign in once and step into a dashboard that already knows your
            repos, review flow, and note trail.
          </p>
        </div>

        <div className="mt-7 grid grid-cols-3 gap-4">
          {sessionSignals.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#f3ede4] text-[#cc8717]">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="mt-2.5 text-[0.67rem] font-medium uppercase tracking-[0.12em] text-[#8a8174]">
                  {item.label}
                </p>
                <p className="mt-1 text-[0.92rem] font-medium leading-5 tracking-[-0.02em] text-[#181411]">
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-[1.35rem] bg-[#f6f0e8] px-4 py-4">
          <p className="text-[0.98rem] font-semibold tracking-[-0.03em] text-[#181411]">
            Your first minute inside
          </p>

          <div className="mt-4 space-y-2.5">
            {firstMinuteItems.map((item, index) => (
              <div key={item} className="flex items-start gap-4">
                <div className="w-5 shrink-0 pt-0.5 text-[0.8rem] font-medium text-[#d18a18]">
                  0{index + 1}
                </div>
                <p className="text-[0.92rem] leading-6 text-[#675f55]">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <Button
          className="mt-6 h-12 w-full rounded-[1rem] border-[#b97713] bg-[#ca8618] text-[0.96rem] font-semibold text-[#fff8ef] shadow-none hover:bg-[#c07f15]"
          disabled={isPending}
          onClick={() =>
            startTransition(() => {
              void signIn("github", { callbackUrl: "/dashboard" });
            })
          }
        >
          <GithubIcon className="mr-3 h-4 w-4" />
          {isPending ? "Redirecting to GitHub..." : "Continue with GitHub"}
        </Button>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[0.95rem] font-semibold tracking-[-0.03em] text-[#181411]">
              Private by default
            </p>
            <p className="mt-1 text-[0.9rem] leading-6 text-[#675f55]">
              Your personal board opens for your account only.
            </p>
          </div>

          <div>
            <p className="text-[0.95rem] font-semibold tracking-[-0.03em] text-[#181411]">
              Built for resuming
            </p>
            <p className="mt-1 text-[0.9rem] leading-6 text-[#675f55]">
              Designed to get you moving again fast.
            </p>
          </div>
        </div>

        <p className="mt-5 text-center text-[0.84rem] leading-6 text-[#7b7266]">
          Need a quick tour first?{" "}
          <Link
            href="/#features"
            className="font-medium text-[#181411] underline decoration-[#dcb67e] underline-offset-4"
          >
            Explore the features
            <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" />
          </Link>
        </p>
      </div>
    </div>
  );
}
