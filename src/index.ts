import { bootstrap } from "./app/bootstrap.js";
import { logger } from "./core/logger.js";

bootstrap().catch((error) => {
  logger.fatal({ err: error }, "Gagal menjalankan aplikasi");
  process.exit(1);
});
