import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
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
    async session({ session, user }) {
      if (!session.user) {
        return session;
      }

      session.user.id = user.id;

      const account = await prisma.account.findFirst({
        where: {
          userId: user.id,
          provider: "github",
        },
      });

      session.accessToken = account?.access_token ?? null;

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

