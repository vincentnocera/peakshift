import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { 
  createChapter,
  getChaptersByBookId
} from '@/lib/therapy-tutorials'

export async function GET(request: Request) {
  try {
    // Get auth session and check user
    const auth_result = await auth()
    const userId = auth_result.userId
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get user role using clerkClient
    const user = await (await clerkClient()).users.getUser(userId)
    const role = user.publicMetadata.role as string

    if (!role || !['therapist', 'admin'].includes(role)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get bookId from URL params
    const { searchParams } = new URL(request.url)
    const bookId = searchParams.get('bookId')

    if (!bookId) {
      return new NextResponse('Book ID is required', { status: 400 })
    }

    const chapters = await getChaptersByBookId(bookId)
    return NextResponse.json(chapters)
  } catch (error) {
    console.error('Error fetching chapters:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Get auth session and check user
    const auth_result = await auth()
    const userId = auth_result.userId
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get user role using clerkClient
    const user = await (await clerkClient()).users.getUser(userId)
    const role = user.publicMetadata.role as string

    if (!role || !['admin'].includes(role)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const chapter = await createChapter(body)
    
    if (!chapter) {
      return new NextResponse('Failed to create chapter', { status: 400 })
    }
    
    return NextResponse.json(chapter)
  } catch (error) {
    console.error('Error creating chapter:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 