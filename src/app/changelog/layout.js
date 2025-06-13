export const metadata = {
  title: "----",
  description: "-----",
  openGraph: {
    images: ["https://scale.ac/share.png"],
    type: "website",
    url: "https://scale.ac/contact",
    description: "--------",
    siteName: "Scale - Changelog.",
  },
};

export default function Layout({ children }) {
  return (
    <>
      <main>{children}</main>
    </>
  );
}
