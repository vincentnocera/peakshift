import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

interface Article {
  id: string;
  text: string;
  specialty: string;
  subtopic: string;
  dateAdded: string;
}

export async function GET(request: Request) {
  try {
    // Get specialty and subtopics from URL params
    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get('specialty');
    const subtopics = searchParams.get('subtopics')?.split(',');

    if (!specialty || !subtopics) {
      return new NextResponse("Missing specialty or subtopics", { status: 400 });
    }

    // Fetch all articles
    const articles = (await kv.hgetall("articles") || {}) as Record<string, Article>;
    
    // Filter articles based on specialty and subtopics
    const matchingArticles = Object.entries(articles)
      .map(([id, article]) => ({ id, ...article }))
      .filter(article => 
        article.specialty === specialty && 
        subtopics.includes(article.subtopic)
      );

    if (matchingArticles.length === 0) {
      return new NextResponse("No matching articles found", { status: 404 });
    }

    // Select random article
    const randomArticle = matchingArticles[Math.floor(Math.random() * matchingArticles.length)];

    return NextResponse.json(randomArticle);
  } catch (error) {
    console.error('Error fetching random article:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}