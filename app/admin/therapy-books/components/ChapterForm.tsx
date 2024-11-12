'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ChapterFormProps {
  bookId: string
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ChapterForm({ bookId, open, onClose, onSuccess }: ChapterFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    orderIndex: 0,
    bookId: bookId
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/therapy-chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create chapter')
      }

      // Clear form
      setFormData({
        title: '',
        content: '',
        orderIndex: 0,
        bookId: bookId
      })

      // Refresh data and close modal if provided
      if (onSuccess) {
        onSuccess()
      }
      
      router.refresh()
    } catch (error) {
      console.error('Error creating chapter:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Chapter</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderIndex">Order Index</Label>
            <Input
              id="orderIndex"
              type="number"
              value={formData.orderIndex}
              onChange={(e) => setFormData(prev => ({ ...prev, orderIndex: parseInt(e.target.value) }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="min-h-[200px] max-h-[400px] resize-none"
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit">
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 