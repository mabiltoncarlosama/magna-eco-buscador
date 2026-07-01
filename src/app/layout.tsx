import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Buscador MAGNA-ECO | Tiempo mínimo de rastreo GNSS",
  description:
    "Aplicacion web para buscar estaciones MAGNA-ECO del IGAC, calcular distancias geodesicas con Vincenty (WGS84) y estimar el tiempo minimo de rastreo GNSS segun Resolucion 643/2018.",
  keywords: [
    "MAGNA-ECO",
    "IGAC",
    "GNSS",
    "Vincenty",
    "WGS84",
    "Geodesia",
    "Colombia",
    "Tiempo de rastreo",
  ],
  authors: [{ name: "Proyecto Final Geodesia Geometrica" }],
  openGraph: {
    title: "Buscador MAGNA-ECO | Tiempo minimo de rastreo GNSS",
    description:
      "Calculo de distancias geodesicas y tiempo minimo de rastreo GNSS para estaciones MAGNA-ECO.",
    siteName: "Buscador MAGNA-ECO",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
