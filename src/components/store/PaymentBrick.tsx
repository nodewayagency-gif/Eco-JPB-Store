'use client';

import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';
import { useMemo, useState, useEffect } from 'react';

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
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const fetchMpKey = async () => {
      try {
        const directKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || process.env.NEXT_PUBLIC_MP_TEST_PUBLIC_KEY;
        if (directKey) {
          initMercadoPago(directKey, { locale: 'pt-BR' });
          setIsInitialized(true);
          return;
        }

        const res = await fetch('/api/settings/company/public');
        const data = await res.json();
        if (data.mpPublicKey) {
          initMercadoPago(data.mpPublicKey, { locale: 'pt-BR' });
          setIsInitialized(true);
        } else {
          console.error("Chave pública do MP não configurada!");
        }
      } catch (e) {
        console.error("Erro ao buscar chave do MP:", e);
      }
    };
    fetchMpKey();
  }, []);

  const doc = payer?.documents?.[0];

  const initialization = useMemo(() => {
    const cleanDocNumber = doc?.number ? doc.number.replace(/\D/g, '') : undefined;
    return {
      amount: Number(amount.toFixed(2)),
      payer: {
        email: payer?.email || '',
        identification: cleanDocNumber ? {
          type: doc?.type || (cleanDocNumber.length > 11 ? 'CNPJ' : 'CPF'),
          number: cleanDocNumber
        } : undefined
      }
    };
  }, [amount, payer?.email, doc?.type, doc?.number]);

  const customization = useMemo(() => ({
    visual: {
      style: {
        theme: "dark" as const,
      },
      hideFormTitle: true,
      texts: {
        formSubmit: "Finalizar Pagamento com Cartão",
      }
    },
    paymentMethods: {
      minInstallments: 1,
      maxInstallments: 12,
    },
  }), []);

  const handleOnReady = async () => {
    /* Brick de cartão pronto */
  };

  const handleOnError = async (error: any) => {
    console.error('Mercado Pago Card Error:', error);
  };

  if (!isInitialized) {
    return (
      <div className="animate-pulse bg-secondary/20 rounded-xl h-64 flex items-center justify-center border border-border/50">
        <p className="text-muted-foreground text-sm">Carregando ambiente seguro do cartão...</p>
      </div>
    );
  }

  return (
    <div className="bg-card p-4 rounded-2xl border border-border/70 shadow-sm">
      <CardPayment
        initialization={initialization}
        customization={customization}
        onSubmit={async (cardFormData) => {
          await onSubmit({ formData: cardFormData });
        }}
        onReady={handleOnReady}
        onError={handleOnError}
      />
    </div>
  );
};

export default PaymentBrick;
