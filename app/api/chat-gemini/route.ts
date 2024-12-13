import { convertToCoreMessages, streamText } from "ai";
import { google } from "@ai-sdk/google";

export const maxDuration = 30;
export const runtime = "nodejs";

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not defined');
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  const { messages }: { messages: ChatMessage[] } = await req.json();

  // Extract system message and user/assistant messages
  const systemMessage = messages.find((msg) => msg.role === "system");
  const nonSystemMessages = messages.filter((msg) => msg.role !== "system");

  // Stream the response using Gemini model
  const result = await streamText({
    model: google("gemini-2.0-flash-exp"),
    messages: convertToCoreMessages(nonSystemMessages),
    system: systemMessage?.content || "",
    temperature: 1,
  });

  return result.toDataStreamResponse();
}