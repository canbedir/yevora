import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-24 border-t relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5"></div>
      <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to elevate your workflow?</h2>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Join developers who use Yevora to manage their time, code, and ideas in one unified workspace.
        </p>
        <Link href="/login">
          <Button size="lg" className="h-14 px-10 text-lg shadow-xl shadow-primary/20">
            Sign In with GitHub
          </Button>
        </Link>
      </div>
    </section>
  );
}
