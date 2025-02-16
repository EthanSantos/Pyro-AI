// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

import NavigationBar from "@/components/NavigationBar";

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
      <body className="antialiased flex">
        <NavigationBar />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
