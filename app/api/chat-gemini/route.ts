import { generateText, convertToCoreMessages } from "ai";
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
      currentSession = await getChatSession(chatId);
    } else {
      const initialMessages = systemMessage ? [systemMessage] : [];
      currentSession = await createChatSession(initialMessages);
      chatId = currentSession.id;
    }
  } catch (error) {
    console.error("Error managing chat session:", error);
    const initialMessages = systemMessage ? [systemMessage] : [];
    currentSession = await createChatSession(initialMessages);
    chatId = currentSession.id;
  }

  const { text } = await generateText({
    model: google("gemini-2.0-flash-exp"),
    messages: convertToCoreMessages(nonSystemMessages),
    system: systemMessage?.content || "",
    temperature: 1,
  });

  try {
    // Get the most recent session state
    const updatedSession = await getChatSession(chatId!);
    
    // Prepare the new messages to append
    const newMessages = [
      ...updatedSession.messages,
      lastUserMessage,
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

  return new Response(JSON.stringify({ 
    text,
    chatId 
  }), {
    headers: {
      'Content-Type': 'application/json',
      'X-Chat-ID': chatId!,
    },
  });
}
