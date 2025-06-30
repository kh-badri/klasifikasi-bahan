// file: app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// 1. Path impor diperbaiki menggunakan alias '@/'
import Navbar from '@/components/Navbar'; 
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FabricAI - Klasifikasi Bahan Pakaian",
  description: "Aplikasi untuk mengklasifikasikan jenis bahan pakaian menggunakan AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Atribut lang="id" sudah benar di sini
    <html lang="id"> 
      {/* 2. Body sekarang membungkus semua elemen yang terlihat */}
      <body className={`${inter.className} flex flex-col min-h-screen bg-background`}>
        <Navbar /> {/* <-- Navbar dipindahkan ke dalam <body> */}
        
        <main className="flex-grow">
          {children}
        </main>
        
        <Footer />
      </body>
    </html>
  );
}