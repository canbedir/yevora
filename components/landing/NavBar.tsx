"use client";

import Link from "next/link";
import { useState } from "react";
import type { Session } from "next-auth";
import { ArrowUpRight } from "lucide-react";

import { SmartSignInLink } from "@/components/auth/SmartSignInLink";
import { YevoraLogo } from "@/components/brand/YevoraLogo";
import { AnimatedBackground } from "@/components/motion-primitives/AnimatedBackground";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-[rgba(255,252,247,0.68)] backdrop-blur-2xl">
      <div className="mx-auto flex h-18 w-full max-w-[88rem] items-center justify-between px-4 sm:h-20 sm:px-5 md:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2 rounded-full pr-2 transition-colors duration-200 ease-out sm:gap-3"
        >
          <div className="flex h-10 w-12 shrink-0 items-center justify-center transition-transform duration-200 ease-out group-hover:scale-[1.02] sm:h-12 sm:w-14">
            <YevoraLogo
              className="h-10 w-12 drop-shadow-[0_12px_22px_rgba(234,88,12,0.16)] sm:h-12 sm:w-14"
              priority
            />
          </div>
          <div className="min-w-0">
            <p className="hidden text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground sm:block">
              DevBoard
            </p>
            <p className="text-base font-semibold tracking-tight sm:text-lg">Yevora</p>
          </div>
        </Link>

        <nav
          className="hidden items-center gap-0 rounded-full border border-white/80 bg-white/55 p-0.5 shadow-[0_20px_48px_-34px_rgba(15,23,42,0.25)] lg:flex"
          onMouseLeave={() => setHoveredHref(null)}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onMouseEnter={() => setHoveredHref(link.href)}
              onFocus={() => setHoveredHref(link.href)}
              onBlur={() => setHoveredHref((currentValue) => (currentValue === link.href ? null : currentValue))}
              className="group relative isolate overflow-hidden rounded-full px-[14px] py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-200 ease-out hover:text-foreground"
            >
              {hoveredHref === link.href ? (
                <AnimatedBackground
                  layoutId="landing-nav-highlight"
                  className="inset-0 rounded-full border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(247,242,233,0.92))] shadow-[0_18px_36px_-28px_rgba(15,23,42,0.32)]"
                />
              ) : null}
              <span
                className={cn(
                  "absolute inset-x-[14px] bottom-1.5 h-px bg-gradient-to-r from-transparent via-primary/65 to-transparent transition-opacity duration-200 ease-out",
                  hoveredHref === link.href ? "opacity-100" : "opacity-0"
                )}
              />
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
            <Button asChild className="landing-button rounded-full px-4 sm:px-5">
              <SmartSignInLink>
                Sign in
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </SmartSignInLink>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
