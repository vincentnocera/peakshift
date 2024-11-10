import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

// Define the article type
interface Article {
  text: string;
  specialty: string;
  subtopic: string;
  dateAdded: string;
}

export async function GET() {
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

    // Fetch all articles from KV
    const articles = (await kv.hgetall("articles") || {}) as Record<string, Article>;
    
    // Convert the object into an array and add the id to each article
    const articlesArray = Object.entries(articles).map(([id, article]) => ({
      id,
      ...article,
    }));

    return NextResponse.json(articlesArray);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 