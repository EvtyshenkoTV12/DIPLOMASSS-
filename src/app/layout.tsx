import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "./context/authProvider";
import Providers from "../components/providers";

export const metadata: Metadata = {
  title: "Дипломний проект.",
  description:
    "=-----.",
  openGraph: {
    images: ["https://scale.ac/share.png"],
    type: "website",
    url: "https://scale.ac",
    description:
      "-----.",
    siteName: "------.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AuthProvider>{children}</AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
