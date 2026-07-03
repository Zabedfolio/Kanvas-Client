import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kanvas | 2-in-1 Kanban & Image Annotation Tool",
  description: "A precision workspace combining a date-based Kanban task manager and a polygon image-annotation tool.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full dark`}
    >
      <body className="min-h-full bg-bg-primary text-text-primary font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
