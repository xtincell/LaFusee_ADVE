import type { Metadata } from "next";
import "@/styles/globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "LaFusée — Industry OS",
  description: "L'infrastructure méthodologique du marché créatif africain",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
