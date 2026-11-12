import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Every page reads the auth cookie, so never prerender at build time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Will It Fit? Furniture moving simulator",
  description:
    "Enter your doorway, hallway and room measurements, then drag your furniture through a to-scale floor plan to see if it fits before moving day.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} min-h-screen font-sans antialiased`}
      >
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
