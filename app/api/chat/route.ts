import {convertToCoreMessages, streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export const maxDuration = 30;
export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: anthropic('claude-3-5-sonnet-20240620'),
    system: 'You are a helpful assistant.',
    messages: convertToCoreMessages(messages),
  });

  return result.toDataStreamResponse();
}
