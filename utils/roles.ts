import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

// Helper function to check if user has admin role
export async function checkRole(role: string) {
  const { userId } = await auth();
  
  // If no user is logged in, return false
  if (!userId) {
    return false;
  }

  // Get the user's metadata from Clerk
  const user = await (await clerkClient()).users.getUser(userId);
  const userRole = user.publicMetadata.role as string;
  
  return userRole === role;
} 