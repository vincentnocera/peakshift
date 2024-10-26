import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { ThemeChanger } from "@/components/ui/theme-changer";
import { ClerkProvider, SignedIn, SignedOut, UserButton, RedirectToSignIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Two Sigma Learning",
  description: "Learn medicine effectively with AI",
  icons: {
    icon: "./favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="relative min-h-screen">
            <header className="absolute top-0 right-0 p-4">
              <ThemeChanger />
            </header>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
            <SignedIn>
              {/* Changed from absolute positioning to a full-width header */}
              <div className="w-full flex items-center p-4">
                {/* User button on the left */}
                <UserButton appearance={{
                  elements: {
                    button: "mr-4"  // Added margin-right to create space between UserButton and navigation
                  }
                }}/>
                {/* Navigation links on the right */}
                <div className="flex">
                  <Button variant="ghost" asChild>
                    <Link href="/">Home</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/flashcards">Flashcards</Link>
                  </Button>
                </div>
              </div>
              <main>{children}</main>
            </SignedIn>
          </div>
        </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
