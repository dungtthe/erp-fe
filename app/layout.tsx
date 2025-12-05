import { AppSidebar } from "@/components/layout/sidebar/app_sidebar";
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";

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
      <body className={`${inter.className} antialiased`}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Header />
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              {children}
              <Toaster richColors position="top-center" />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
