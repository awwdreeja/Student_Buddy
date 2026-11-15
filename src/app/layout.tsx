import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Student Buddy 2.0",
  description: "Your personal study and productivity companion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}