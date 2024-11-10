import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import { auth } from "@clerk/nextjs/server"
import { clerkClient } from "@clerk/nextjs/server"

// Add interface for specialty type
interface Specialty {
  name: string;
  subtopics: string[];
}

// POST /api/specialties/new
// Creates a new specialty
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
    
    const { name } = await request.json()
    
    if (!name) {
      return NextResponse.json(
        { error: 'Specialty name is required' },
        { status: 400 }
      )
    }

    // Check if specialty already exists
    const existingSpecialty = await kv.get(`specialty:${name}`)
    if (existingSpecialty) {
      return NextResponse.json(
        { error: 'Specialty already exists' },
        { status: 409 }
      )
    }

    // Create new specialty with empty subtopics array
    const newSpecialty: Specialty = {
      name,
      subtopics: []
    }
    await kv.set(`specialty:${name}`, newSpecialty)

    return NextResponse.json(
      { message: 'Specialty created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating specialty:', error)
    return NextResponse.json(
      { error: 'Failed to create specialty' },
      { status: 500 }
    )
  }
} 