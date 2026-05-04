import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";

export async function GET() {
  try {
    const configs = await prisma.shippingIntegrationConfig.findMany();
    
    const settings = {
      mercadoLivre: configs.find(c => c.provider === 'MERCADO_LIVRE') || { enabled: false, appId: '', clientSecret: '', accessToken: '' },
      melhorEnvio: configs.find(c => c.provider === 'MELHOR_ENVIO') || { enabled: false, clientId: '', clientSecret: '', accessToken: '', tokenType: 'Bearer', sandbox: true }
    };

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("Get shipping settings error:", error);
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
    
    // Mercado Livre
    await prisma.shippingIntegrationConfig.upsert({
      where: { provider: 'MERCADO_LIVRE' },
      update: {
        enabled: data.mercadoLivre.enabled,
        appId: data.mercadoLivre.appId,
        clientSecret: data.mercadoLivre.clientSecret,
        accessToken: data.mercadoLivre.accessToken
      },
      create: {
        provider: 'MERCADO_LIVRE',
        enabled: data.mercadoLivre.enabled,
        appId: data.mercadoLivre.appId,
        clientSecret: data.mercadoLivre.clientSecret,
        accessToken: data.mercadoLivre.accessToken
      }
    });

    // Melhor Envio
    await prisma.shippingIntegrationConfig.upsert({
      where: { provider: 'MELHOR_ENVIO' },
      update: {
        enabled: data.melhorEnvio.enabled,
        clientId: data.melhorEnvio.clientId,
        clientSecret: data.melhorEnvio.clientSecret,
        accessToken: data.melhorEnvio.accessToken,
        tokenType: data.melhorEnvio.tokenType || 'Bearer',
        sandbox: data.melhorEnvio.sandbox
      },
      create: {
        provider: 'MELHOR_ENVIO',
        enabled: data.melhorEnvio.enabled,
        clientId: data.melhorEnvio.clientId,
        clientSecret: data.melhorEnvio.clientSecret,
        accessToken: data.melhorEnvio.accessToken,
        tokenType: data.melhorEnvio.tokenType || 'Bearer',
        sandbox: data.melhorEnvio.sandbox
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Save shipping settings error:", error);
    return NextResponse.json({ message: "Erro ao salvar configurações" }, { status: 500 });
  }
}
