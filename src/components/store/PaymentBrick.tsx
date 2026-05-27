'use client';

import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { useMemo } from 'react';

// Inicializa o SDK com a sua chave pública
initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || '');

interface PaymentBrickProps {
  amount: number;
  onSubmit: (param: any) => Promise<void>;
  payer?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    documents?: {
      type: string;
      number: string;
    }[];
    address?: {
      zipCode?: string;
      federalUnit?: string;
      city?: string;
      neighborhood?: string;
      streetName?: string;
      streetNumber?: string;
      complement?: string;
    };
  };
}

const PaymentBrick = ({ amount, onSubmit, payer }: PaymentBrickProps) => {
  const initialization = useMemo(() => {
    // Remove campos vazios que causam erro silencioso {} no SDK
    const cleanPayer = payer ? JSON.parse(JSON.stringify(payer, (key, value) => {
      if (value === "" || value === null) return undefined;
      return value;
    })) : undefined;

    if (cleanPayer?.address && Object.keys(cleanPayer.address).length === 0) {
      delete cleanPayer.address;
    }

    const initData: any = {
      amount: amount,
    };
    
    if (cleanPayer && Object.keys(cleanPayer).length > 0) {
      initData.payer = cleanPayer;
    }

    return initData;
  }, []); // Memoizado para não reinstanciar o Brick em re-renders

  const customization = useMemo(() => ({
    paymentMethods: {
      ticket: "all",
      bankTransfer: "all",
      creditCard: "all",
      debitCard: "all",
      mercadoPago: "all",
    },
  }), []);

  const handleOnReady = async () => {
    /*
      Callback chamado quando o Brick estiver pronto.
      Aqui você pode ocultar loadings do seu site, por exemplo.
    */
  };

  const handleOnError = async (error: any) => {
    // Callback chamado para qualquer erro no Brick
    console.error('Mercado Pago Brick Error:', error);
  };

  return (
    <div className="bg-card p-4 rounded-2xl border border-border">
      <Payment
        initialization={initialization}
        customization={customization as any}
        onSubmit={onSubmit}
        onReady={handleOnReady}
        onError={handleOnError}
      />
    </div>
  );
};

export default PaymentBrick;
