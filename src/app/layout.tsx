import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "GOOD STYLE | E-Commerce Premium Streetwear Argentina",
  description: "Tienda de indumentaria masculina urbana y streetwear moderno para todo Argentina. Jeans, Remeras Oversize, Buzos Heavyweight y Accesorios. Calidad y estilo al mejor precio.",
  metadataBase: new URL("https://goodstyle.com.ar"),
  openGraph: {
    title: "GOOD STYLE | E-Commerce Premium Streetwear",
    description: "Indumentaria masculina urbana y streetwear moderno en Argentina. Envíos a todo el país.",
    type: "website",
    locale: "es_AR",
    siteName: "GOOD STYLE"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
