import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";
import { encrypt, decrypt } from "@/lib/encryption";

export async function GET() {
  try {
    const isTestMode = process.env.MP_MODE === 'test';
    const settings = {
      mercadoPago: { 
        enabled: !!(process.env.MP_ACCESS_TOKEN || process.env.MP_TEST_ACCESS_TOKEN), 
        publicKey: isTestMode ? process.env.NEXT_PUBLIC_MP_TEST_PUBLIC_KEY : process.env.NEXT_PUBLIC_MP_PUBLIC_KEY, 
        accessToken: isTestMode ? process.env.MP_TEST_ACCESS_TOKEN : process.env.MP_ACCESS_TOKEN, 
        webhookSecret: isTestMode ? process.env.MP_TEST_WEBHOOK_SECRET : process.env.MP_WEBHOOK_SECRET,
        mode: process.env.MP_MODE || 'production'
      },
      asaas: { enabled: false, apiKey: '', walletId: '', webhookSecret: '' }
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

    // Now handled via .env, we just return success to not break the frontend form
    return NextResponse.json({ success: true, message: "As configurações agora são gerenciadas via arquivo .env" });
  } catch (error: any) {
    console.error("Save payment settings error:", error);
    return NextResponse.json({ message: "Erro ao salvar configurações" }, { status: 500 });
  }
}
