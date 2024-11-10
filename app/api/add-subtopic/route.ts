import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import { auth } from "@clerk/nextjs/server"
import { clerkClient } from "@clerk/nextjs/server"

// Add interface for specialty type
interface Specialty {
  name: string;
  subtopics: string[];
}

// POST /api/subtopics/new
// Adds a new subtopic to an existing specialty
export async function POST(request: Request) {
  try {
    // Check if user is authenticated and has admin role
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user's role from Clerk
    const user = await (await clerkClient()).users.getUser(userId);
    if (user.publicMetadata.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }
    
    const { specialtyName, subtopicName } = await request.json()
    
    if (!specialtyName || !subtopicName) {
      return NextResponse.json(
        { error: 'Specialty name and subtopic name are required' },
        { status: 400 }
      )
    }

    // Get existing specialty with type assertion
    const specialty = await kv.get(`specialty:${specialtyName}`) as Specialty;
    if (!specialty) {
      return NextResponse.json(
        { error: 'Specialty not found' },
        { status: 404 }
      )
    }

    // Check if subtopic already exists
    if (specialty.subtopics.includes(subtopicName)) {
      return NextResponse.json(
        { error: 'Subtopic already exists in this specialty' },
        { status: 409 }
      )
    }

    // Add new subtopic to the array
    specialty.subtopics.push(subtopicName)
    
    // Update the specialty in KV store
    await kv.set(`specialty:${specialtyName}`, specialty)

    return NextResponse.json(
      { message: 'Subtopic added successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error adding subtopic:', error)
    return NextResponse.json(
      { error: 'Failed to add subtopic' },
      { status: 500 }
    )
  }
}