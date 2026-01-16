import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { getMongoClient } from "@/lib/mongo-client";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(getMongoClient() as any),
  session: { strategy: "jwt" },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      authorization: { params: { scope: "read:user user:email repo" } },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (profile && typeof (profile as any).login === "string") {
        (token as any).githubLogin = (profile as any).login;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).id = token.sub;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
