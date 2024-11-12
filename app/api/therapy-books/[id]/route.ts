import { NextResponse } from 'next/server'
import { deleteBook } from '@/lib/therapy-tutorials'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'

console.log('Dynamic route handler registered for therapy-books/[id]')

export async function DELETE(request: Request) {
  try {
    // Extract the 'id' from the request URL
    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    const id = pathSegments[pathSegments.length - 1] // Get the last segment

    if (!id) {
      console.error('No ID found in the URL:', request.url)
      return new NextResponse('Bad Request', { status: 400 })
    }

    console.log('DELETE handler received id:', id)

    const cleanId = id.startsWith('book:') ? id : `book:${id}`

    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const role = user.publicMetadata.role as string

    if (!role || !['admin'].includes(role)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    console.log('Attempting to delete book:', cleanId)
    const success = await deleteBook(cleanId)
    console.log('Delete operation result:', success)

    if (!success) {
      return new NextResponse('Book not found', { status: 404 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting book:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 