import { MessageContext } from "../../infra/whatsapp/whatsappTypes.js";
import { BOT_IDENTITY } from "../../config/identity.js";

export function systemGuard(ctx: MessageContext): boolean {
  // Abaikan dari bot sendiri berdasarkan JID (double check)
  if (ctx.senderJid.includes(BOT_IDENTITY.botPhone)) {
    return false;
  }
  
  return true;
}
