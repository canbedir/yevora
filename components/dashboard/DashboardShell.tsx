"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, type ComponentType, type ReactNode } from "react";
import {
  BarChart3,
  CalendarDays,
  FileText,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Timer,
} from "lucide-react";

import { YevoraLogo } from "@/components/brand/YevoraLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { NotificationCenter } from "@/components/dashboard/NotificationCenter";
import { useTodayQueue } from "@/components/dashboard/useTodayQueue";
import { AnimatedBackground } from "@/components/motion-primitives/AnimatedBackground";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface DashboardShellProps {
  children: ReactNode;
}

interface NavItem {
  href: "/dashboard" | "/today" | "/focus" | "/repos" | "/notes" | "/stats";
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/today", label: "Today", icon: CalendarDays },
  { href: "/focus", label: "Focus", icon: Timer },
  { href: "/repos", label: "Repositories", icon: GitBranch },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/stats", label: "Stats", icon: BarChart3 },
];

function getInitials(name?: string | null) {
  return (
    name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U"
  );
}

function SidebarNav({
  pathname,
  todayCount,
  onNavigate,
}: {
  pathname: string;
  todayCount: number;
  onNavigate?: () => void;
}) {
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  return (
    <nav className="space-y-0.5 px-1.5" onMouseLeave={() => setHoveredHref(null)}>
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        const hasTodaySignals = item.href === "/today" && todayCount > 0;
        const badgeCount = Math.min(todayCount, 9);
        const isHighlighted = hoveredHref === item.href || (!hoveredHref && isActive);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            onMouseEnter={() => setHoveredHref(item.href)}
            onFocus={() => setHoveredHref(item.href)}
            onBlur={() => setHoveredHref((currentValue) => (currentValue === item.href ? null : currentValue))}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative isolate flex h-9 items-center gap-3 overflow-hidden rounded-md px-3 text-[13px] font-medium transition-colors",
              isActive || isHighlighted ? "text-neutral-950" : "text-neutral-700 hover:text-neutral-950"
            )}
          >
            {isHighlighted ? (
              <AnimatedBackground
                layoutId="sidebar-nav-highlight"
                className={cn(
                  "inset-0 rounded-md border shadow-[0_12px_26px_-24px_rgba(15,23,42,0.36)]",
                  isActive
                    ? "border-neutral-200 bg-white"
                    : "border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(247,242,233,0.9))]"
                )}
              />
            ) : null}
            <Icon className="relative z-10 h-4 w-4 shrink-0" />
            <span className="relative z-10 min-w-0 flex-1">{item.label}</span>
            {hasTodaySignals ? (
              <span className="yev-live-signal relative z-10 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
                {badgeCount}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

function UserMenu({
  name,
  image,
  compact = false,
}: {
  name?: string | null;
  image?: string | null;
  compact?: boolean;
}) {
  const initials = getInitials(name);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        {compact ? (
          <button className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-neutral-200 bg-white px-1.5 pr-2 text-left shadow-[0_8px_24px_-18px_rgba(15,23,42,0.28)] outline-none transition-colors hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-primary/20">
            <Avatar className="h-7 w-7 bg-neutral-950 text-white">
              <AvatarImage src={image ?? undefined} alt={name ?? "User"} />
              <AvatarFallback className="bg-neutral-950 text-[11px] font-semibold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-[88px] truncate text-[13px] font-medium text-neutral-950 sm:inline">
              {name?.split(" ")[0] ?? "User"}
            </span>
            <ChevronDown className="hidden h-3.5 w-3.5 text-neutral-400 sm:inline" />
          </button>
        ) : (
          <button className="flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left outline-none transition-colors hover:bg-neutral-100">
            <Avatar className="h-8 w-8 bg-neutral-200">
              <AvatarImage src={image ?? undefined} alt={name ?? "User"} />
              <AvatarFallback className="text-[11px] font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-neutral-950">{name ?? "User"}</span>
            </span>
            <Settings className="h-4 w-4 shrink-0 text-neutral-500" />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{name ?? "User"}</p>
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

function SidebarContent({
  pathname,
  todayCount,
  onNavigate,
}: {
  pathname: string;
  todayCount: number;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-neutral-50">
      <div className="flex h-12 items-center border-b border-neutral-200 px-4">
        <Link href="/" className="flex items-center gap-2" onClick={onNavigate}>
          <span className="flex h-8 w-9 shrink-0 items-center justify-center">
            <YevoraLogo className="h-8 w-9" />
          </span>
          <span className="text-sm font-semibold text-neutral-950">Yevora</span>
        </Link>
      </div>

      <div className="flex-1 py-4">
        <SidebarNav pathname={pathname} todayCount={todayCount} onNavigate={onNavigate} />
      </div>
    </div>
  );
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { items, count, isLoading, hasError, refresh } = useTodayQueue();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="yev-shell min-h-screen bg-neutral-50 text-neutral-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[184px] border-r border-neutral-200 bg-neutral-50 lg:block">
        <SidebarContent pathname={pathname} todayCount={count} />
      </aside>

      <div className="min-h-screen lg:pl-[184px]">
        <header className="sticky top-0 z-20 flex h-12 items-center justify-between border-b border-neutral-200 bg-neutral-50/95 px-4 backdrop-blur lg:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="lg:hidden">
              <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                    <Menu className="h-4 w-4" />
                    <span className="sr-only">Open navigation</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[184px] border-r border-neutral-200 p-0">
                  <SheetTitle className="sr-only">Navigation</SheetTitle>
                  <SidebarContent pathname={pathname} todayCount={count} onNavigate={() => setIsMobileNavOpen(false)} />
                </SheetContent>
              </Sheet>
            </div>
            <CommandPalette />
          </div>

          <div className="flex items-center gap-2">
            <NotificationCenter
              items={items}
              isLoading={isLoading}
              hasError={hasError}
              onOpenChange={(open) => {
                if (open) {
                  void refresh();
                }
              }}
            />
            <UserMenu
              name={session?.user?.name}
              image={session?.user?.image}
              compact
            />
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
