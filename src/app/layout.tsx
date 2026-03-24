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
            <div className="text-center py-0.5 px-2 text-[9px] text-muted-foreground/40 leading-tight select-none">
              <p>Gayatri Vidya Parishad College for Degree And PG Courses</p>
              <p><span className="font-semibold">Team :</span> T. Sai, S. Bhuvana, V. Ravindra, P. Manoj, P. Navadeep, S. Prasanna</p>
              <p><span className="font-semibold">Guided by</span> Mr. Sri T. SriKrishna</p>
            </div>
            <div className="flex-1 flex flex-col min-h-0">{children}</div>
            <Toaster position="top-center" richColors closeButton />
            <ServiceWorkerRegistrar />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
