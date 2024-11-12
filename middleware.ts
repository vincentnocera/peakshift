import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clerkClient } from '@clerk/nextjs/server';

// Protect all routes under /admin/
const isAdminRoute = createRouteMatcher(['/admin/(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    const auth_result = await auth();
    const userId = auth_result.userId;
    
    if (!userId) {
      // Redirect unauthorized users to the sign-in page
      const signInUrl = new URL('/', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }
    // Get the full user object to check role
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = user.publicMetadata.role as string;

    if (role !== 'admin') {
      // Redirect non-admin users to the sign-in page
      const signInUrl = new URL('/', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }
  }
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};