import { convertToCoreMessages, streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export const maxDuration = 30;
export const runtime = "edge";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  const { messages }: { messages: ChatMessage[] } = await req.json();

  // Extract the system message (prompt) from the messages array
  const systemMessage = messages.find((msg) => msg.role === "system");
  const prompt = systemMessage?.content ?? "";

  // Filter out the system message from the messages array
  const userMessages = messages.filter((msg) => msg.role !== "system");

  // Create a new array with system message (simplified without cache control)
  const messagesWithSystem = [
    { role: "system" as const, content: prompt },
    ...userMessages,
  ];

  const result = await streamText({
    model: openai("gpt-4o-2024-11-20"),
    messages: convertToCoreMessages(messagesWithSystem),
    temperature: 1,
    onFinish: (metadata) => {
      console.log("Cache metrics:", {
        usage: metadata.usage,
        cachedPromptTokens:
          metadata.experimental_providerMetadata?.openai?.cachedPromptTokens,
      });
    },
  });

  return result.toDataStreamResponse();
}
