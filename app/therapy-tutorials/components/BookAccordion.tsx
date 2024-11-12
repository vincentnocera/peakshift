'use client'

import { useState, useEffect } from 'react'
import { TherapyBook, TherapyChapter } from '@/lib/therapy-tutorials'
import ChapterItem from './ChapterItem'
// import { ChevronDown } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface BookAccordionProps {
  book: TherapyBook
}

export default function BookAccordion({ book }: BookAccordionProps) {
  const [chapters, setChapters] = useState<TherapyChapter[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchChapters = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/therapy-chapters?bookId=${book.id}`)
        if (!response.ok) throw new Error('Failed to fetch chapters')
        const data = await response.json()
        setChapters(data)
      } catch (err) {
        console.error('Error fetching chapters:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchChapters()
  }, [book.id])

  return (
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
            {loading ? (
              <div className="text-center py-4">Loading chapters...</div>
            ) : chapters.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No chapters available</div>
            ) : (
              chapters.map((chapter) => (
                <ChapterItem key={chapter.id} chapter={chapter} />
              ))
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
} 