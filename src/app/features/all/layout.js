export const metadata = {
  title: "------",
  description:
    "----------.",
  openGraph: {
    images: ["https://scale.ac/share.png"],
    type: "website",
    url: "https://scale.ac/features/all",
    description:
      "---------",
    siteName: "--------",
  },
  twitter: {
    card: "summary_large_image",
    title: "-------",
    description:
      "------.",
    images: ["https://scale.ac/share.png"],
    site: "@scaleapp",
  },
};

export default function Layout({ children }) {
  return (
    <>
      <main>{children}</main>
    </>
  );
}
