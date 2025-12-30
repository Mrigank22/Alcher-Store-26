import type { Metadata } from "next";
import { Montserrat, Geist, Bahianita } from "next/font/google";
import "./globals.css";
import SessionWrapper from "./SessionWrapper";

// 1. Montserrat (Gotham-like)
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "900"],
  variable: "--font-gotham",
});

// 2. Geist (tech / clean font)
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

// 3. Bahianita (handwritten / fun font)
const bahianita = Bahianita({
  subsets: ["latin"],
  weight: "400", // Bahianita only has 400
  variable: "--font-bahianita",
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
      <body
        className={`
          ${montserrat.variable}
          ${geist.variable}
          ${bahianita.variable}
          antialiased
        `}
      >
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}
