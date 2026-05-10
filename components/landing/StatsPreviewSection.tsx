import { LineChart } from "lucide-react";

export function StatsPreviewSection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium">
              <LineChart className="mr-2 h-4 w-4" /> Analytics
            </div>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              Visualize your progress and stay motivated.
            </h2>
            <p className="text-lg text-muted-foreground">
              Yevora tracks your commit streaks and daily focus time, giving you beautiful charts to reflect on your week. Because what gets measured, gets optimized.
            </p>
            <ul className="space-y-3 pt-4">
              <li className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>Real-time GitHub commit graphing</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>Focus time weekly aggregation</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>Habit streak calculation</span>
              </li>
            </ul>
          </div>
          <div className="flex-1 w-full">
            <div className="relative rounded-2xl border bg-background p-2 shadow-2xl overflow-hidden aspect-video">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-blue-500/5 pointer-events-none" />
              <div className="w-full h-full bg-muted/30 rounded-xl border flex items-center justify-center">
                <p className="text-muted-foreground font-medium">Interactive Charts Dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
