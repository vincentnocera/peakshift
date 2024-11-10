import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

interface Specialty {
  name: string;
  subtopics: string[];
}

export async function DELETE(request: Request) {
  try {
    // Check if user is authenticated and has admin role
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await (await clerkClient()).users.getUser(userId);
    if (user.publicMetadata.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { specialtyName, subtopicName } = await request.json();
    
    const specialty = await kv.get(`specialty:${specialtyName}`) as Specialty;
    if (!specialty) {
      return NextResponse.json(
        { error: 'Specialty not found' },
        { status: 404 }
      );
    }

    specialty.subtopics = specialty.subtopics.filter(st => st !== subtopicName);
    await kv.set(`specialty:${specialtyName}`, specialty);
    
    return NextResponse.json({ message: 'Subtopic deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete subtopic' },
      { status: 500 }
    );
  }
}