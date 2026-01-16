import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMongoClient, getMongoDbName } from "@/lib/mongo-client";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json(
      { ok: false, error: "Not authenticated" },
      { status: 401 }
    );
  }
  const userId = (session.user as any).id;
  try {
    const client = await getMongoClient();
    const db = client.db(getMongoDbName());
    const { ObjectId } = await import("mongodb");
    let query: any = {};
    try {
      query.userId = new ObjectId(userId);
    } catch {
      query.userId = userId;
    }
    // Optionally, remove sessions for this user (if using database sessions)
    await db.collection("sessions").deleteMany(query);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as any).message || "Failed to clear session" },
      { status: 500 }
    );
  }
}
