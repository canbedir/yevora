"use client";

import Link from "next/link";
import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { ArrowUpRight, Code2, LayoutDashboard, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
          className="group flex items-center gap-3 rounded-full pr-2 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-[1.15rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(250,242,226,0.88))] text-primary shadow-[0_18px_42px_-26px_var(--color-primary)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:rotate-3 group-hover:shadow-[0_24px_52px_-28px_var(--color-primary)]">
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
              className="group relative overflow-hidden rounded-full px-5 py-2.5 text-sm font-medium text-muted-foreground transition-[color,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:text-foreground"
            >
              <span className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(247,242,233,0.92))] opacity-0 scale-[0.94] shadow-[0_18px_36px_-28px_rgba(15,23,42,0.32)] transition-[opacity,transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-100 group-hover:opacity-100 group-hover:shadow-[0_22px_44px_-28px_rgba(15,23,42,0.34)]" />
              <span className="absolute inset-x-5 bottom-1.5 h-px origin-center scale-x-50 bg-gradient-to-r from-transparent via-primary/65 to-transparent opacity-0 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 group-hover:opacity-100" />
              <span className="absolute left-3.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(251,191,36,1),rgba(217,119,6,0.92))] opacity-0 shadow-[0_0_20px_rgba(217,119,6,0.42)] transition-[opacity,transform,scale] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-100 group-hover:opacity-100 group-hover:translate-x-0.5" />
              <span className="relative z-10 block transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2.5">
                {link.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button asChild variant="ghost" className="hidden rounded-full px-4 sm:inline-flex">
                <Link href="/dashboard">
                  Dashboard
                  <LayoutDashboard className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="landing-outline-button h-auto rounded-full border border-white/80 bg-white/68 px-2 py-2 shadow-[0_18px_42px_-32px_rgba(15,23,42,0.26)]"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar size="lg" className="border border-border/70">
                        <AvatarImage src={user.image ?? undefined} alt={user.name ?? "Yevora user"} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="hidden min-w-0 text-left sm:block">
                        <p className="truncate text-sm font-medium">{user.name ?? "Developer"}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.email ?? "GitHub connected"}</p>
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="space-y-1">
                    <p>{user.name ?? "Developer"}</p>
                    <p className="font-normal text-muted-foreground">{user.email ?? "GitHub connected"}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Open dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="landing-outline-button hidden rounded-full border border-white/70 bg-white/45 px-4 backdrop-blur-sm sm:inline-flex hover:border-primary/18 hover:bg-white/72 hover:shadow-[0_18px_40px_-28px_rgba(15,23,42,0.28)]"
              >
                <Link href="/login">Sign in</Link>
              </Button>
              <Button
                asChild
                className="landing-button rounded-full border border-[#c87410] bg-[#e58b19] px-5 text-primary-foreground shadow-[0_22px_58px_-26px_var(--color-primary)] hover:bg-[#e58b19] hover:shadow-[0_28px_68px_-28px_var(--color-primary)] [&_svg]:transition-transform [&_svg]:duration-500 hover:[&_svg]:translate-x-0.5"
              >
                <Link href="/login">
                  Launch your board
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
