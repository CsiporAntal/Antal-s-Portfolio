import type { Metadata } from "next";
import { metaData } from "../lib/config";

export const metadata: Metadata = {
  title: metaData.pages.photos.title,
  description: metaData.pages.photos.description,
  openGraph: {
    title: metaData.pages.photos.title,
    description: metaData.pages.photos.description,
    url: `${metaData.baseUrl}/photos`,
    siteName: metaData.name,
    images: metaData.ogImage,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    title: metaData.pages.photos.title,
    description: metaData.pages.photos.description,
    card: "summary_large_image",
  },
  alternates: {
    canonical: `${metaData.baseUrl}/photos`,
  },
};

export default function PhotosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
