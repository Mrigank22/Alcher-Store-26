import type { Metadata } from "next";
import { Montserrat, Geist } from "next/font/google"; // Import fonts
import "./globals.css";
import SessionWrapper from "./SessionWrapper";

// 1. Setup Montserrat (Looks like Gotham)
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "900"], // Regular, SemiBold, Black
 variable: "--font-gotham",
});

// 2. Setup Geist 
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "Alcher Store 2026",
  description: "Official Alcheringa Merchandise",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${geist.variable} antialiased`}>
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}