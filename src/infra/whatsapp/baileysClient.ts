import makeWASocket, {
  Browsers,
  DisconnectReason,
  type ConnectionState,
  type WASocket,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal";
import { env } from "../../config/env.js";
import { logger } from "../../core/logger.js";
import { BOT_IDENTITY } from "../../config/identity.js";

// Ensure there is only one socket instance
let socketInstance: WASocket | null = null;

export function getWASocket(): WASocket | null {
  return socketInstance;
}

type RouterCallback = (message: any) => Promise<void>;
let messageRouter: RouterCallback | null = null;

export function setIncomingMessageRouter(router: RouterCallback) {
  messageRouter = router;
}

export async function createBaileysClient(): Promise<WASocket> {
  if (socketInstance) {
    logger.warn("WASocket instance already exists. Returning existing instance.");
    return socketInstance;
  }

  const { state, saveCreds } = await useMultiFileAuthState(env.BAILEYS_AUTH_DIR);

  const socket = makeWASocket({
    auth: state,
    browser: Browsers.windows(BOT_IDENTITY.name),
    logger: logger as any,
    markOnlineOnConnect: false,
    syncFullHistory: false, // Don't sync history for new bot connection
  });

  socketInstance = socket;

  socket.ev.on("creds.update", saveCreds);

  socket.ev.on("connection.update", (update: Partial<ConnectionState>) => {
    handleConnectionUpdate(update).catch((error) => {
      logger.error({ err: error }, "Gagal menangani pembaruan koneksi");
    });
  });

  socket.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") {
      return;
    }

    for (const message of messages) {
      if (messageRouter) {
        await messageRouter(message);
      }
    }
  });

  return socket;
}

async function handleConnectionUpdate(
  update: Partial<ConnectionState>
): Promise<void> {
  const { connection, lastDisconnect, qr } = update;

  if (qr) {
    console.log("Scan QR ini dari WhatsApp > Perangkat tertaut:");
    qrcode.generate(qr, { small: true });
  }

  if (connection === "open") {
    logger.info("Bot terhubung ke WhatsApp");
    return;
  }

  if (connection !== "close") {
    return;
  }

  logger.info("Koneksi tertutup");

  const statusCode = (lastDisconnect?.error as Boom | undefined)?.output?.statusCode;
  const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

  socketInstance = null; // Clear instance before reconnecting

  if (shouldReconnect) {
    logger.warn("Mencoba menyambung ulang...");
    await createBaileysClient();
    return;
  }

  logger.error("Sesi WhatsApp logout. Hapus auth state lalu login ulang.");
}
