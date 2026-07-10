import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const sans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://quality-function-deployment.lovely-plume-6281.chatgpt.site"),
  title: "QFD Studio | Interactive House of Quality",
  description: "Build an interactive House of Quality and translate customer needs into measurable, ranked technical priorities.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "QFD Studio",
    description: "Turn customer needs into clear design priorities.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "QFD Studio interactive House of Quality" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${sans.variable} ${mono.variable}`}>{children}</body></html>;
}
