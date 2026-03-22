import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/lib/i18n/context";
import { Toaster } from "sonner";
import { ServiceWorkerRegistrar } from "@/components/sw-registrar";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Workpin — Find work. Hire help. Nearby.",
  description: "A location-based platform connecting workers and clients.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Workpin",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider>
            {children}
            <Toaster position="top-center" richColors closeButton />
            <ServiceWorkerRegistrar />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
