"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import type { ComponentType, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart2,
  ChevronRight,
  FileText,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Menu,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: ReactNode;
}

interface NavItem {
  href: "/dashboard" | "/repos" | "/notes" | "/stats";
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/repos", label: "Repositories", icon: GitBranch },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/stats", label: "Stats", icon: BarChart2 },
];

/* ─── Sidebar Nav ─────────────────────────────────────────────────────────── */

function SidebarNav({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <div key={item.href} className="relative">
            <AnimatePresence>
              {isActive && (
                <motion.div
                  layoutId="sidebar-pill"
                  className="absolute inset-0 rounded-xl bg-white/90 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.18)] border border-white/80"
                  transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.4 }}
                />
              )}
            </AnimatePresence>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative z-10 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/50"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground/70"
                )}
              />
              {item.label}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}

/* ─── User Avatar Button ──────────────────────────────────────────────────── */

function UserMenu({
  name,
  email,
  image,
  compact = false,
}: {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  compact?: boolean;
}) {
  const initials =
    name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase() ?? "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {compact ? (
          <button className="group outline-none">
            <Avatar className="h-8 w-8 ring-2 ring-white/80 ring-offset-1 ring-offset-transparent transition-shadow duration-200 group-hover:ring-primary/30">
              <AvatarImage src={image ?? undefined} alt={name ?? "User"} />
              <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
            </Avatar>
          </button>
        ) : (
          <button className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-200 hover:bg-white/60 outline-none">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={image ?? undefined} alt={name ?? "User"} />
              <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{name ?? "User"}</p>
              <p className="truncate text-xs text-muted-foreground">{email ?? ""}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{name ?? "User"}</p>
          <p className="text-xs text-muted-foreground">{email ?? ""}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/" })}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ─── Sidebar Content (shared between fixed + sheet) ─────────────────────── */

function SidebarContent({
  pathname,
  session,
  onNavigate,
}: {
  pathname: string;
  session: { user?: { name?: string | null; email?: string | null; image?: string | null } } | null;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="px-3 pt-4 pb-5">
        <Link href="/" className="flex items-center gap-2.5 px-1 outline-none group" onClick={onNavigate}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-sky-400 text-sm font-bold text-slate-950 shadow-sm transition-transform duration-200 group-hover:scale-105">
            Y
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-foreground">Yevora</span>
        </Link>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3">
        <SidebarNav pathname={pathname} onNavigate={onNavigate} />
      </div>

      {/* User */}
      <div className="border-t border-black/[0.06] px-2 py-3">
        <UserMenu
          name={session?.user?.name}
          email={session?.user?.email}
          image={session?.user?.image}
        />
      </div>
    </div>
  );
}

/* ─── Shell ───────────────────────────────────────────────────────────────── */

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const activeItem = navItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  ) ?? navItems[0];
  const ActiveIcon = activeItem.icon;

  return (
    <div className="yev-shell min-h-screen">
      {/* Fixed Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 border-r border-black/[0.06] bg-[rgba(249,249,251,0.92)] backdrop-blur-xl lg:block">
        <SidebarContent pathname={pathname} session={session} />
      </aside>

      {/* Main content area */}
      <div className="lg:pl-56">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-black/[0.06] bg-white/80 backdrop-blur-xl px-4 lg:px-6">
          {/* Left: Mobile menu + Page title */}
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5"
                  >
                    <Menu className="h-4 w-4" />
                    <span className="sr-only">Open navigation</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-56 p-0 border-r border-black/[0.06] bg-[rgba(249,249,251,0.96)]"
                >
                  <SidebarContent pathname={pathname} session={session} />
                </SheetContent>
              </Sheet>
            </div>

            {/* Page title */}
            <div className="flex items-center gap-2">
              <ActiveIcon className="h-4 w-4 text-muted-foreground" />
              <h1 className="text-sm font-semibold text-foreground">{activeItem.label}</h1>
            </div>
          </div>

          {/* Right: Avatar */}
          <UserMenu
            name={session?.user?.name}
            email={session?.user?.email}
            image={session?.user?.image}
            compact
          />
        </header>

        {/* Page content */}
        <main className="px-4 py-6 lg:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
