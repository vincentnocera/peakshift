import {convertToCoreMessages, streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export const maxDuration = 30;
export const runtime = 'edge';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function POST(req: Request) {
  const { messages }: { messages: ChatMessage[] } = await req.json();

  // Extract the system message (prompt) from the messages array
  const systemMessage = messages.find((msg) => msg.role === 'system');
  const prompt = systemMessage?.content ?? '';

  // Filter out the system message from the messages array
  const userMessages = messages.filter((msg) => msg.role !== 'system');

  const result = await streamText({
    model: anthropic('claude-3-5-sonnet-20240620'),
    system: prompt,
    messages: convertToCoreMessages(userMessages),
    temperature: 1,
  });

  return result.toDataStreamResponse();
}
