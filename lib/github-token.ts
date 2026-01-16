import { ObjectId } from "mongodb";
import { getMongoClient, getMongoDbName } from "@/lib/mongo-client";

export async function getGitHubAccessTokenForUser(
  userId: string
): Promise<string | null> {
  try {
    const client = await getMongoClient();
    const db = client.db(getMongoDbName());

    const oid = new ObjectId(userId);
    const accounts = db.collection("accounts");
    const account = await accounts.findOne({
      userId: oid,
      provider: "github",
    });

    const token = account?.access_token;
    return typeof token === "string" && token.length > 0 ? token : null;
  } catch {
    return null;
  }
}
