'use client';

import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
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
        const res = await fetch('/api/settings/company/public');
        const data = await res.json();
        if (data.mpPublicKey) {
          initMercadoPago(data.mpPublicKey);
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
  }, [amount, payer]); // Dependências corrigidas para garantir que o payer e amount atualizados sejam usados

  const customization = useMemo(() => ({
    visual: {
      style: {
        theme: "dark",
      },
      texts: {
        formSubmit: "Finalizar Pagamento",
      }
    },
    paymentMethods: {
      creditCard: "all",
      debitCard: "all",
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

  if (!isInitialized) {
    return (
      <div className="animate-pulse bg-secondary/20 rounded-xl h-64 flex items-center justify-center border border-border/50">
        <p className="text-muted-foreground text-sm">Carregando ambiente seguro...</p>
      </div>
    );
  }

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
