import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { getChapter } from "@/lib/therapy-tutorials";

export async function GET(request: Request) {
  try {
    // Extract the 'chapterId' from the request URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split("/");
    const chapterId = pathSegments[pathSegments.length - 1]; // Get the last segment

    if (!chapterId) {
      console.error("No chapterId found in the URL:", request.url);
      return new NextResponse("Bad Request", { status: 400 });
    }

    // Get auth session and check user
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user role using clerkClient
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = user.publicMetadata.role as string;

    if (!role || !["therapist", "admin"].includes(role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const chapter = await getChapter(chapterId);
    if (!chapter) {
      return new NextResponse("Chapter not found", { status: 404 });
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.error("Error fetching chapter:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
