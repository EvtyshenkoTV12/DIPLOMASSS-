import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "",
  description:
    ".",
  openGraph: {
    images: ["https://scale.ac/share.png"],
    type: "website",
    url: "https://scale.ac/onboard",
    description:
      ".",
    siteName: "",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
