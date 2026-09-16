import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import CookieConsent from "./components/CookieConsent";

export const metadata: Metadata = {
  metadataBase: new URL("https://management.quicksolve.it"),

  title: {
    default: "QuickSolve Management Network | Management Industriale",
    template: "%s | QuickSolve Management Network",
  },

  description:
    "QuickSolve Management Network mette in contatto aziende e manager qualificati attraverso un sistema sviluppato per individuare rapidamente i profili compatibili con le specifiche esigenze operative di ogni incarico.",

  applicationName: "QuickSolve Management Network",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "https://management.quicksolve.it",
    siteName: "QuickSolve Management Network",
    title: "QuickSolve Management Network | Management Industriale",
    description:
      "Il network italiano del management industriale che mette in contatto aziende e manager qualificati.",
  },

  twitter: {
    card: "summary",
    title: "QuickSolve Management Network | Management Industriale",
    description:
      "Il network italiano del management industriale che mette in contatto aziende e manager qualificati.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it">
      <body>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}