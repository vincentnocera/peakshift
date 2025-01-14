'use server'

/*
In this file, we will define the actions for the chat sessions (create, update, retrieve all for a user, retrieve a single session).

We are converting from using api/routes to using actions.
*/

import { kv } from '@vercel/kv'
import { auth } from '@clerk/nextjs/server'
import { ChatSession, ChatMessage } from '@/types/chat'

export async function createChatSession(messages: ChatMessage[]) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const chatId = crypto.randomUUID();
  const newSession: ChatSession = {
    id: chatId,
    userId,
    createdAt: new Date().toISOString(),
    messages
  }

  await kv.hset(`user:${userId}:chats`, {
    [chatId]: JSON.stringify(newSession)
  });

  return newSession;
}

export async function updateChatSession(chatId: string, messages: ChatMessage[]) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const existingSession = await kv.hget(`user:${userId}:chats`, chatId);
  if (!existingSession) {
    throw new Error('Chat session not found');
  }

  const parsedSession = typeof existingSession === 'string' 
    ? JSON.parse(existingSession) 
    : existingSession;

  const updatedSession = {
    ...parsedSession,
    messages
  }

  await kv.hset(`user:${userId}:chats`, {
    [chatId]: JSON.stringify(updatedSession)
  });

  return updatedSession;
}

export async function getAllChatSessions(): Promise<ChatSession[]> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return [];
    }

    const result = await kv.hgetall(`user:${userId}:chats`);
    
    // Handle null/undefined result from Redis
    if (!result) {
      return [];
    }

    // More thorough validation and parsing
    return Object.entries(result)
      .map(([id, data]) => {
        try {
          const parsed = typeof data === 'string' ? JSON.parse(data) : data;
          // Ensure the session has all required fields
          if (!parsed || !parsed.createdAt || !parsed.messages) {
            console.error(`Invalid chat session data for ID ${id}:`, parsed);
            return null;
          }
          return {
            id,
            userId,
            createdAt: parsed.createdAt,
            messages: parsed.messages
          };
        } catch (e) {
          console.error(`Error parsing chat session ${id}:`, e);
          return null;
        }
      })
      .filter((session): session is ChatSession => session !== null);
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return [];
  }
}

export async function getChatSession(chatId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const chat = await kv.hget(`user:${userId}:chats`, chatId);
  if (!chat) {
    throw new Error('Chat session not found');
  }

  return typeof chat === 'string' ? JSON.parse(chat) : chat;
}

export async function deleteChatSession(chatId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  await kv.hdel(`user:${userId}:chats`, chatId);
  return { success: true };
}