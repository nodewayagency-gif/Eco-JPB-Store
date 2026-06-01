import { MercadoPagoConfig, Payment } from 'mercadopago';

async function test() {
  const client = new MercadoPagoConfig({ accessToken: 'TEST-1234567890-123456-1234567890abcdef-1234567890' });
  const payment = new Payment(client);
  
  const paymentBody = {
    transaction_amount: 100,
    description: "Pedido Teste",
    installments: 1,
    payment_method_id: "pix",
    payer: {
      email: "test@test.com",
      first_name: "Test",
      identification: {
        type: "CPF",
        number: "12345678909"
      }
    },
    external_reference: "123"
  };

  try {
    console.log("Enviando:", JSON.stringify(paymentBody, null, 2));
    await payment.create({ body: paymentBody });
  } catch (error: any) {
    console.error("Erro capturado:");
    console.error(error.message);
    if (error.cause) console.error("Cause:", error.cause);
  }
}

test();
