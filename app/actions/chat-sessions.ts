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

export async function getAllChatSessions() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  console.log("userId in getAllChatSessions:", userId); // Debugging log

  const sessions = await kv.hgetall(`user:${userId}:chats`);
  console.log("sessions from KV:", sessions); // Debugging log

  // Handle the case where sessions is undefined (no data found)
  if (!sessions) {
    return []; // Return an empty array
  }

  return Object.entries(sessions).map(([id, session]) => ({
    id,
    ...(typeof session === 'string' ? JSON.parse(session) : session)
  }));
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