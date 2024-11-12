'use client'

import { useState, useEffect } from 'react'
import { TherapyBook } from '@/lib/therapy-tutorials'
import { Button } from '@/components/ui/button'
import { Trash2, Plus } from 'lucide-react'
import ChapterList from './ChapterList'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { useToast } from '@/hooks/use-toast'

interface BookListProps {
  books: TherapyBook[]
  onBooksChange: () => void
}

export default function BookList({ books, onBooksChange }: BookListProps) {
  const [deletingBook, setDeletingBook] = useState<TherapyBook | null>(null)
  const [expandedBook, setExpandedBook] = useState<string | null>(null)
  const [localBooks, setLocalBooks] = useState<TherapyBook[]>(books)
  const { toast } = useToast()

  useEffect(() => {
    console.log('Current deletingBook:', deletingBook)
  }, [deletingBook])

  useEffect(() => {
    console.log('Books array:', books)
  }, [books])

  useEffect(() => {
    setLocalBooks(books)
  }, [books])

  const handleDelete = async () => {
    if (!deletingBook || !deletingBook.id) {
      console.error('No valid book selected for deletion:', deletingBook)
      return
    }

    try {
      const url = `/api/therapy-books/${deletingBook.id}`
      console.log('Attempting to delete book at URL:', url)
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Server response:', response.status, errorText)
        throw new Error(`Failed to delete book: ${response.status} ${errorText}`)
      }

      setLocalBooks(prevBooks => prevBooks.filter(book => book.id !== deletingBook.id))
      
      toast({
        title: "Success",
        description: "Book deleted successfully",
      })
      onBooksChange()
    } catch (error: unknown) {
      console.error('Error deleting book:', error)
      toast({
        title: "Error",
        description: "Failed to delete book. Please try again.",
        variant: "destructive"
      })
    } finally {
      setDeletingBook(null)
    }
  }

  const onDeleteClick = (book: TherapyBook) => {
    console.log('Attempting to delete book:', book)
    if (!book.id) {
      console.error('Book is missing ID:', book)
      toast({
        title: "Error",
        description: "Cannot delete book: Missing ID",
        variant: "destructive"
      })
      return
    }
    setDeletingBook(book)
  }

  return (
    <div className="space-y-4">
      {localBooks.map((book) => (
        <Card key={book.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{book.title}</CardTitle>
                <CardDescription>{book.author}</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onDeleteClick(book)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{book.description}</p>
            
            {expandedBook === book.id ? (
              <ChapterList bookId={book.id} />
            ) : (
              <Button variant="outline" onClick={() => setExpandedBook(book.id)}>
                <Plus className="mr-2 h-4 w-4" />
                Manage Chapters
              </Button>
            )}
          </CardContent>
        </Card>
      ))}

      <AlertDialog open={!!deletingBook} onOpenChange={() => setDeletingBook(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the book and all its chapters.
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