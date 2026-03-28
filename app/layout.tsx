import type { Metadata } from "next";
import { AuthProvider } from "@/components/AuthProvider";
import { DM_Sans, Literata, Manrope, Noto_Sans_Tamil, Noto_Serif, Playfair_Display } from "next/font/google";
import "./globals.css";

const notoTamil = Noto_Sans_Tamil({
  subsets: ["tamil", "latin"],
  variable: "--font-noto",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  display: "swap",
});

const literata = Literata({
  subsets: ["latin"],
  variable: "--font-literata",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-noto-serif",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lexifyd — Polysemy Challenge",
  description: "Context-aware Tamil lexical game engine prototype",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ta" className="seren" suppressHydrationWarning>
      <body
        className={`${notoTamil.variable} ${dmSans.variable} ${literata.variable} ${manrope.variable} ${notoSerif.variable} ${playfair.variable} font-sans`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
