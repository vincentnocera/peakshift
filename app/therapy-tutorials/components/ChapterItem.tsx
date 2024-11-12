'use client'

import { useRouter } from 'next/navigation'
import { TherapyChapter } from '@/lib/therapy-tutorials'
import { BookOpen } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface ChapterItemProps {
  chapter: TherapyChapter
}

export default function ChapterItem({ chapter }: ChapterItemProps) {
  const router = useRouter()

  const handleStartTutorial = () => {
    // We'll implement this later to start the tutorial chat
    router.push(`/therapy-tutorials/chat/${chapter.id}`)
  }

  return (
    <Button
      variant="ghost"
      onClick={handleStartTutorial}
      className="w-full justify-between"
    >
      <span className="font-medium">{chapter.title}</span>
      <BookOpen className="h-5 w-5" />
    </Button>
  )
} 