import makeWASocket, {
  Browsers,
  DisconnectReason,
  type ConnectionState,
  type WASocket,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino, { type LevelWithSilent } from "pino";
import qrcode from "qrcode-terminal";

import { extractMessageText, routeIncomingMessage } from "./message-router.js";

let socketInstance: WASocket | null = null;

export function getWASocket(): WASocket | null {
  return socketInstance;
}

type CreateBaileysClientOptions = {
  authDir: string;
  botName: string;
  logLevel: string;
};

function normalizeLogLevel(logLevel: string): LevelWithSilent {
  const allowedLevels: LevelWithSilent[] = [
    "fatal",
    "error",
    "warn",
    "info",
    "debug",
    "trace",
    "silent",
  ];

  return allowedLevels.includes(logLevel as LevelWithSilent)
    ? (logLevel as LevelWithSilent)
    : "info";
}

export async function createBaileysClient(
  options: CreateBaileysClientOptions,
): Promise<WASocket> {
  const logger = pino({ level: normalizeLogLevel(options.logLevel) });
  const { state, saveCreds } = await useMultiFileAuthState(options.authDir);

  const socket = makeWASocket({
    auth: state,
    browser: Browsers.windows(options.botName),
    logger,
    markOnlineOnConnect: false,
  });

  socketInstance = socket;

  socket.ev.on("creds.update", saveCreds);

  socket.ev.on("connection.update", (update: Partial<ConnectionState>) => {
    handleConnectionUpdate(update, options).catch((error) => {
      logger.error({ err: error }, "Gagal menangani pembaruan koneksi");
    });
  });

  socket.ev.on("messages.upsert", async ({ messages, type }) => {
    for (const message of messages) {
      const text = extractMessageText(message);

      console.log("[WA DEBUG]", {
        type,
        remoteJid: message.key.remoteJid,
        fromMe: message.key.fromMe,
        text,
      });

      await routeIncomingMessage(message, async (jid, text) => {
        await socket.sendMessage(jid, { text });
      });
    }
  });

  return socket;
}

async function handleConnectionUpdate(
  update: Partial<ConnectionState>,
  options: CreateBaileysClientOptions,
): Promise<void> {
  const { connection, lastDisconnect, qr } = update;

  if (qr) {
    console.log("Scan QR ini dari WhatsApp > Perangkat tertaut:");
    qrcode.generate(qr, { small: true });
  }

  if (connection === "open") {
    console.log("Bot terhubung ke WhatsApp");
    return;
  }

  if (connection !== "close") {
    return;
  }

  console.log("Koneksi tertutup");

  const statusCode = (lastDisconnect?.error as Boom | undefined)?.output?.statusCode;
  const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

  if (shouldReconnect) {
    console.warn("Mencoba menyambung ulang...");
    await createBaileysClient(options);
    return;
  }

  console.error("Sesi WhatsApp logout. Hapus auth state lalu login ulang.");
}
