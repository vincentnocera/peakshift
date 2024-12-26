import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { ThemeChanger } from "@/components/ui/theme-changer";
import { ClerkProvider, SignedIn, SignedOut, UserButton, RedirectToSignIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Toaster } from "@/components/ui/toaster"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

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
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <div className="relative min-h-screen">
                  <header className="w-full flex items-center justify-between py-1.5 px-3 sticky top-0 bg-background z-10">
                    <div className="flex items-center gap-1" >
                      <UserButton />
                      <Button variant="ghost" asChild>
                        <Link href="/">Home</Link>
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
              </SidebarInset>
              <div className="fixed bottom-4 left-4 z-50">
                <SidebarTrigger />
              </div>
            </SidebarProvider>
          </ThemeProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
