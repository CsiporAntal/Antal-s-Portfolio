import type { Metadata } from "next";
import { metaData } from "../lib/config";

export const metadata: Metadata = {
  title: metaData.pages.projects.title,
  description: metaData.pages.projects.description,
  openGraph: {
    title: metaData.pages.projects.title,
    description: metaData.pages.projects.description,
    url: `${metaData.baseUrl}/projects`,
    siteName: metaData.name,
    images: metaData.ogImage,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    title: metaData.pages.projects.title,
    description: metaData.pages.projects.description,
    card: "summary_large_image",
  },
  alternates: {
    canonical: `${metaData.baseUrl}/projects`,
  },
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
