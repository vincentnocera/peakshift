'use client'

import { useState, useEffect, useCallback } from 'react'
import { TherapyChapter } from '@/lib/therapy-tutorials'
import { Button } from '@/components/ui/button'
import { Trash2, Plus, GripVertical } from 'lucide-react'
import ChapterForm from './ChapterForm'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ChapterListProps {
  bookId: string
}

export default function ChapterList({ bookId }: ChapterListProps) {
  const [chapters, setChapters] = useState<TherapyChapter[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingChapter, setIsAddingChapter] = useState(false)
  const [deletingChapter, setDeletingChapter] = useState<TherapyChapter | null>(null)
  const { toast } = useToast()

  const fetchChapters = useCallback(async () => {
    try {
      const response = await fetch(`/api/therapy-chapters?bookId=${bookId}`)
      if (!response.ok) throw new Error('Failed to fetch chapters')
      const data = await response.json()
      setChapters(data)
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to load chapters: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [bookId, toast])

  useEffect(() => {
    fetchChapters()
  }, [bookId, fetchChapters])

  const handleDelete = async () => {
    if (!deletingChapter) return

    try {
      console.log('Attempting to delete chapter with ID:', deletingChapter.id)
      
      const response = await fetch(`/api/therapy-chapters/${deletingChapter.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Server response:', response.status, errorText)
        throw new Error(`Failed to delete chapter: ${response.status} ${errorText}`)
      }

      toast({
        title: "Success",
        description: "Chapter deleted successfully",
      })
      fetchChapters()
    } catch (error: unknown) {
      console.error('Error deleting chapter:', error)
      toast({
        title: "Error",
        description: `Failed to delete chapter: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      })
    } finally {
      setDeletingChapter(null)
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading chapters...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Chapters</h3>
        <Button onClick={() => setIsAddingChapter(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Chapter
        </Button>
      </div>

      <div className="space-y-2">
        {chapters.map((chapter) => (
          <div
            key={chapter.id}
            className="flex items-center justify-between p-3 bg-muted rounded-lg group"
          >
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <span>{chapter.title}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeletingChapter(chapter)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <ChapterForm
        open={isAddingChapter}
        onClose={() => setIsAddingChapter(false)}
        onSuccess={() => {
          setIsAddingChapter(false)
          fetchChapters()
        }}
        bookId={bookId}
      />

      <AlertDialog open={!!deletingChapter} onOpenChange={() => setDeletingChapter(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this chapter.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 