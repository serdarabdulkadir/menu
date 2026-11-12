import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Instrument_Serif, Manrope, Yellowtail } from "next/font/google";
import "./globals.css";

const isans = Instrument_Sans({ variable: "--font-isans", subsets: ["latin", "latin-ext"] });
const iserif = Instrument_Serif({ variable: "--font-iserif", subsets: ["latin", "latin-ext"], weight: "400", style: ["normal", "italic"] });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin", "latin-ext"], weight: ["200", "400"] });
const yellowtail = Yellowtail({ variable: "--font-yellowtail", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Permesso · Menü",
  description: "Permesso Trabzon — caffè · pasticceria · colazione. Dijital menü.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#efe9e0",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${isans.variable} ${iserif.variable} ${manrope.variable} ${yellowtail.variable} antialiased`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
