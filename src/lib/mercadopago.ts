import { MercadoPagoConfig, Preference } from 'mercadopago';
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";

export async function getMpClient() {
  let accessToken = process.env.MP_ACCESS_TOKEN || '';
  
  if (process.env.MP_MODE === 'test') {
    accessToken = process.env.MP_TEST_ACCESS_TOKEN || accessToken;
  }

  if (!accessToken) {
    console.warn('Mercado Pago Access Token não está configurado!');
  }

  return new MercadoPagoConfig({
    accessToken: accessToken,
    options: { timeout: 5000 }
  });
}

export async function getMpPreference() {
  const client = await getMpClient();
  return new Preference(client);
}
