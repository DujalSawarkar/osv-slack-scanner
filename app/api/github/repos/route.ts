import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getGitHubAccessTokenForUser } from "@/lib/github-token";
import { listRepos } from "@/lib/github-api";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const userId = (session.user as any)?.id as string | undefined;
  const token = userId ? await getGitHubAccessTokenForUser(userId) : null;
  if (!token) {
    return NextResponse.json(
      { error: "Missing GitHub access token" },
      { status: 403 }
    );
  }
  try {
    const repos = await listRepos(token);
    return NextResponse.json({ repos });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Failed to fetch repos" },
      { status: 500 }
    );
  }
}
