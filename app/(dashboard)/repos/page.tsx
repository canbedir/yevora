import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getServerSession } from "next-auth";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { RepoList } from "@/components/RepoList";
import { Skeleton } from "@/components/ui/skeleton";
import { authOptions } from "@/lib/auth";
import { getUserRepos } from "@/lib/github";

export default async function ReposPage() {
  await connection();

  return (
    <div className="mx-auto max-w-[960px] space-y-6">
      <PageHeader
        title="Repositories"
        description="Manage your repositories and track activity."
      />
      <Suspense fallback={<ReposSkeleton />}>
        <ReposContent />
      </Suspense>
    </div>
  );
}

async function ReposContent() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    redirect("/login");
  }

  const repos = await getUserRepos(session.accessToken);

  return <RepoList repos={repos} />;
}

function ReposSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 rounded-lg" />
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
