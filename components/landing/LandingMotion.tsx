"use client";

import { useEffect } from "react";
import { useReducedMotion } from "motion/react";

export function LandingMotion() {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    let teardown = () => {};
    let cancelled = false;

    const setup = async () => {
      const [{ default: Lenis }, { default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (cancelled) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      const root = document.querySelector<HTMLElement>("[data-landing-root]");
      if (!root) {
        return;
      }

      const html = document.documentElement;
      const body = document.body;
      const previousHtmlScrollBehavior = html.style.scrollBehavior;
      const previousBodyScrollBehavior = body.style.scrollBehavior;

      html.style.scrollBehavior = "auto";
      body.style.scrollBehavior = "auto";

      const lenis = new Lenis({
        autoRaf: false,
        anchors: { offset: 96 },
        lerp: 0.085,
        wheelMultiplier: 0.92,
      });

      const updateScrollTrigger = () => ScrollTrigger.update();
      lenis.on("scroll", updateScrollTrigger);

      const tick = (time: number) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      const refreshLenis = () => lenis.resize();
      ScrollTrigger.addEventListener("refresh", refreshLenis);

      const context = gsap.context(() => {
        const heroTimeline = gsap.timeline({
          defaults: {
            duration: 0.9,
            ease: "power3.out",
          },
        });

        heroTimeline
          .fromTo(
            "[data-hero-reveal]",
            { autoAlpha: 0, y: 28, filter: "blur(14px)" },
            {
              autoAlpha: 1,
              y: 0,
              filter: "blur(0px)",
              stagger: 0.1,
              clearProps: "filter",
            }
          )
          .fromTo(
            "[data-hero-chip]",
            { autoAlpha: 0, y: 18, scale: 0.96, filter: "blur(10px)" },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              duration: 0.7,
              stagger: 0.08,
              clearProps: "filter",
            },
            "-=0.45"
          )
          .fromTo(
            "[data-hero-showcase]",
            { autoAlpha: 0, y: 54, scale: 0.985, filter: "blur(16px)" },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              duration: 1.05,
              clearProps: "filter",
            },
            "-=0.35"
          );

        const sections = gsap.utils.toArray<HTMLElement>("[data-landing-section]");
        sections.forEach((section) => {
          const directItems = Array.from(
            section.querySelectorAll<HTMLElement>(':scope [data-landing-item="section"]')
          );

          if (directItems.length > 0) {
            gsap.fromTo(
              directItems,
              { autoAlpha: 0, y: 36, filter: "blur(14px)" },
              {
                autoAlpha: 1,
                y: 0,
                filter: "blur(0px)",
                duration: 0.95,
                stagger: 0.12,
                ease: "power3.out",
                clearProps: "filter",
                scrollTrigger: {
                  trigger: section,
                  start: "top bottom-=10%",
                  once: true,
                },
              }
            );
          }
        });

        const staggerGroups = gsap.utils.toArray<HTMLElement>("[data-landing-stagger]");
        staggerGroups.forEach((group) => {
          const items = Array.from(group.querySelectorAll<HTMLElement>("[data-landing-item='group']"));
          if (items.length === 0) {
            return;
          }

          gsap.fromTo(
            items,
            { autoAlpha: 0, y: 24, scale: 0.985, filter: "blur(12px)" },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              duration: 0.85,
              stagger: 0.08,
              ease: "power3.out",
              clearProps: "filter",
              scrollTrigger: {
                trigger: group,
                start: "top bottom-=8%",
                once: true,
              },
            }
          );
        });

        const parallaxTargets = gsap.utils.toArray<HTMLElement>("[data-landing-parallax]");
        parallaxTargets.forEach((target) => {
          const section = target.closest("section") ?? root;

          gsap.to(target, {
            yPercent: -14,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.45,
            },
          });
        });
      }, root);

      ScrollTrigger.refresh();

      teardown = () => {
        context.revert();
        ScrollTrigger.removeEventListener("refresh", refreshLenis);
        gsap.ticker.remove(tick);
        gsap.ticker.lagSmoothing(500, 33);
        lenis.destroy();
        html.style.scrollBehavior = previousHtmlScrollBehavior;
        body.style.scrollBehavior = previousBodyScrollBehavior;
      };
    };

    void setup();

    return () => {
      cancelled = true;
      teardown();
    };
  }, [prefersReducedMotion]);

  return null;
}
