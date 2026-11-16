import type { Metadata } from "next";
import { DM_Sans, Manrope, Marcellus, Pinyon_Script } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

// DM Sans is used at `opsz` 14 everywhere in the design, so the axis is loaded
// here and applied through the .u-dm utility in globals.css.
const dmSans = DM_Sans({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-dm-sans",
  display: "swap",
});

const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-marcellus",
  display: "swap",
});

const pinyon = Pinyon_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pinyon",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Catcus",
  description: "Your space is ready.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${dmSans.variable} ${marcellus.variable} ${pinyon.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
