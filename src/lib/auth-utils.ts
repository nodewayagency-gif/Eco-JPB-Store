import { headers } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'premium-electronics-secret-key-2024';

export async function getAuthUser() {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; role: string; email: string };
    return decoded;
  } catch (error) {
    return null;
  }
}
