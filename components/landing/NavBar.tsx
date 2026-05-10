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
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-[0_10px_30px_-18px_var(--color-primary)]">
            <Code2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              DevBoard
            </p>
            <p className="text-lg font-semibold tracking-tight">Yevora</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
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
                    className="h-auto rounded-full border border-border/70 bg-background px-2 py-2 shadow-sm"
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
              <Button asChild variant="ghost" className="hidden rounded-full px-4 sm:inline-flex">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild className="rounded-full px-5 shadow-[0_16px_36px_-18px_var(--color-primary)]">
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
