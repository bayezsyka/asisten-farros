import { proto } from "@whiskeysockets/baileys";

export type MessageContext = {
  remoteJid: string;
  senderJid: string;
  text: string;
  normalizedText: string;
  fromMe: boolean;
  isGroup: boolean;
  timestamp: Date;
  rawMessage: proto.IWebMessageInfo;
};

export type RouteResult = {
  handled: boolean;
  reply?: string;
};

export type ModuleRoute = {
  name: string;
  priority: number;
  canHandle: (ctx: MessageContext) => boolean | Promise<boolean>;
  handle: (ctx: MessageContext) => Promise<RouteResult>;
};
