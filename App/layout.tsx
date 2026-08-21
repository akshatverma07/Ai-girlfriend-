import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Apinya — AI Companion",
  description: "Private AI companion starter",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}