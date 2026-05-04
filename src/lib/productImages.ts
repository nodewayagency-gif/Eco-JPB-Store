import heroHeadphones from "@/assets/hero-headphones.png";
import productEarbuds from "@/assets/product-earbuds.png";
import productSpeaker from "@/assets/product-speaker.png";
import productWatch from "@/assets/product-watch.png";
import productHeadphonesWhite from "@/assets/product-headphones-white.png";

export const productImages: Record<string, string> = {
  "hero-headphones": (heroHeadphones as any).src || heroHeadphones,
  "product-earbuds": (productEarbuds as any).src || productEarbuds,
  "product-speaker": (productSpeaker as any).src || productSpeaker,
  "product-watch": (productWatch as any).src || productWatch,
  "product-headphones-white": (productHeadphonesWhite as any).src || productHeadphonesWhite,
};
