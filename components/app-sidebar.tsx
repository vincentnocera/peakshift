"use client";

import { Sidebar, SidebarContent } from "@/components/ui/sidebar"
import { Suspense } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { ChatSession } from "@/types/chat"
import { getAllChatSessions } from "@/app/actions/chat-sessions"
import { useEffect, useState } from "react"

// Create a separate component for the chat list
function ChatList({ sessions }: { sessions: ChatSession[] }) {
  const router = useRouter();
  
  // Be safe: filter out any sessions that don't have a valid createdAt
  const validSessions = sessions.filter(
    (s) => s && typeof s.createdAt === "string"
  );

  // Sort sessions by date, most recent first
  const sortedSessions = [...validSessions].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });

  if (sortedSessions.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-4 text-center">
        No chat history yet
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <div className="space-y-2">
        {sortedSessions.map((session) => {
          // Safely handle missing messages
          const messagesArray = Array.isArray(session.messages)
            ? session.messages
            : [];

          const previewMessage =
            messagesArray.find((m) => m.role !== "system")?.content || "";

          const preview =
            previewMessage.length > 50
              ? previewMessage.substring(0, 50) + "..."
              : previewMessage;

          return (
            <div
              key={session.id}
              className="p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
              onClick={() => {
                router.push(`/chat/${session.id}`);
              }}
            >
              <div className="text-sm font-medium">
                {formatDistanceToNow(new Date(session.createdAt), {
                  addSuffix: true,
                })}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {preview}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

// Create a loading component
function ChatListLoading() {
  return (
    <div className="text-sm text-muted-foreground p-4 text-center">
      Loading chat history...
    </div>
  );
}

// Main AppSidebar component
export function AppSidebar() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSessions() {
      try {
        setLoading(true);
        // getAllChatSessions throws if not authenticated
        const data = await getAllChatSessions();
        setSessions(Array.isArray(data) ? data : []);
      } catch (err) {
        // If the user is not logged in or there's a server error, catch it here
        console.error("Error loading chat sessions:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load chat history."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSessions();
  }, []);

  return (
    <Sidebar className="bg-background border-r">
      <SidebarContent className="bg-background p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Chat History</h2>
        </div>
        {loading ? (
          <ChatListLoading />
        ) : error ? (
          <div className="text-sm text-red-500 p-4 text-center">{error}</div>
        ) : (
          <ChatList sessions={sessions} />
        )}
      </SidebarContent>
    </Sidebar>
  );
}
