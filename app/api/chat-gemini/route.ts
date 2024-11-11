import { convertToCoreMessages, streamText } from "ai";
import { google } from "@ai-sdk/google";
import { GoogleAICacheManager } from '@google/generative-ai/server';

export const maxDuration = 30;
export const runtime = "nodejs";

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not defined');
}

// Initialize cache manager with API key
const cacheManager = new GoogleAICacheManager(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY
);

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  const { messages }: { messages: ChatMessage[] } = await req.json();

  const systemMessage = messages.find((msg) => msg.role === "system");
  const prompt = systemMessage?.content || "";
  const userMessages = messages.filter((msg) => msg.role !== "system");

  // Configure the model options based on whether we have a system message
  const modelOptions: any = {
    temperature: 1,
  };

  if (prompt) {
    try {
      // First check if we already have a cache for this prompt
      const existingCache = await cacheManager.list();
      console.log('Existing caches:', existingCache);

      // Only create new cache if we don't have one
      if (Object.keys(existingCache || {}).length === 0) {
        const { name } = await cacheManager.create({
          model: 'models/gemini-1.5-flash-002',
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          systemInstruction: prompt,
          ttlSeconds: 30,
        });
        console.log('New cache created with name:', name);
        modelOptions.cachedContent = name;
      } else {
        const firstCache = Object.values(existingCache || {})[0];
        console.log('Using existing cache:', firstCache);
        modelOptions.cachedContent = firstCache;
      }

      // Try to retrieve the cached content to verify it exists
      const cached = await cacheManager.get(modelOptions.cachedContent!);
      console.log('Cache content:', cached);
      console.log('Cache retrieved successfully:', !!cached);
    } catch (error) {
      console.error('Caching error:', error);
      // Continue without cache if there's an error
    }
  }

  const result = await streamText({
    model: google("gemini-1.5-flash-002", modelOptions),
    messages: convertToCoreMessages(userMessages),
  });

  return result.toDataStreamResponse();
}
