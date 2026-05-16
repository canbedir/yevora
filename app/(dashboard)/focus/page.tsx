import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getServerSession } from "next-auth";

import { FocusConsole } from "@/components/FocusConsole";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { AnimatedGroup } from "@/components/motion-primitives/AnimatedGroup";
import { authOptions } from "@/lib/auth";

export default async function FocusPage() {
  await connection();

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <AnimatedGroup preset="slide" stagger={0.07} className="mx-auto max-w-[960px] space-y-6">
      <PageHeader
        eyebrow="Deep work"
        title="Focus"
        description="Pick your own session length, name the work, and keep focus time out of the dashboard noise."
        meta={
          <>
            <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-primary">
              Presets from 15 to 60 minutes
            </span>
            <span className="inline-flex rounded-full border border-neutral-200 bg-white/85 px-3 py-1 text-xs font-medium text-neutral-600">
              Wrap-up and break flow included
            </span>
          </>
        }
      />
      <FocusConsole />
    </AnimatedGroup>
  );
}
