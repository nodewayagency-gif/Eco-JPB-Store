import { productImages } from "./productImages";

export const resolveProductImage = (image?: string | null, images?: string[]) => {
  if (!image) {
    if (images && images.length > 0) {
      image = images[0];
    } else {
      return null;
    }
  }

  if (image.startsWith('http')) {
    return image;
  }

  // Try mock mapping
  if (productImages[image]) {
    return productImages[image];
  }

  // If it's a relative path starting with /
  if (image.startsWith('/')) {
    return image;
  }

  // Handle Supabase shorthand if stored without full URL (unlikely but possible)
  if (image.includes('jpb_products/')) {
    return `https://oxpnlbldyxjrgbuicttx.supabase.co/storage/v1/object/public/${image}`;
  }

  return image;
};
