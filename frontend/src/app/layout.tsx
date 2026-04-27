import { SessionProvider } from "next-auth/react";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "City Wallet — Hyper-Personalized Offers",
  description:
    "AI-powered, location-aware merchant offers delivered to your digital wallet in real-time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
