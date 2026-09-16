import "server-only";

import { timingSafeEqual } from "node:crypto";

import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { getEnv } from "@/lib/env";

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "DayLog credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials.password) return null;
        const env = getEnv();
        const usernameMatches = safeEqual(credentials.username, env.PERSONAL_USERNAME);
        const passwordMatches = safeEqual(credentials.password, env.PERSONAL_PASSWORD);
        if (!usernameMatches || !passwordMatches) return null;

        return { id: "personal-user", name: env.PERSONAL_USERNAME };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.userId = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = String(token.userId ?? token.sub ?? "personal-user");
      return session;
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}

export async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}
