import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    // Auth check
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Role check
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    const role = user.publicMetadata.role as string
    if (!role || !['therapist', 'admin'].includes(role)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get prompt from request
    const { prompt } = await request.json()
    if (!prompt) {
      return new NextResponse('Prompt is required', { status: 400 })
    }

    // Generate text using AI SDK
    const { text } = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that analyzes therapy-related content and provides structured responses in JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
    })

    return NextResponse.json(JSON.parse(text))

  } catch (error) {
    console.error('AI API error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 