import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JinjaSS Voting Portal",
  description: "School Election Voting Portal",
  icons: {
    icon: "/badge.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-light">
        {children}
      </body>
    </html>
  );
}