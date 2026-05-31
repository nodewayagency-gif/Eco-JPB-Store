import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let mpPublicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || "";
    
    if (process.env.MP_MODE === 'test') {
      mpPublicKey = process.env.NEXT_PUBLIC_MP_TEST_PUBLIC_KEY || mpPublicKey;
    }

    return NextResponse.json({
      mpPublicKey
    });
  } catch (error) {
    console.error("Erro ao buscar config publica:", error);
    return NextResponse.json({ message: "Erro interno" }, { status: 500 });
  }
}
