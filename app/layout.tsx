import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/components/AppContext";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import HrmChatbot from "@/components/HrmChatbot";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WorkPulse | Enterprise Geolocation HRM Platform",
  description: "Enterprise Human Resource Management featuring RBAC, live GPS clock-in/out, privacy-safe last-known location logs, and interactive staff radar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body className="font-sans antialiased text-slate-800 bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900 min-h-screen flex">
        <AppProvider>
          {/* Persistent Left Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-slate-50 min-h-screen">
            {/* Top Bar */}
            <Navbar />

            {/* Dynamic Workspace Container */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
              {children}
            </main>

            <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
              <p>WorkPulse • Enterprise Geolocation & Privacy-Preserving Shift Management System</p>
            </footer>
          </div>

          {/* Context-Aware Floating AI Assistant Chatbot */}
          <HrmChatbot />
        </AppProvider>
      </body>
    </html>
  );
}
