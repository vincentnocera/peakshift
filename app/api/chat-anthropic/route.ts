import { streamText } from "ai";
import { anthropic } from '@ai-sdk/anthropic';

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

  // Create a new array with system message that includes cache control
  const messagesWithCache = [
    {
      role: 'system' as const,
      content: prompt,
      experimental_providerMetadata: {
        anthropic: { cacheControl: { type: 'ephemeral' } }
      }
    },
    ...userMessages
  ];

  const result = await streamText({
    model: anthropic('claude-3-5-sonnet-20241022', {
      cacheControl: true
    }),
    messages: messagesWithCache,
    temperature: 1,
    onFinish: (metadata) => {
      console.log('Cache metrics:', metadata.experimental_providerMetadata?.anthropic);
      // Will show something like: { cacheCreationInputTokens: X, cacheReadInputTokens: Y }
    }
  });

  return result.toDataStreamResponse();
}