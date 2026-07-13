import { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'JPBStoreX | Acessórios e Eletrônicos Premium',
  description: 'A melhor experiência com produtos premium. Especialistas em acessórios e eletrônicos que todo mundo já quis ter.',
  keywords: 'ecommerce, eletrônicos, acessórios premium, jpbstorex',
};

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'JPBStoreX',
    url: 'https://www.jpbstorex.com.br',
    logo: 'https://www.jpbstorex.com.br/logo.png',
    description: 'Especialistas em acessórios e eletrônicos que todo mundo já quis ter.',
    sameAs: [
      // Add social links here if available
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}
