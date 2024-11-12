import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import {
  createBook,
  getAllBooks,
//   updateBook,
//   deleteBook 
} from '@/lib/therapy-tutorials'
import { clerkClient } from '@clerk/nextjs/server'

export async function GET() {
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

    const books = await getAllBooks()
    return NextResponse.json(books)
  } catch (error) {
    console.error('Error fetching books:', error)
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
    const book = await createBook(body)
    return NextResponse.json(book)
  } catch (error) {
    console.error('Error creating book:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 