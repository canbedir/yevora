import { CTASection } from "@/components/landing/CTASection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { Footer } from "@/components/landing/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { NavBar } from "@/components/landing/NavBar";
import { StatsPreviewSection } from "@/components/landing/StatsPreviewSection";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <StatsPreviewSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

