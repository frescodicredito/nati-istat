import type { Metadata } from "next";

import { Footer } from "@/components/layout/Footer";
import { ReadingProgress } from "@/components/layout/ReadingProgress";
import { TopNav } from "@/components/layout/TopNav";
import { mono, sans, serif } from "@/lib/fonts";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "nati-istat",
    template: "%s · nati-istat",
  },
  description:
    "Le proiezioni demografiche ISTAT del tasso di fecondità italiano confrontate con i dati osservati. Track record metodologico, release 2024 e scenari alternativi.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "nati-istat",
    description:
      "Le proiezioni demografiche ISTAT del tasso di fecondità italiano confrontate con i dati osservati.",
    url: "/",
    siteName: "nati-istat",
    locale: "it_IT",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "nati-istat",
    description: "Track record delle proiezioni demografiche ISTAT vs dati osservati.",
  },
  authors: [
    {
      name: "Francesco Di Credico",
      url: "https://www.linkedin.com/in/francescodicredico",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
    >
      <body>
        <ReadingProgress />
        <TopNav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
