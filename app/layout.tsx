import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WR2 Serviços - Soluções Inteligentes em Segurança e Facilities",
  description:
    "A WR2 Serviços une tecnologia avançada e inovação para proteger o seu negócio.",
  icons: {
    icon: [{ url: "/images/logo.png", type: "image/png", sizes: "any" }],
    apple: [{ url: "/images/logo.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: { capable: true, title: "WR2 Serviços" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/images/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/logo.png" />
      </head>
      <body
        className={`${inter.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
