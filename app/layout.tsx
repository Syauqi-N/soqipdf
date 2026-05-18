import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SoqiPDF - Free PDF Tools Online",
  description: "Convert, merge, split, and compress PDF files for free. Fast, secure, and easy to use PDF tools.",
  keywords: ["PDF", "converter", "merge", "split", "compress", "PDF to image", "PDF to Word"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
