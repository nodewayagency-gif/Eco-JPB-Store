import { MercadoPagoConfig, Preference } from 'mercadopago';

if (!process.env.MP_ACCESS_TOKEN) {
  console.warn('MP_ACCESS_TOKEN is not defined in .env');
}

export const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
  options: { timeout: 5000 }
});

export const mpPreference = new Preference(mpClient);
