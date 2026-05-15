import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";

export const unstable_instant = {
  prefetch: "static",
};

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SessionProviderWrapper>
      <DashboardShell>{children}</DashboardShell>
    </SessionProviderWrapper>
  );
}
