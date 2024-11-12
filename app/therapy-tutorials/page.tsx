'use client'

import { useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'
import { TherapyBook } from '@/lib/therapy-tutorials'
import BookAccordion from './components/BookAccordion'
// import { useUser } from '@clerk/nextjs'

export default function TherapyTutorialsPage() {
  const [books, setBooks] = useState<TherapyBook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
//   const router = useRouter()
//   const { user } = useUser()

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('/api/therapy-books')
        if (!response.ok) throw new Error('Failed to fetch books')
        const data = await response.json()
        setBooks(data)
      } catch (err) {
        setError('Error loading books. Please try again later.')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Therapy Tutorials</h1>
      <div className="space-y-4">
        {books.map((book) => (
          <BookAccordion key={book.id} book={book} />
        ))}
      </div>
    </div>
  )
}
