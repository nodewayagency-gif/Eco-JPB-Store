import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "JPB",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0b0b0d",
    theme_color: "#0b0b0d",
    lang: "pt-BR",
    icons: [
      {
        src: "/jpb_sem_fundo_32x32.png",
        sizes: "32x32",
        type: "image/png"
      },
      {
        src: "/jpb_sem_fundo.png",
        sizes: "500x500",
        type: "image/png"
      },
      {
        src: "/jpb_store_qualidade.png",
        sizes: "2048x2048",
        type: "image/png"
      }
    ]
  };
}
