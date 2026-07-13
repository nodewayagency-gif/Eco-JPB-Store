import { Metadata } from 'next';
import ProductClient from './ProductClient';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    return {
      title: 'Produto não encontrado | JPBStoreX',
    };
  }

  const imageUrl = product.image?.startsWith('http') ? product.image : `https://www.jpbstorex.com.br${product.image}`;

  return {
    title: `${product.name} | JPBStoreX`,
    description: product.description.substring(0, 160),
    openGraph: {
      title: `${product.name} | JPBStoreX`,
      description: product.description.substring(0, 160),
      url: `https://www.jpbstorex.com.br/product/${product.id}`,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description.substring(0, 160),
      images: [imageUrl],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      image: true,
      rating: true,
      reviews: true,
      inStock: true,
    }
  });

  if (!product) {
    notFound();
  }

  const imageUrl = product.image?.startsWith('http') ? product.image : `https://www.jpbstorex.com.br${product.image}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: imageUrl,
    description: product.description,
    offers: {
      '@type': 'Offer',
      url: `https://www.jpbstorex.com.br/product/${product.id}`,
      priceCurrency: 'BRL',
      price: product.price,
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviews.length > 0 ? product.reviews.length : 1,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductClient />
    </>
  );
}
