"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import type { ComponentType, ReactNode } from "react";
import {
  BarChart3,
  Bell,
  FileText,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Timer,
  Workflow,
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
import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: ReactNode;
}

interface NavItem {
  href: "/dashboard" | "/focus" | "/repos" | "/notes" | "/stats";
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
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

function SidebarNav({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-1 px-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex h-9 items-center gap-3 rounded-md px-3 text-[13px] font-medium transition-colors",
              isActive
                ? "bg-neutral-200 text-neutral-950"
                : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

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
  const initials = getInitials(name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {compact ? (
          <button className="flex items-center gap-2 rounded-md px-1.5 py-1 text-left outline-none transition-colors hover:bg-neutral-100">
            <Avatar className="h-7 w-7 bg-neutral-950 text-white">
              <AvatarImage src={image ?? undefined} alt={name ?? "User"} />
              <AvatarFallback className="bg-neutral-950 text-[11px] font-semibold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-[13px] font-medium text-neutral-950 sm:inline">
              {name?.split(" ")[0] ?? "User"}
            </span>
          </button>
        ) : (
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left outline-none transition-colors hover:bg-neutral-100">
            <Avatar className="h-8 w-8 bg-neutral-200">
              <AvatarImage src={image ?? undefined} alt={name ?? "User"} />
              <AvatarFallback className="text-[11px] font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-neutral-950">{name ?? "User"}</span>
              <span className="block truncate text-xs text-neutral-500">{email ?? ""}</span>
            </span>
            <Settings className="h-4 w-4 shrink-0 text-neutral-500" />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{name ?? "User"}</p>
          <p className="truncate text-xs text-muted-foreground">{email ?? ""}</p>
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
  session,
  onNavigate,
}: {
  pathname: string;
  session: { user?: { name?: string | null; email?: string | null; image?: string | null } } | null;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-neutral-50">
      <div className="flex h-12 items-center border-b border-neutral-200 px-4">
        <Link href="/" className="flex items-center gap-2" onClick={onNavigate}>
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-950 text-white">
            <Workflow className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold text-neutral-950">Yevora</span>
        </Link>
      </div>

      <div className="flex-1 py-4">
        <SidebarNav pathname={pathname} onNavigate={onNavigate} />
      </div>

      <div className="border-t border-neutral-200 p-2">
        <UserMenu
          name={session?.user?.name}
          email={session?.user?.email}
          image={session?.user?.image}
        />
      </div>
    </div>
  );
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="yev-shell min-h-screen bg-neutral-50 text-neutral-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[184px] border-r border-neutral-200 bg-neutral-50 lg:block">
        <SidebarContent pathname={pathname} session={session} />
      </aside>

      <div className="min-h-screen lg:pl-[184px]">
        <header className="sticky top-0 z-20 flex h-12 items-center justify-between border-b border-neutral-200 bg-neutral-50/95 px-4 backdrop-blur lg:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md">
                    <Menu className="h-4 w-4" />
                    <span className="sr-only">Open navigation</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[184px] border-r border-neutral-200 p-0">
                  <SidebarContent pathname={pathname} session={session} />
                </SheetContent>
              </Sheet>
            </div>
            <CommandPalette />
          </div>

          <div className="flex items-center gap-2">
            <button className="relative flex h-8 w-8 items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-950">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="sr-only">Notifications</span>
            </button>
            <UserMenu
              name={session?.user?.name}
              email={session?.user?.email}
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
