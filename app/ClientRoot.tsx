"use client";

import {
  UserButton,
  ClerkLoaded,
  ClerkLoading,
} from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { ThemeChanger } from "@/components/ui/theme-changer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Home } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ClerkLoading>
        <div className="h-screen w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
          <span className="ml-3 text-muted-foreground">Loading Clerk...</span>
        </div>
      </ClerkLoading>

      <ClerkLoaded>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SidebarProvider defaultOpen={false}>
            <AppSidebar />
            <SidebarInset>
              <div className="relative min-h-screen">
                <header className="w-full flex items-center justify-between py-1.5 px-3 sticky top-0 bg-background z-10">
                  <div className="flex items-center gap-1">
                    <UserButton />
                    <Button variant="ghost" size="icon" asChild>
                      <Link href="/" aria-label="Home">
                        <Home className="h-[1.2rem] w-[1.2rem]" />
                      </Link>
                    </Button>
                  </div>
                  <ThemeChanger />
                </header>
                {children}
              </div>
            </SidebarInset>
            <div className="fixed bottom-4 left-4 z-50">
              <SidebarTrigger />
            </div>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </ClerkLoaded>
    </>
  );
}
