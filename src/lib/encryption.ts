import crypto from "crypto";
import { getJwtSecret } from "@/lib/auth-utils";

const ALGORITHM = "aes-256-cbc";

const getSecretKey = () => {
  const secret = getJwtSecret();
  return crypto.createHash("sha256").update(String(secret)).digest("base64").substring(0, 32);
};

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(getSecretKey()), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

export function decrypt(encryptedData: string): string {
  try {
    const parts = encryptedData.split(":");
    if (parts.length !== 2) return encryptedData; // Fallback se não estiver no formato criptografado
    
    const iv = Buffer.from(parts[0], "hex");
    const encryptedText = Buffer.from(parts[1], "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(getSecretKey()), iv);
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString("utf8");
  } catch (error) {
    console.error("Erro ao descriptografar dado:", error);
    return encryptedData;
  }
}
