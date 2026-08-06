import { Metadata } from 'next';
import ProvaSocialClient from './ProvaSocialClient';

export const metadata: Metadata = {
  title: 'Prova Social | JPBStoreX',
  description: 'Veja os depoimentos, fotos e vídeos de clientes que já compraram na JPBStoreX.',
  keywords: 'depoimentos, clientes, fotos, avaliações, jpbstorex',
};

export default function ProvaSocial() {
  return <ProvaSocialClient />;
}
