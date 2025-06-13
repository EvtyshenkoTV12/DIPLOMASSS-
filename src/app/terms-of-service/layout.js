export const metadata = {
  title: "Проект диплому",
  description:
    "-----.",
  openGraph: {
    images: ["https://scale.ac/share.png"],
    type: "website",
    url: "https://scale.ac/terms-of-service",
    description:
      "-----.",
      siteName: "Дипломний проект.",
  },
};

export default function Layout({ children }) {
  return (
    <>
      <main>{children}</main>
    </>
  );
}