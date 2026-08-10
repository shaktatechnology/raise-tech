import type { Metadata } from "next";
import { Inter, Carattere } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import TopBar from "@/components/layout/TopBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const carattere = Carattere({
  weight: "400",
  variable: "--font-carattere",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Raise Tech Pvt. Ltd. | Always Deliver More Than Expected",
  description: "Empower your business with Raise Tech. We build secure, scalable, and user-friendly web, mobile, desktop software, and paper roll e-commerce solutions tailored to your enterprise needs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${carattere.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-[#404040]">
        <Providers>
          <TopBar />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
