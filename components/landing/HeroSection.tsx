import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-24 pb-32 md:pt-32 md:pb-40 lg:pt-40 lg:pb-48">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
      <div className="container mx-auto px-4 md:px-6 text-center">
        <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm text-muted-foreground mb-8 bg-background/50 backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
          The ultimate developer workspace
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter max-w-4xl mx-auto mb-6 leading-tight">
          Focus on code.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Master your productivity.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Yevora integrates your GitHub workflow, Pomodoro focus sessions, and developer notes into one beautiful, lightning-fast dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/login">
            <Button size="lg" className="h-12 px-8 text-base">
              Start Building Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="https://github.com" target="_blank" rel="noreferrer">
            <Button variant="outline" size="lg" className="h-12 px-8 text-base">
              View on GitHub
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
