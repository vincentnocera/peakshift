'use client'

import { useState, useEffect } from 'react'
import { TherapyBook } from '@/lib/therapy-tutorials'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import BookForm from './components/BookForm'
import BookList from './components/BookList'
import { useToast } from '@/hooks/use-toast'

export default function AdminTherapyBooks() {
  const [books, setBooks] = useState<TherapyBook[]>([])
  const [isAddingBook, setIsAddingBook] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/therapy-books')
      if (!response.ok) throw new Error('Failed to fetch books')
      const data = await response.json()
      setBooks(data)
    } catch (error: unknown) {
      console.error('Error fetching books:', error)
      toast({
        title: "Error",
        description: "Failed to load books. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Therapy Books</h1>
        <Button onClick={() => setIsAddingBook(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Book
        </Button>
      </div>

      <BookForm
        open={isAddingBook}
        onClose={() => setIsAddingBook(false)}
        onSuccess={() => {
          setIsAddingBook(false)
          fetchBooks()
        }}
      />

      <BookList books={books} onBooksChange={fetchBooks} />
    </div>
  )
} 