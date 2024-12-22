import { NextResponse } from 'next/server'
import { deleteChapter, getChaptersByBookId } from '@/lib/therapy-tutorials'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'

console.log('Dynamic route handler registered for therapy-chapters/[id]')

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    const bookId = pathSegments[pathSegments.length - 1]
    const chapters = await getChaptersByBookId(bookId)
    return NextResponse.json(chapters)
  } catch (error) {
    console.error('Error fetching chapters:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

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

    // Remove the prefix handling since IDs are stored without prefix
    const cleanId = id

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

    console.log('Attempting to delete chapter:', cleanId)
    const success = await deleteChapter(cleanId)
    console.log('Delete operation result:', success)

    if (!success) {
      return new NextResponse('Chapter not found', { status: 404 })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting chapter:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 