import { WebClient } from "@slack/web-api";

export async function sendSlackDM(message: string) {
  // 1. Read the environment variables here, inside the function.
  const slackToken = process.env.SLACK_BOT_TOKEN;
  const userId = process.env.SLACK_USER_ID;

  // 2. Check if the variables exist.
  if (!slackToken || !userId) {
    console.error(
      " Slack token or user ID is not configured. Check scanner-runner.ts and .env.local."
    );
    return;
  }

  // 3. Create the Slack client here.
  const client = new WebClient(slackToken);

  console.log("Attempting to send Slack message...");

  try {
    await client.chat.postMessage({
      channel: userId,
      text: message,
    });
    console.log(" Slack message sent successfully.");
  } catch (error: any) {
    console.error(" FAILED to send Slack message. Error details:");
    if (error.code === "slack_error") {
      console.error("Error Code:", error.data.error);
    } else {
      console.error(error);
    }
  }
}
