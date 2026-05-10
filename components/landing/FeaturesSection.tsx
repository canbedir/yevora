import { Code2, Focus, NotebookPen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-muted/50 border-y">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to ship faster</h2>
          <p className="text-muted-foreground text-lg">Designed specifically for the modern developer&apos;s daily routine.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-background border-none shadow-md hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-8">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Focus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Deep Focus</h3>
              <p className="text-muted-foreground leading-relaxed">
                Built-in Pomodoro timer seamlessly synced with your dashboard. Track your focus sessions and build unbreakable coding habits.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-background border-none shadow-md hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-8">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Code2 className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">GitHub Integration</h3>
              <p className="text-muted-foreground leading-relaxed">
                View your pull requests, repositories, and commit activity in real-time. Never lose track of your open source contributions.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-background border-none shadow-md hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-8">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <NotebookPen className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Markdown Notes</h3>
              <p className="text-muted-foreground leading-relaxed">
                Jot down ideas, code snippets, and architecture plans with a rich markdown editor designed for developers.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
