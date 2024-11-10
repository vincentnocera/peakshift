import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid'; // You'll need to install this package

// Define the article type
interface Article {
  text: string;
  specialty: string;
  subtopic: string;
  dateAdded: string;
}

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

    // Parse the request body
    const article: Article = await request.json();
    
    // Generate a unique ID for the article
    const articleId = uuidv4();

    // Add the article to KV store
    await kv.hset("articles", {
      [articleId]: article
    });

    return NextResponse.json({ id: articleId, ...article }, { status: 201 });
  } catch (error) {
    console.error('Error adding article:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}