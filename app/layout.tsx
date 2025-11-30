import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  weight: "400",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: "ERP",
  description: "ERP System",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
