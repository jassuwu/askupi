import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "~/app/globals.css";
import { env } from "~/env";
import { ThemeProvider, Footer } from "~/components";
import { Toaster } from "~/components/ui/sonner";
import { ChatProvider } from "~/lib/ChatContext";

export const experimental_ppr = true;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_HOSTED_URL),
  title: "AskUPI",
  description: "talk to your UPI history statement with AI",
  generator: "Next.js",
  openGraph: {
    type: "website",
    title: "AskUPI",
    description: "talk to your UPI history statement with AI",
    url: env.NEXT_PUBLIC_HOSTED_URL,
    images: [
      {
        url: "/opengraph.png",
        width: 1200,
        height: 630,
        alt: "AskUPI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AskUPI",
    description: "talk to your UPI history statement with AI",
    images: ["/opengraph.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "var(--background)",
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen w-full flex-col font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ChatProvider>
            <div className="w-full flex-grow">{children}</div>
          </ChatProvider>
          <Footer />
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
