import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { 
  createConcept,
  getConceptsByChapterId
} from '@/lib/therapy-tutorials'

export async function GET(request: Request) {
  try {
    // Auth checks
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    const role = user.publicMetadata.role as string
    if (!role || !['therapist', 'admin'].includes(role)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get chapterId from URL params
    const { searchParams } = new URL(request.url)
    const chapterId = searchParams.get('chapterId')
    if (!chapterId) {
      return new NextResponse('Chapter ID is required', { status: 400 })
    }

    const concepts = await getConceptsByChapterId(chapterId)
    return NextResponse.json(concepts)

  } catch (error) {
    console.error('Error fetching concepts:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Auth checks
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    const role = user.publicMetadata.role as string
    if (!role || !['therapist', 'admin'].includes(role)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const conceptData = await request.json()
    const newConcept = await createConcept(conceptData)
    return NextResponse.json(newConcept)

  } catch (error) {
    console.error('Error creating concept:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 