'use client';

import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default function Home() {
  // We don't need to check isSignedIn because the layout's <SignedOut> 
  // component already handles redirecting to sign in
  const { isLoaded } = useUser();

  // Wait for the user data to load
  if (!isLoaded) {
    return null;
  }

  // Redirect all users to case simulator selection
  redirect("/case-simulator-selection");
}
