import { MessageContext, RouteResult } from "../../infra/whatsapp/whatsappTypes.js";
import { loadReminderConfig, saveReminderConfig } from "./reminderService.js";
import { isOwnerJid } from "../../config/identity.js";

export async function reminderMessageHandler(ctx: MessageContext): Promise<RouteResult> {
  const text = ctx.normalizedText;

  if (text === "aktifkan reminder") {
    if (!isOwnerJid(ctx.senderJid) && !ctx.isGroup) {
      // For now allow owner to enable in DM, or allow in any group it's added to if needed, 
      // but strictly we'll link it to the chat it was sent from.
    }
    
    await saveReminderConfig({
      enabled: true,
      chatJid: ctx.remoteJid,
    });
    return { handled: true, reply: "Sip, reminder harian jam 17.00 diaktifkan untuk chat ini." };
  }

  if (text === "matikan reminder") {
    await saveReminderConfig({ enabled: false });
    return { handled: true, reply: "Reminder harian dimatikan." };
  }

  if (text === "status reminder") {
    const config = await loadReminderConfig();
    const status = config.enabled ? "Aktif" : "Mati";
    let chatInfo = "";
    
    if (config.enabled && config.chatJid) {
      chatInfo = config.chatJid === ctx.remoteJid 
        ? " (di chat ini)" 
        : " (di chat lain)";
    }

    return { 
      handled: true, 
      reply: `Status Reminder: ${status}${chatInfo}`
    };
  }

  return { handled: false };
}
