import { AnyMessageContent } from "@whiskeysockets/baileys";
import { getWASocket } from "./baileysClient.js";
import { logger } from "../../core/logger.js";

export async function sendMessage(jid: string, content: AnyMessageContent, options?: any): Promise<boolean> {
  const socket = getWASocket();
  if (!socket) {
    logger.error("Cannot send message, WASocket is not initialized.");
    return false;
  }

  try {
    await socket.sendMessage(jid, content, options);
    return true;
  } catch (error) {
    logger.error({ err: error, jid }, "Failed to send message");
    return false;
  }
}

export async function replyMessage(jid: string, text: string, quotedMessage?: any): Promise<boolean> {
  const options = quotedMessage ? { quoted: quotedMessage } : {};
  return sendMessage(jid, { text }, options);
}
