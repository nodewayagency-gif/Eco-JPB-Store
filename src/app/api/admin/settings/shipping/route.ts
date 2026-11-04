import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-utils";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    const isTestMode = process.env.MELHOR_ENVIO_MODE === 'test';
    const hasToken = Boolean(isTestMode ? process.env.MELHOR_ENVIO_TEST_TOKEN : process.env.MELHOR_ENVIO_TOKEN);

    const settings = {
      mercadoLivre: { enabled: false, configured: false },
      melhorEnvio: { 
        enabled: hasToken, 
        sandbox: isTestMode,
        configured: hasToken
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

    return NextResponse.json({ success: true, message: "As configurações são gerenciadas com segurança via arquivo .env" });
  } catch (error: any) {
    console.error("Save shipping settings error:", error);
    return NextResponse.json({ message: "Erro ao salvar configurações" }, { status: 500 });
  }
}
