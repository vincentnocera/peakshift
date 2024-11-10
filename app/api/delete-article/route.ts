import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
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

    // Get the article ID from the request body
    const body = await request.json().catch(() => ({}));
    
    if (!body?.id) {
      return new NextResponse("Missing article ID", { status: 400 });
    }

    // Delete the article from KV store
    await kv.hdel("articles", body.id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting article:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 