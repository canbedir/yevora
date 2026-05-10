import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { RepoList } from "@/components/RepoList";
import { Skeleton } from "@/components/ui/skeleton";
import { authOptions } from "@/lib/auth";
import { getUserRepos } from "@/lib/github";

export default function ReposPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Repositories</h1>
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-36" />
      ))}
    </div>
  );
}

