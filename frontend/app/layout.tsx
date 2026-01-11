import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import favicon from "../app/faviconr.ico";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { PWADiagnostics } from "@/components/PWADiagnostics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Русский",
  description: "Application pour apprendre le vocabulaire russe",
  manifest: "/manifest.json",
  themeColor: "#4ade80",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AppLingua",
  },
  icons: {
    icon: favicon.src,
    apple: favicon.src,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <ServiceWorkerRegistration />
        <PWADiagnostics />
      </body>
    </html>
  );
}
