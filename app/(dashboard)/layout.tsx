"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import type { ComponentType, ReactNode } from "react";
import {
  BarChart2,
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
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

interface SidebarNavProps {
  pathname: string;
}

function SidebarNav({ pathname }: SidebarNavProps) {
  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
              isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

interface UserMenuProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

function UserMenu({ name, email, image }: UserMenuProps) {
  const initials = name?.trim().slice(0, 2).toUpperCase() ?? "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto w-full justify-start gap-3 px-2 py-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={image ?? undefined} alt={name ?? "User"} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-medium">{name ?? "User"}</p>
            <p className="truncate text-xs text-muted-foreground">{email ?? "No email"}</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="space-y-1">
          <p>{name ?? "User"}</p>
          <p className="font-normal text-muted-foreground">{email ?? "No email"}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r bg-card md:flex md:flex-col">
        <div className="px-4 py-4">
          <Link href="/dashboard" className="text-lg font-semibold">
            Yevora
          </Link>
        </div>
        <Separator />
        <div className="flex-1 p-4">
          <SidebarNav pathname={pathname} />
        </div>
        <Separator />
        <div className="p-4">
          <UserMenu
            name={session?.user?.name}
            email={session?.user?.email}
            image={session?.user?.image}
          />
        </div>
      </aside>

      <div className="md:pl-60">
        <header className="sticky top-0 z-20 border-b bg-background/80 px-4 py-3 backdrop-blur md:hidden">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-base font-semibold">
              Yevora
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Open navigation</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="px-4 py-4">
                  <Link href="/dashboard" className="text-lg font-semibold">
                    Yevora
                  </Link>
                </div>
                <Separator />
                <div className="p-4">
                  <SidebarNav pathname={pathname} />
                </div>
                <Separator />
                <div className="p-4">
                  <UserMenu
                    name={session?.user?.name}
                    email={session?.user?.email}
                    image={session?.user?.image}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
