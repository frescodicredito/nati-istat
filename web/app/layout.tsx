import type { Metadata } from "next";

import { Footer } from "@/components/layout/Footer";
import { ReadingProgress } from "@/components/layout/ReadingProgress";
import { TopNav } from "@/components/layout/TopNav";
import { mono, sans, serif } from "@/lib/fonts";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "TFT Italia · proiezioni vs dato osservato",
    template: "%s · TFT Italia",
  },
  description:
    "Le proiezioni demografiche del tasso di fecondità totale italiano confrontate con i dati osservati 1952-2024. Track record metodologico, backtest empirico e scenari alternativi.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "TFT Italia · proiezioni vs dato osservato",
    description:
      "Le proiezioni demografiche del tasso di fecondità totale italiano confrontate con i dati osservati.",
    url: "/",
    siteName: "TFT Italia",
    locale: "it_IT",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "TFT Italia · proiezioni vs dato osservato",
    description: "Track record delle proiezioni demografiche TFT vs dati osservati.",
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
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <ReadingProgress />
        <TopNav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
