'use client';

import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default function Home() {
  // We don't need to check isSignedIn because the layout's <SignedOut> 
  // component already handles redirecting to sign in
  const { isLoaded, user } = useUser();

  // Wait for the user data to load
  if (!isLoaded) {
    return null;
  }

  // Check user role and redirect accordingly
  if (user?.publicMetadata?.role === "therapist") {
    redirect("/therapy-tutorials");
  } else {
    redirect("/case-simulator-selection");
  }
}
