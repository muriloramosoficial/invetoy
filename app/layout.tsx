import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "INVENTOY — Gestao de Patrimonio Inteligente",
  description:
    "Sistema de gestão de patrimonio multi-tenant para empresas. Dashboard, analytics, API REST e controle de patrimonio em tempo real.",
  keywords: ["inventário", "patrimonio", "gestão", "SaaS", "inventory management"],
  authors: [{ name: "INVENTOY" }],
};

export const viewport: Viewport = {
  themeColor: "#121212",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem("invetoy-theme")||(matchMedia("(prefers-color-scheme:light)").matches?"light":"dark");document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`
        }} />
      </head>
      <body className="h-full bg-bg-primary text-text-primary font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
