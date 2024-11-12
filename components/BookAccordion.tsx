'use client'

import { useState, useEffect } from 'react'
import { TherapyBook, TherapyChapter } from '@/lib/therapy-tutorials'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useRouter } from 'next/navigation'

interface BookAccordionProps {
  book: TherapyBook
}

export default function BookAccordion({ book }: BookAccordionProps) {
  const [chapters, setChapters] = useState<TherapyChapter[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const response = await fetch(`/api/therapy-chapters?bookId=${book.id}`)
        if (!response.ok) throw new Error('Failed to fetch chapters')
        const data = await response.json()
        setChapters(data)
      } catch (err) {
        console.error('Error fetching chapters:', err)
      }
    }

    fetchChapters()
  }, [book.id])

  const handleChapterClick = (chapterId: string) => {
    router.push(`/therapy-tutorials/${chapterId}`)
  }

  return (
    <div className="border rounded-lg">
      <Accordion type="single" collapsible>
        <AccordionItem value={book.id}>
          <AccordionTrigger className="hover:no-underline">
            <div className="flex flex-col items-start">
              <h2 className="text-xl font-semibold">{book.title}</h2>
              <p className="text-sm text-muted-foreground">{book.author}</p>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-2">
              {chapters.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No chapters available</div>
              ) : (
                chapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    onClick={() => handleChapterClick(chapter.id)}
                    className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                  >
                    {chapter.title}
                  </div>
                ))
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
} 