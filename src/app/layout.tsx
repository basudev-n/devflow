import type { Metadata } from "next";
import { CRMProvider } from "@/lib/crm-context";
import { ThemeProvider } from "@/lib/theme-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevFlow CRM - Real Estate Development Management",
  description: "A comprehensive CRM for real estate developers to manage projects, leads, inventory, and finances.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <CRMProvider>{children}</CRMProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
