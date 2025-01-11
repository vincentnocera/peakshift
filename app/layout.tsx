import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import ClientRoot from "./ClientRoot";

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
  title: "Peak Shift",
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClerkProvider>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
          <SignedIn>
            <ClientRoot>{children}</ClientRoot>
          </SignedIn>
        </ClerkProvider>
      </body>
    </html>
  );
}
