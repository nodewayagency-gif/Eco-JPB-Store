import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";
import { encrypt, decrypt } from "@/lib/encryption";

export async function GET() {
  try {
    const isTestMode = process.env.MELHOR_ENVIO_MODE === 'test';
    const settings = {
      mercadoLivre: { enabled: false, appId: '', clientSecret: '', accessToken: '' },
      melhorEnvio: { 
        enabled: !!(process.env.MELHOR_ENVIO_TOKEN || process.env.MELHOR_ENVIO_TEST_TOKEN), 
        clientId: '', 
        clientSecret: '', 
        accessToken: isTestMode ? process.env.MELHOR_ENVIO_TEST_TOKEN : process.env.MELHOR_ENVIO_TOKEN, 
        tokenType: 'Bearer', 
        sandbox: isTestMode 
      }
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

    // Now handled via .env, we just return success to not break the frontend form
    return NextResponse.json({ success: true, message: "As configurações agora são gerenciadas via arquivo .env" });
  } catch (error: any) {
    console.error("Save shipping settings error:", error);
    return NextResponse.json({ message: "Erro ao salvar configurações" }, { status: 500 });
  }
}
