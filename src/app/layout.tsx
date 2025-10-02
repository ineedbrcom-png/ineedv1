
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ClientProviders } from "./client-providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "iNeed - Peça o que você precisa",
  description:
    "Conectamos quem precisa com quem pode oferecer. Seguro, rápido e confiável!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased bg-gray-50`}>
        <ClientProviders>
          <Header />
          <main className="pb-20 md:pb-0">{children}</main>
          <Footer />
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  );
}
