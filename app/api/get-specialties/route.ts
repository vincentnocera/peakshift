import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

// GET /api/specialties
// Returns all specialties and their subtopics
export async function GET() {
  try {
    // Get all keys that match the specialty pattern
    const specialtyKeys = await kv.keys('specialty:*')
    
    // Fetch all specialties data in parallel
    const specialties = await Promise.all(
      specialtyKeys.map(async (key) => await kv.get(key))
    )

    return NextResponse.json({ specialties }, { status: 200 })
  } catch (error) {
    console.error('Error fetching specialties:', error)
    return NextResponse.json(
      { error: 'Failed to fetch specialties' },
      { status: 500 }
    )
  }
}

