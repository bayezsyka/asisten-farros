import { proto } from "@whiskeysockets/baileys";
import { MessageContext } from "./whatsappTypes.js";

export function extractMessageText(message: proto.IWebMessageInfo): string {
  const msg = message.message;
  if (!msg) return "";

  if (msg.conversation) {
    return msg.conversation;
  }

  if (msg.extendedTextMessage?.text) {
    return msg.extendedTextMessage.text;
  }

  if (msg.imageMessage?.caption) {
    return msg.imageMessage.caption;
  }

  if (msg.videoMessage?.caption) {
    return msg.videoMessage.caption;
  }

  if (msg.documentMessage?.caption) {
    return msg.documentMessage.caption;
  }

  return "";
}

export function createMessageContext(message: proto.IWebMessageInfo): MessageContext | null {
  const remoteJid = message.key?.remoteJid;
  if (!remoteJid) return null;

  const isGroup = remoteJid.endsWith("@g.us");
  let senderJid = remoteJid;

  if (isGroup) {
    senderJid = message.key?.participant || remoteJid;
  }

  const text = extractMessageText(message);
  const normalizedText = text.trim().toLowerCase();

  const timestampNum = typeof message.messageTimestamp === 'number' 
    ? message.messageTimestamp * 1000 
    : (message.messageTimestamp ? (message.messageTimestamp as any).low * 1000 : Date.now());
    
  return {
    remoteJid,
    senderJid,
    text,
    normalizedText,
    fromMe: !!message.key?.fromMe,
    isGroup,
    timestamp: new Date(timestampNum),
    rawMessage: message,
  };
}
