import type { Metadata } from "next";
import { Inter, Barlow, Quicksand } from "next/font/google";
import { Header } from "@/components/layout";
import ClientProviders from "@/components/providers/ClientProviders";

import "./globals.css";
import { Footer, AuthLoader } from "@/components/ui";
import GlobalNotification from "@/components/ui/global-notification";
import GlobalLoadingOverlay from "@/components/ui/global-loading-overlay";
import { NotificationContainer } from "@/components/ui/notification";
// import WebSocketDebug from "@/components/ui/websocket-debug";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EdgeAi Realty - AI-Powered Real Estate Solutions",
  description: "Transform your real estate business with cutting-edge AI technology. Discover properties, analyze markets, and make smarter decisions.",
  keywords: ["real estate", "AI", "property", "market analysis", "EdgeAi"],
  authors: [{ name: "EdgeAi Realty" }],
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.ico', type: 'image/x-icon' }
    ],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: "EdgeAi Realty - AI-Powered Real Estate Solutions",
    description: "Transform your real estate business with cutting-edge AI technology.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "EdgeAi Realty - AI-Powered Real Estate Solutions",
    description: "Transform your real estate business with cutting-edge AI technology.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${barlow.variable} ${quicksand.variable} font-sans antialiased min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50`}
        suppressHydrationWarning={true}
      >
        <ClientProviders>
          <AuthLoader>
            <Header />
            <main className="pt-16 lg:pt-20">
              {children}
            </main>
            <Footer />
            <GlobalNotification />
            <GlobalLoadingOverlay />
            <NotificationContainer />
            {/* <WebSocketDebug /> */}
          </AuthLoader>
        </ClientProviders>
      </body>
    </html>
  );
}
