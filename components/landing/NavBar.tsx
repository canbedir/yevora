"use client";

import Link from "next/link";
import type { Session } from "next-auth";
import { ArrowUpRight, Code2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const links = [
  { href: "#features", label: "Features" },
  { href: "#workflow", label: "Workflow" },
  { href: "#proof", label: "Momentum" },
];

function getInitials(name?: string | null) {
  const value = name?.trim();

  if (!value) {
    return "YR";
  }

  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

interface NavBarProps {
  user: Session["user"] | null;
}

export function NavBar({ user }: NavBarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-[rgba(255,252,247,0.68)] backdrop-blur-2xl">
      <div className="mx-auto flex h-20 w-full max-w-[88rem] items-center justify-between px-5 md:px-8">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-full pr-2 transition-colors duration-200 ease-out"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-[1.15rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(250,242,226,0.88))] text-primary shadow-[0_18px_42px_-26px_var(--color-primary)] transition-shadow duration-200 ease-out group-hover:shadow-[0_20px_44px_-28px_var(--color-primary)]">
            <Code2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              DevBoard
            </p>
            <p className="text-lg font-semibold tracking-tight">Yevora</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-white/80 bg-white/55 p-1.5 shadow-[0_20px_48px_-34px_rgba(15,23,42,0.25)] lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative overflow-hidden rounded-full px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground"
            >
              <span className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(247,242,233,0.92))] opacity-0 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.32)] transition-opacity duration-200 ease-out group-hover:opacity-100" />
              <span className="absolute inset-x-5 bottom-1.5 h-px bg-gradient-to-r from-transparent via-primary/65 to-transparent opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100" />
              <span className="relative z-10 block">
                {link.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Link href="/today" className="landing-outline-button inline-flex h-auto rounded-full px-2 py-2">
              <div className="flex items-center gap-3">
                <Avatar size="lg" className="border border-border/70">
                  <AvatarImage src={user.image ?? undefined} alt={user.name ?? "Yevora user"} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="hidden min-w-0 text-left sm:block pr-2">
                  <p className="truncate text-sm font-medium">{user.name ?? "Developer"}</p>
                </div>
              </div>
            </Link>
          ) : (
            <Button asChild className="landing-button rounded-full px-5">
              <Link href="/login">
                Sign in
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
