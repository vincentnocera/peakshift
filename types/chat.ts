export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
  id: string
  timestamp?: string
}

export interface ChatSession {
  id: string
  userId: string
  createdAt: string
  messages: ChatMessage[]
}

// For the KV store structure
export interface ChatSessionStore {
  [key: string]: ChatSession
}

export interface ChatSessionPreview {
  id: string;
  userId: string;
  createdAt: string;
  // title?: string; // Optional if you want to show a preview
} 