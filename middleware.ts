import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  publicRoutes: [
    "/",
    "/api/chat-openai",
    "/api/transcribe",
    "/case-simulation-selection",
    "/api/articles/random",
    "/api/specialties",
    "/flashcards"
  ],
  
  ignoredRoutes: [
    "/api/webhook"
  ]
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};