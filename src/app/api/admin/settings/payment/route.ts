import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-utils";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    const isTestMode = process.env.MP_MODE === 'test';
    const hasToken = Boolean(isTestMode ? process.env.MP_TEST_ACCESS_TOKEN : process.env.MP_ACCESS_TOKEN);
    const publicKey = isTestMode ? process.env.NEXT_PUBLIC_MP_TEST_PUBLIC_KEY : process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;

    const settings = {
      mercadoPago: {
        enabled: hasToken,
        publicKey: publicKey || '',
        testMode: isTestMode,
        configured: hasToken
      }
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

    return NextResponse.json({ success: true, message: "As configurações são gerenciadas com segurança via arquivo .env" });
  } catch (error: any) {
    console.error("Save payment settings error:", error);
    return NextResponse.json({ message: "Erro ao salvar configurações" }, { status: 500 });
  }
}
