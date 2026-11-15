import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Pharma News | Dược lâm sàng & Y khoa học thuật",
    template: "%s | Pharma News",
  },
  description:
    "Cập nhật tin tức, kiến thức và góc nhìn học thuật trong lĩnh vực dược lâm sàng.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${inter.variable} ${merriweather.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <Navbar />
        <div className="site-content">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
