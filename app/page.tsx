import { getServerSession } from "next-auth";

import { CTASection } from "@/components/landing/CTASection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { Footer } from "@/components/landing/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { LandingMotion } from "@/components/landing/LandingMotion";
import { NavBar } from "@/components/landing/NavBar";
import { StatsPreviewSection } from "@/components/landing/StatsPreviewSection";
import { authOptions } from "@/lib/auth";

export const unstable_instant = false;

export default async function Home() {
  const session = await getServerSession(authOptions);
  const isAuthenticated = Boolean(session?.user);

  return (
    <div
      data-landing-root
      className="landing-shell flex min-h-screen flex-col overflow-x-clip bg-[linear-gradient(180deg,rgba(255,252,247,1),rgba(255,255,255,1))]"
    >
      <LandingMotion />
      <NavBar user={session?.user ?? null} />
      <main className="flex-1">
        <HeroSection isAuthenticated={isAuthenticated} />
        <FeaturesSection />
        <StatsPreviewSection />
        <CTASection isAuthenticated={isAuthenticated} />
      </main>
      <Footer />
    </div>
  );
}
