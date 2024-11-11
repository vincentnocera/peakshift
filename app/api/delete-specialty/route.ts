import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

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

    const { name } = await request.json();
    await kv.del(`specialty:${name}`);
    
    return NextResponse.json({ message: 'Specialty deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting specialty:', error);
    return NextResponse.json(
      { error: 'Failed to delete specialty' },
      { status: 500 }
    );
  }
} 