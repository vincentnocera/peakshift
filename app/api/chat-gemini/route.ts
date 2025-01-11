import { convertToCoreMessages, streamText } from "ai";
import { google } from "@ai-sdk/google";
import { updateChatSession, getChatSession, createChatSession } from "@/app/actions/chat-sessions";
import { ChatMessage } from "@/types/chat";

export const maxDuration = 30;
export const runtime = "nodejs";

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not defined");
}

export async function POST(req: Request) {
  const { messages, chatId: existingChatId }: { messages: ChatMessage[], chatId?: string } = await req.json();

  // Extract system message and user/assistant messages
  const systemMessage = messages.find((msg) => msg.role === "system");
  const nonSystemMessages = messages.filter((msg) => msg.role !== "system");
  
  // Get the last user message (the new one that triggered this request)
  const lastUserMessage = nonSystemMessages[nonSystemMessages.length - 1];

  // Initialize session variables
  let chatId = existingChatId;
  let currentSession;

  try {
    if (chatId) {
      // Get existing session if chatId is provided
      currentSession = await getChatSession(chatId);
    } else {
      // Create new session with ONLY the system message
      const initialMessages = systemMessage ? [systemMessage] : [];
      currentSession = await createChatSession(initialMessages);
      chatId = currentSession.id;
    }
  } catch (error) {
    console.error("Error managing chat session:", error);
    // If session retrieval fails, create a new one with ONLY system message
    const initialMessages = systemMessage ? [systemMessage] : [];
    currentSession = await createChatSession(initialMessages);
    chatId = currentSession.id;
  }

  const result = await streamText({
    model: google("gemini-2.0-flash-exp"),
    messages: convertToCoreMessages(nonSystemMessages),
    system: systemMessage?.content || "",
    temperature: 1,
    onFinish: async ({ text }) => {
      try {
        // Get the most recent session state
        const updatedSession = await getChatSession(chatId!);
        
        // Prepare the new messages to append
        const newMessages = [
          ...updatedSession.messages,
          // Add the new user message if it's not already in the history
          lastUserMessage,
          // Add the assistant's response
          {
            role: "assistant",
            content: text,
            id: `assistant-${Date.now()}`,
          },
        ];

        // Update the session with all messages
        await updateChatSession(chatId!, newMessages);
        
        console.log("Chat session updated successfully:", {
          chatId,
          totalMessages: newMessages.length,
        });
      } catch (error) {
        console.error("Failed to update chat session:", error);
      }
    },
  });

  // Create a TransformStream to modify the response
  const transformStream = new TransformStream({
    transform(chunk, controller) {
      // Pass through the chunk as-is
      controller.enqueue(chunk);
    },
    flush(controller) {
      // When the stream is done, append the chatId
      controller.enqueue(`\n{"chatId":"${chatId}"}`);
    },
  });

  // Get the response from streamText and pipe it through our transform
  const response = result.toDataStreamResponse();
  const { readable, writable } = transformStream;
  response.body?.pipeTo(writable);
  
  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain',
      'X-Chat-ID': chatId!,
    },
  });
}
