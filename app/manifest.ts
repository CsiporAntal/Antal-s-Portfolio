import { MetadataRoute } from "next";
import { metaData } from "./lib/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: metaData.siteName,
    short_name: "Csantal",
    description: metaData.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#0f172a",
    lang: metaData.language,
    categories: ["portfolio", "technology", "developer"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
