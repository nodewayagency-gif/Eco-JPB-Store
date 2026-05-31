import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
// Usaremos o JWT_SECRET como chave (deve ter 32 caracteres para aes-256-cbc)
// Faremos um hash sha256 dele para garantir que tem o tamanho correto.
const getSecretKey = () => {
  const secret = process.env.JWT_SECRET || "default_unsafe_secret_key_change_me_in_prod";
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
    return encryptedData; // Retorna original se falhar a decriptação
  }
}
