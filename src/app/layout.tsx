import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "KUL · Mi día",
  description: "Menos caos. Más ventas.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
