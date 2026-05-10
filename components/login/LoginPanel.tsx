"use client";

import { useTransition } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

export function LoginPanel() {
  const [isPending, startTransition] = useTransition();

  return (
    <Card className="w-full rounded-[2rem] border-border/70 bg-background/90 py-0 shadow-[0_36px_120px_-70px_rgba(15,23,42,0.55)]">
      <CardHeader className="border-b border-border/70 px-6 py-6 text-center sm:px-8">
        <CardTitle className="text-3xl font-semibold tracking-tight">Welcome back</CardTitle>
        <CardDescription className="mx-auto max-w-sm text-base leading-7">
          Connect your GitHub account and drop straight into your dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-6 py-6 sm:px-8">
        <div className="rounded-[1.4rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,251,245,1),rgba(249,246,240,1))] p-5">
          <p className="text-sm font-medium text-foreground">What happens next</p>
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <div className="rounded-2xl bg-background/80 px-3 py-3">
              GitHub OAuth creates your session and links your developer identity.
            </div>
            <div className="rounded-2xl bg-background/80 px-3 py-3">
              Your dashboard loads repos, open PRs, notes, and momentum widgets.
            </div>
          </div>
        </div>

        <Button
          className="h-12 w-full rounded-full text-base shadow-[0_18px_40px_-20px_var(--color-primary)]"
          disabled={isPending}
          onClick={() =>
            startTransition(() => {
              void signIn("github", { callbackUrl: "/dashboard" });
            })
          }
        >
          <GithubIcon className="mr-2 h-4 w-4" />
          {isPending ? "Redirecting to GitHub..." : "Continue with GitHub"}
        </Button>

        <p className="text-center text-sm leading-6 text-muted-foreground">
          By continuing, you are opening your personal board. Need a quick tour first?{" "}
          <Link
            href="/#features"
            className="font-medium text-foreground underline decoration-primary/40 underline-offset-4"
          >
            Explore the features
            <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" />
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
