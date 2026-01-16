import { ObjectId } from "mongodb";
import { getMongoClient, getMongoDbName } from "@/lib/mongo-client";

export async function getGitHubAccessTokenForUser(
  userId: string
): Promise<string | null> {
  try {
    const client = await getMongoClient();
    const db = client.db(getMongoDbName());
    const accounts = db.collection("accounts");

    let query: any = { provider: "github" };
    // Try ObjectId, fallback to string
    try {
      query.userId = new ObjectId(userId);
    } catch {
      query.userId = userId;
    }
    console.log(
      "[getGitHubAccessTokenForUser] userId:",
      userId,
      "query:",
      query
    );
    const account = await accounts.findOne(query);
    console.log("[getGitHubAccessTokenForUser] account:", account);
    const token = account?.access_token;
    if (!(typeof token === "string" && token.length > 0)) {
      console.error(
        "No GitHub access token found for user",
        userId,
        "query:",
        query,
        "account:",
        account
      );
      return null;
    }
    return token;
  } catch (e) {
    console.error("Error in getGitHubAccessTokenForUser", e, "userId:", userId);
    return null;
  }
}
