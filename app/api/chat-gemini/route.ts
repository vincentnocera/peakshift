import { convertToCoreMessages, streamText } from "ai";
import { google } from "@ai-sdk/google";
import { GoogleAICacheManager } from "@google/generative-ai/server";

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

  const systemMessage = messages.find((msg) => msg.role === "system");
  const prompt = systemMessage?.content || "";
  const userMessages = messages.filter((msg) => msg.role !== "system");

  const cacheManager = new GoogleAICacheManager(
    process.env.GOOGLE_GENERATIVE_AI_API_KEY!
  );

  type GoogleModelCacheableId = 
  | 'models/gemini-1.5-flash-002'
  | 'models/gemini-1.5-pro-002';

  const model: GoogleModelCacheableId = 'models/gemini-1.5-flash-002';

  const { name: cachedContent } = await cacheManager.create({
    model,
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      },
      ...userMessages.map(({ role, content }) => ({
        role: role === 'assistant' ? 'model' : 'user',
        parts: [{ text: content }]
      }))
    ],
    ttlSeconds: 60 * 10
  });

  const result = await streamText({
    model: google("gemini-1.5-flash-002", {cachedContent}),
    messages: convertToCoreMessages(userMessages),
    temperature: 1,
    onFinish: (metadata) => {
      console.log('Cache metrics:', {
        usage: metadata.usage,
        cachedContent
      });
    }
  });

  return result.toDataStreamResponse();
}
