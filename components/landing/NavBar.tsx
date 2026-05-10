import Link from "next/link";
import { ArrowRight, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NavBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Code2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">Yevora</span>
        </div>
        <nav className="hidden md:flex gap-6">
          <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
          <Link href="#workflow" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Workflow</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="hidden md:inline-flex">Sign In</Button>
          </Link>
          <Link href="/login">
            <Button>Get Started <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
