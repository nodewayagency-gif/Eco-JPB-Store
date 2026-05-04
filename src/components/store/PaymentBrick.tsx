'use client';

import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { useEffect } from 'react';

// Inicializa o SDK com a sua chave pública
initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || '');

interface PaymentBrickProps {
  amount: number;
  onSubmit: (param: any) => Promise<void>;
}

const PaymentBrick = ({ amount, onSubmit }: PaymentBrickProps) => {
  const initialization = {
    amount: amount,
    preferenceId: undefined, // Não necessário para Brick de Pagamento Direto
  };

  const customization = {
    paymentMethods: {
      ticket: "all",
      bankTransfer: "all",
      creditCard: "all",
      debitCard: "all",
      mercadoPago: "all",
    },
  };

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
