import { proto } from "@whiskeysockets/baileys";
import { getRoutes } from "./routeRegistry.js";
import { createMessageContext } from "../../infra/whatsapp/messageExtractor.js";
import { sendMessage } from "../../infra/whatsapp/sendMessage.js";
import { logger } from "../../core/logger.js";
import { systemGuard } from "./guards.js";

export async function routeIncomingMessage(rawMessage: proto.IWebMessageInfo) {
  if (rawMessage.key?.fromMe) return;

  const ctx = createMessageContext(rawMessage);
  if (!ctx || !ctx.text) return; // Abaikan pesan kosong

  // Check system guard (e.g. abaikan dari bot sendiri, dll yang lebih spesifik)
  if (!systemGuard(ctx)) return;

  const routes = getRoutes();
  
  for (const route of routes) {
    try {
      const canHandle = await route.canHandle(ctx);
      if (canHandle) {
        const result = await route.handle(ctx);
        if (result.reply) {
          await sendMessage(ctx.remoteJid, { text: result.reply });
        }
        if (result.handled) {
          break; // Stop routing if a handler fully handled it
        }
      }
    } catch (error) {
      logger.error({ err: error, routeName: route.name }, "Error handling route");
      await sendMessage(ctx.remoteJid, { text: "Terjadi kesalahan internal bot." });
      break;
    }
  }
}
