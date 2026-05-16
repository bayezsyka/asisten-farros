import { env } from "./env.js";

export const BOT_IDENTITY = {
  name: env.WHATSAPP_BOT_NAME,
  botPhone: env.BOT_WA_NUMBER,
  ownerPhone: env.OWNER_WA_NUMBER,
  ownerName: env.OWNER_DISPLAY_NAME,
};

export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    return "62" + digits.substring(1);
  }
  if (!digits.startsWith("62") && digits.length >= 9) {
     return "62" + digits;
  }
  return digits;
}

export function extractPhoneFromJid(jid: string): string {
  if (!jid) return "";
  if (jid.includes("@lid")) {
    return jid.split("@")[0];
  }
  return normalizePhone(jid.split("@")[0].split(":")[0]);
}

export function isOwnerPhone(phone: string): boolean {
  return normalizePhone(phone) === normalizePhone(BOT_IDENTITY.ownerPhone);
}

export function isOwnerJid(jid: string): boolean {
  if (!jid) return false;
  // If it's a LID, we can't directly check owner phone from it usually, 
  // but if the owner phone happens to match LID (unlikely), it might work.
  // Real check for LID should be done by looking up linked phone from DB.
  // Here we just do basic check.
  const phone = extractPhoneFromJid(jid);
  return isOwnerPhone(phone);
}
