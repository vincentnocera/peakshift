'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ChatInterface from '@/components/chat-interface'
import { TherapyChapter } from '@/lib/therapy-tutorials'

// Custom prompt template for therapy tutorials
const TUTORIAL_PROMPT_TEMPLATE = `You are an expert therapy tutor. Your role is to help therapists understand and apply the following material in their practice. Here is the chapter content to discuss:

{{CHAPTER_CONTENT}}

Please help the therapist understand this material by:
1. Answering their questions
2. Providing practical examples
3. Explaining complex concepts in simple terms
4. Suggesting ways to apply this knowledge in clinical practice

Keep your responses focused on the chapter content while drawing from established therapeutic principles.`

export default function TutorialChatPage() {
  const { chapterId } = useParams()
  const [chapter, setChapter] = useState<TherapyChapter | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const response = await fetch(`/api/therapy-chapters/content/${chapterId}`)
        if (!response.ok) throw new Error('Failed to fetch chapter')
        const data = await response.json()
        setChapter(data)
      } catch (err) {
        setError('Error loading chapter. Please try again later.')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchChapter()
  }, [chapterId])

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (error || !chapter) {
    return <div className="text-red-500 text-center">{error}</div>
  }

  // Create the complete prompt by inserting chapter content
  const initialPrompt = TUTORIAL_PROMPT_TEMPLATE.replace(
    '{{CHAPTER_CONTENT}}',
    chapter.content
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{chapter.title}</h1>
      <ChatInterface 
        prompt={initialPrompt}
        // chatId={`tutorial-${chapterId}`} // Unique chat ID for this tutorial
        // systemMessage="You are a knowledgeable therapy tutor focused on helping therapists understand and apply therapeutic concepts."
      />
    </div>
  )
} 