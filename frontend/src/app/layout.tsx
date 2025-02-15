// app/layout.tsx or app/RootLayout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Import your navigation bar (client component)
import NavigationBar from "@/components/NavigationBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wildfire Monitoring Dashboard",
  description: "Dashboard for monitoring wildfires",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex`}
      >
        {/* Navigation bar rendered once for all pages */}
        <NavigationBar />

        {/* Main Content Area */}
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
