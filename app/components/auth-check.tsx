'use client';

import { SignedIn, SignedOut, UserButton, RedirectToSignIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home } from "lucide-react";
import { ThemeChanger } from "@/components/ui/theme-changer";

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <header className="w-full flex items-center justify-between py-1.5 px-3 sticky top-0 bg-background z-10">
        <div className="flex items-center gap-1">
          <UserButton afterSignOutUrl="/" />
          <Button variant="ghost" size="icon" asChild>
            <Link href="/" aria-label="Home">
              <Home className="h-[1.2rem] w-[1.2rem]" />
            </Link>
          </Button>
        </div>
        <ThemeChanger />
      </header>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <SignedIn>
        {children}
      </SignedIn>
    </div>
  );
} 