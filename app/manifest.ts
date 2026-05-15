import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Yevora",
    short_name: "Yevora",
    description:
      "A calmer developer workspace for GitHub activity, focus sessions, searchable notes, and weekly momentum.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fbfaf7",
    theme_color: "#dd7a12",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "256x256",
        type: "image/png",
      },
    ],
  };
}
