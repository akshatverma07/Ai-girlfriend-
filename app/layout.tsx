import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Apinya — AI Companion",
  description: "Private AI companion starter",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}
<script dangerouslySetInnerHTML={{ __html: "if (typeof window !== 'undefined' && 'serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW reg failed', err)); }); }" }} />
</body>
    </html>
  );
}