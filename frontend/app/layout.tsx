import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "NexusOS — AI Operating System for Innovation Ecosystems",
  description: "Automating ecosystem linkages through multi-agent AI orchestration, relationship intelligence, and ecosystem memory.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg-primary text-slate-200 antialiased">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto relative">
            <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
            <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
            <div className="relative z-10">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
