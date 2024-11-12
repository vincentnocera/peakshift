'use client';

import { useUser } from '@clerk/clerk-react';
import { redirect } from 'next/navigation';

const Home = () => {
  const { isLoaded, isSignedIn, user } = useUser();

  // Wait for the user data to load
  if (!isLoaded) {
    return null; // or a loading spinner
  }

  // Check if user is signed in
  if (!isSignedIn) {
    redirect('/sign-in');
  }

  // Now we can safely access user properties
  console.log('User ID:', user?.id);
  console.log('User Role:', user?.publicMetadata?.role);

  if (user?.publicMetadata?.role === "therapist") {
    redirect("/therapy-tutorials");
  } else {
    redirect("/case-simulator-selection");
  }
};

export default Home;
