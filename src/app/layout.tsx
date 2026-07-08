import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SIAGRI - Sistem Informasi Agribisnis",
    template: "%s | SIAGRI",
  },
  description:
    "Sistem Informasi Agribisnis (SIAGRI) - Platform pengelolaan data pertanian terintegrasi dari tingkat desa hingga provinsi.",
  keywords: ["agribisnis", "pertanian", "sistem informasi", "SIAGRI", "kelompok tani"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={poppins.variable}>
      <body className={poppins.className} suppressHydrationWarning>
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}

