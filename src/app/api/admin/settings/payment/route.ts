import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";

export async function GET() {
  try {
    const configs = await prisma.paymentGatewayConfig.findMany();
    
    const settings = {
      mercadoPago: configs.find(c => c.provider === 'MERCADO_PAGO') || { enabled: false, publicKey: '', accessToken: '', webhookSecret: '' },
      asaas: configs.find(c => c.provider === 'ASAAS') || { enabled: false, apiKey: '', walletId: '', webhookSecret: '' }
    };

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("Get payment settings error:", error);
    return NextResponse.json({ message: "Erro ao buscar configurações" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const authUser = await getAuthUser();

    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    const data = await request.json();
    
    // Mercado Pago
    await prisma.paymentGatewayConfig.upsert({
      where: { provider: 'MERCADO_PAGO' },
      update: {
        enabled: data.mercadoPago.enabled,
        publicKey: data.mercadoPago.publicKey,
        accessToken: data.mercadoPago.accessToken,
        webhookSecret: data.mercadoPago.webhookSecret
      },
      create: {
        provider: 'MERCADO_PAGO',
        enabled: data.mercadoPago.enabled,
        publicKey: data.mercadoPago.publicKey,
        accessToken: data.mercadoPago.accessToken,
        webhookSecret: data.mercadoPago.webhookSecret
      }
    });

    // Asaas
    await prisma.paymentGatewayConfig.upsert({
      where: { provider: 'ASAAS' },
      update: {
        enabled: data.asaas.enabled,
        apiKey: data.asaas.apiKey,
        walletId: data.asaas.walletId,
        webhookSecret: data.asaas.webhookSecret
      },
      create: {
        provider: 'ASAAS',
        enabled: data.asaas.enabled,
        apiKey: data.asaas.apiKey,
        walletId: data.asaas.walletId,
        webhookSecret: data.asaas.webhookSecret
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Save payment settings error:", error);
    return NextResponse.json({ message: "Erro ao salvar configurações" }, { status: 500 });
  }
}
