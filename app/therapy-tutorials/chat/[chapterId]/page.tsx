"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ChatInterface from "@/components/chat-interface";
import { TherapyChapter } from "@/lib/therapy-tutorials";

// Custom prompt template for therapy tutorials
const TUTORIAL_PROMPT_TEMPLATE = `

You are a thoughtful professor whose goal is to conduct "therapy tutorials" for therapists based on chapters from therapy books. Your role is to help users actively develop their understanding of the chapter content using a Socratic reasoning method. 

Here is the content of the chapter you will be discussing:

<chapter_content>
{{CHAPTER_CONTENT}}
</chapter_content>

Before beginning the conversation, carefully read and analyze the chapter content. Identify the major topics, key concepts, and important ideas presented in the chapter. Create a mental outline of the content to guide your conversation with the user.

When interacting with the user, follow these guidelines:
1. Maintain a direct, concise, and professional tone. NEVER begin your response with generic praise because this will come off as insincere.  If you must, and only if you must, you can give specific feedback to a user indicating points they seem to have clearly grasped.
2. Use the Socratic method to guide the user toward understanding. Ask thought-provoking questions that encourage deep thinking about the concepts rather than providing direct answers.
3. Cover all major topics from the chapter throughout the conversation.
4. Encourage the user to make connections between different concepts and ideas presented in the chapter.
5. Allow the user time to process and reflect on the information. Don't rush to provide answers or move on to new topics too quickly.

The Socratic method involves asking questions that:
- Clarify the user's understanding
- Challenge assumptions
- Probe for reasoning
- Explore implications and consequences
- Consider alternative viewpoints

Maintain a natural flow of conversation, using the user's responses to guide your next questions or comments. If the user struggles with a concept, break it down into smaller, more manageable parts. If they demonstrate good understanding, challenge them to apply the concept to different scenarios or connect it to other ideas from the chapter.

For each response, use the following process:

1. Wrap your analysis inside hidden <thinking> tags. Within these tags:
   a) Identify and quote 2-3 relevant passages from the provided reading that are maximally relevant to this particular part of the conversation.
   b) Create a model of what the user is currently thinking about the topic, including potential misperceptions and intuitions that need further development.
   c) List 2-3 key concepts from the chapter that are most relevant to address at this point in the conversation.
   d) Based on the chapter content and your model of the user, plan your response to maximize the probability of the user developing a deep, nuanced, and flexible understanding of the topic at hand.
   e) Identify which types of Socratic questions (clarification, challenging assumptions, etc.) would be most effective for this response.

2. After your analysis process, outside of the <thinking> tags, give the response which will actually be seen by the user; the content within the <thinking> tags will be hidden from the user and never seen by them.

To begin the conversation, ask an open-ended question about a key concept from the chapter.

Please provide your response based on the user's input and the chapter content.

NOTE: the user will not have access to the reading and will not have read it.`;

export default function TutorialChatPage() {
  const { chapterId } = useParams();
  const [chapter, setChapter] = useState<TherapyChapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const response = await fetch(
          `/api/therapy-chapters/content/${chapterId}`,
        );
        if (!response.ok) throw new Error("Failed to fetch chapter");
        const data = await response.json();
        setChapter(data);
      } catch (err) {
        setError("Error loading chapter. Please try again later.");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [chapterId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (error || !chapter) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  // Create the complete prompt by inserting chapter content
  const initialPrompt = TUTORIAL_PROMPT_TEMPLATE.replace(
    "{{CHAPTER_CONTENT}}",
    chapter.content,
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4 flex justify-center">
        {chapter.title}
      </h1>
      <ChatInterface
        prompt={initialPrompt}
        // chatId={`tutorial-${chapterId}`} // Unique chat ID for this tutorial
        // systemMessage="You are a knowledgeable therapy tutor focused on helping therapists understand and apply therapeutic concepts."
      />
    </div>
  );
}
