"use client";

import { Sidebar, SidebarContent } from "@/components/ui/sidebar"
// import { Suspense } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { ChatSession } from "@/types/chat"
import { getAllChatSessions, deleteChatSession } from "@/app/actions/chat-sessions"
import { useEffect, useState } from "react"
import { X } from "lucide-react"
// import { ClerkProvider } from '@clerk/nextjs'

function ChatList({ sessions, onDelete }: { sessions: ChatSession[], onDelete: (id: string) => void }) {
  const router = useRouter();
  
  const validSessions = sessions.filter(
    (s) => s && typeof s.createdAt === "string"
  );

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

  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    try {
      await deleteChatSession(sessionId);
      onDelete(sessionId);
    } catch (error) {
      console.error('Error deleting chat session:', error);
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <div className="space-y-2">
        {sortedSessions.map((session) => {
          return (
            <div
              key={session.id}
              className="p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors relative group"
              onClick={() => {
                router.push(`/case-simulator/?chatId=${session.id}`);
              }}
            >
              <div className="text-sm font-medium">
                {formatDistanceToNow(new Date(session.createdAt), {
                  addSuffix: true,
                })}
              </div>
              <button
                onClick={(e) => handleDelete(e, session.id)}
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                aria-label="Delete chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

function ChatListLoading() {
  return (
    <div className="text-sm text-muted-foreground p-4 text-center">
      Loading chat history...
    </div>
  );
}

export function AppSidebar() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    async function loadSessions() {
      try {
        setLoading(true);
        const data = await getAllChatSessions();
        if (mounted && Array.isArray(data)) {
          setSessions(data);
        }
      } catch (err) {
        console.error("Error loading chat sessions:", err);
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load chat history."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSessions();

    return () => {
      mounted = false;
    };
  }, []);

  const handleDelete = (deletedId: string) => {
    setSessions(sessions.filter(session => session.id !== deletedId));
  };

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
          <ChatList sessions={sessions} onDelete={handleDelete} />
        )}
      </SidebarContent>
    </Sidebar>
  );
}
