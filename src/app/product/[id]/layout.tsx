import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    return {
      title: 'Produto não encontrado | JPBStoreX',
    };
  }

  const baseUrl = 'https://www.jpbstorex.com.br';
  const imageUrl = product.image ? (product.image.startsWith('http') ? product.image : `${baseUrl}${product.image}`) : `${baseUrl}/logo.png`;

  return {
    title: `${product.name} | JPBStoreX`,
    description: product.description.substring(0, 160),
    openGraph: {
      title: `${product.name} | JPBStoreX`,
      description: product.description.substring(0, 160),
      url: `${baseUrl}/product/${id}`,
      siteName: 'JPBStoreX',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
      locale: 'pt_BR',
      type: 'website',
    },
  };
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
