import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
      }
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      const githubUsername = getGitHubUsernameFromProfile(profile);
      if (githubUsername) {
        token.githubUsername = githubUsername;

        if (user?.id) {
          await prisma.user
            .update({
              where: { id: user.id },
              data: { githubUsername },
            })
            .catch(() => null);
        }
      }
      if (!token.githubUsername && token.id) {
        const storedUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { githubUsername: true },
        });
        token.githubUsername = storedUser?.githubUsername ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.githubUsername = token.githubUsername ?? null;
      }
      session.accessToken = token.accessToken ?? null;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

function getGitHubUsernameFromProfile(profile: unknown) {
  if (!profile || typeof profile !== "object" || !("login" in profile)) {
    return null;
  }

  const login = (profile as { login?: unknown }).login;
  return typeof login === "string" && login.trim().length > 0 ? login : null;
}

