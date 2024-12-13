'use client'

import { useState, useEffect } from 'react'
import { TherapyBook, TherapyChapter } from '@/lib/therapy-tutorials'
import { Concept, ProcessingStatus } from '@/types/concepts'
import { ChapterProcessingService } from '@/lib/services/chapter-processing'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import ProcessingStatusIndicator from '../../../components/ProcessingStatus'
import ConceptReview from '../../../components/ConceptReview'

export default function ChapterProcessingPage() {
  const [books, setBooks] = useState<TherapyBook[]>([])
  const [selectedBookId, setSelectedBookId] = useState<string>('')
  const [chapters, setChapters] = useState<TherapyChapter[]>([])
  const [selectedChapterId, setSelectedChapterId] = useState<string>('')
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({ stage: 'idle' })
  const [extractedConcepts, setExtractedConcepts] = useState<Partial<Concept>[]>([])
  const { toast } = useToast()
  
  const processingService = new ChapterProcessingService()

  useEffect(() => {
    fetchBooks()
  }, [])

  useEffect(() => {
    if (selectedBookId) {
      fetchChapters(selectedBookId)
    }
  }, [selectedBookId])

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/therapy-books')
      if (!response.ok) throw new Error('Failed to fetch books')
      const data = await response.json()
      setBooks(data)
    } catch (e) {
      console.error("Failed to load books:", e)
      toast({
        title: "Error",
        description: "Failed to load books",
        variant: "destructive"
      })
    }
  }

  const fetchChapters = async (bookId: string) => {
    try {
      const response = await fetch(`/api/therapy-chapters/${bookId}`)
      if (!response.ok) throw new Error('Failed to fetch chapters')
      const data = await response.json()
      setChapters(data)
    } catch (e) {
      console.error("Failed to load chapters:", e)
      toast({
        title: "Error",
        description: "Failed to load chapters",
        variant: "destructive"
      })
    }
  }

  const startProcessing = async () => {
    if (!selectedChapterId) return

    try {
      // 1. Set initial status
      setProcessingStatus({ stage: 'extracting-concepts' })

      // 2. Fetch chapter content
      const chapterResponse = await fetch(`/api/therapy-chapters/content/${selectedChapterId}`)
      if (!chapterResponse.ok) throw new Error('Failed to fetch chapter content')
      const { content } = await chapterResponse.json()

      // 3. Extract concepts
      const concepts = await processingService.extractConcepts(content)
      setExtractedConcepts(concepts)

      // 4. Analyze each concept
      setProcessingStatus({ 
        stage: 'analyzing-concepts',
        progress: 0,
        totalSteps: concepts.length 
      })

      const analyzedConcepts = await Promise.all(
        concepts.map(async (concept, index) => {
          const analysis = await processingService.analyzeConceptDetails(concept, content)
          setProcessingStatus(prev => ({
            ...prev,
            progress: index + 1
          }))
          return {
            ...concept,
            ...analysis
          }
        })
      )

      setExtractedConcepts(analyzedConcepts)
      setProcessingStatus({ stage: 'review' })

    } catch (e) {
      console.error("Processing failed:", e)
      setProcessingStatus({ 
        stage: 'error',
        error: 'Processing failed. Please try again.'
      })
      toast({
        title: "Error",
        description: "Processing failed",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Chapter Processing</h1>
      
      <div className="space-y-6">
        {/* Book Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Book</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedBookId}
            onChange={(e) => setSelectedBookId(e.target.value)}
          >
            <option value="">Select a book...</option>
            {books.map((book) => (
              <option key={book.id} value={book.id}>{book.title}</option>
            ))}
          </select>
        </div>

        {/* Chapter Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Chapter</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedChapterId}
            onChange={(e) => setSelectedChapterId(e.target.value)}
            disabled={!selectedBookId}
          >
            <option value="">Select a chapter...</option>
            {chapters.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>{chapter.title}</option>
            ))}
          </select>
        </div>

        {/* Processing Controls */}
        <Button
          onClick={startProcessing}
          disabled={!selectedChapterId || processingStatus.stage !== 'idle'}
        >
          Start Processing
        </Button>

        {/* Status Display */}
        <ProcessingStatusIndicator status={processingStatus} />

        {/* Results Review */}
        {processingStatus.stage === 'review' && (
          <ConceptReview 
            concepts={extractedConcepts}
            onSave={async (concepts) => {
              try {
                setProcessingStatus({ stage: 'saving' })
                
                // Save each concept
                await Promise.all(concepts.map(concept => 
                  fetch('/api/concepts', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      ...concept,
                      chapterId: selectedChapterId,
                      orderIndex: 0 // You might want to implement proper ordering
                    })
                  })
                ))

                setProcessingStatus({ stage: 'complete' })
                toast({
                  title: "Success",
                  description: "Concepts saved successfully"
                })

              } catch (e) {
                console.error("Failed to save concepts:", e)
                setProcessingStatus({ 
                  stage: 'error',
                  error: 'Failed to save concepts'
                })
                toast({
                  title: "Error",
                  description: "Failed to save concepts",
                  variant: "destructive"
                })
              }
            }}
          />
        )}
      </div>
    </div>
  )
} 