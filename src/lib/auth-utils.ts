import { headers } from "next/headers";
import jwt from "jsonwebtoken";

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("A variável de ambiente JWT_SECRET não está configurada.");
  }
  return secret;
}

export async function getAuthUser() {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as { sub: string; role: string; email: string };
    return decoded;
  } catch (error) {
    return null;
  }
}
