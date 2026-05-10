import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { RepoList } from "@/components/RepoList";
import { authOptions } from "@/lib/auth";
import { getUserRepos } from "@/lib/github";

export default async function ReposPage() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    redirect("/login");
  }

  const repos = await getUserRepos(session.accessToken);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Repositories</h1>
      <RepoList repos={repos} />
    </div>
  );
}
