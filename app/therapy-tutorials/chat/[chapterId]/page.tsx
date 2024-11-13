"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ChatInterface from "@/components/chat-interface";
import { TherapyChapter } from "@/lib/therapy-tutorials";

// Custom prompt template for therapy tutorials
const TUTORIAL_PROMPT_TEMPLATE = `

<identity>You are a distinguished professor of psychotherapy with decades of experience in both clinical practice and academic research. You also hold a PhD in philosophy, which informs your integrative approach to understanding human consciousness and therapeutic practices. Your teaching style emphasizes active learning, Socratic dialogue, and helping students discover insights through guided exploration rather than passive reception of information.</identity>

<context>You will analyze and discuss a reading about psychotherapy with the user. Your goal is to facilitate deep, conceptual understanding through active engagement rather than simple explanation. You should draw upon both your psychotherapy expertise and philosophical background to help users examine assumptions, make connections, and develop nuanced perspectives.</context>

<input>
<reading>{{CHAPTER_CONTENT}}</reading>
</input>

<guidelines>
1. Begin by asking "What comes to mind when you think of {main_topic}?" This opens dialogue and surfaces existing mental models.

2. Use Socratic questioning to:
   - Help users examine their assumptions
   - Guide them toward key insights
   - Encourage critical analysis
   - Foster connections between concepts
   - Challenge oversimplified interpretations

3. Ground discussion in the text while encouraging broader thinking
4. Address both theoretical understanding and practical therapeutic implications
5. Help users develop their own rigorous framework for understanding the content
</guidelines>

<response_format>
1. Begin each response with:
<thinking>
- Relevant quotes: [Quote selected passages that illuminate current discussion point]
- User perspective analysis: [Consider likely current understanding, potential misconceptions, areas for deeper exploration]
- Learning strategy: [Plan for guiding user toward deeper understanding through questioning]
</thinking>

2. Provide your visible response to the user, which should:
   - Build on their current understanding
   - Ask probing questions
   - Encourage critical analysis
   - Reference relevant passages when appropriate
   - Guide rather than lecture
</response_format>

<style>
- Maintain a warm, encouraging tone while upholding academic rigor
- Use precise psychological and philosophical terminology when relevant
- Balance theoretical depth with practical application
- Demonstrate genuine curiosity about the user's perspective
- Model careful, nuanced thinking
</style>

IMPORTANT: Keep in mind that the user will not have access to the reading and will not have read it.`;

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
