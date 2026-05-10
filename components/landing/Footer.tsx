import Link from "next/link";
import { Code2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-8 bg-background">
      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Code2 className="h-5 w-5 text-muted-foreground" />
          <span className="font-semibold text-muted-foreground">Yevora</span>
        </div>
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Yevora. Built for developers.
        </p>
        <div className="flex gap-4">
          <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link>
          <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
