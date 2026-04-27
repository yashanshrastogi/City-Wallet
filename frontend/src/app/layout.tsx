import { SessionProvider } from "next-auth/react";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "City Wallet — AI-Powered Offers",
  description: "Hyper-personalized, location-aware merchant offers delivered to your digital wallet in real-time.",
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💳</text></svg>" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
