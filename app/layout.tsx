import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "بصيرة",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="rtl">
      <body>
        {children}
      </body>
    </html>
  );
}
