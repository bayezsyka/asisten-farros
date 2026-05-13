import type { WAMessage } from "@whiskeysockets/baileys";

import { handleCommand } from "./command-handler.js";

export type ReplyFn = (jid: string, text: string) => Promise<void>;

export function extractMessageText(message: WAMessage): string {
  const content = message.message;

  if (!content) {
    return "";
  }

  if (typeof content.conversation === "string") {
    return content.conversation;
  }

  if (typeof content.extendedTextMessage?.text === "string") {
    return content.extendedTextMessage.text;
  }

  return "";
}

export async function routeIncomingMessage(
  message: WAMessage,
  reply: ReplyFn,
): Promise<void> {
  try {
    if (!message.message || message.key.fromMe) {
      return;
    }

    const remoteJid = message.key.remoteJid;
    const text = extractMessageText(message).trim();

    if (!remoteJid || text.length === 0) {
      return;
    }

    const response = await handleCommand(text, remoteJid);

    if (!response) {
      return;
    }

    await reply(remoteJid, response);
  } catch (error) {
    console.error("Gagal memproses pesan masuk:", error);
  }
}
