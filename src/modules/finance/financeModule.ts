import { registerRoute } from "../whatsapp/routeRegistry.js";
import { financeMessageHandler } from "./financeMessageHandler.js";
import { supabase } from "../../infra/supabase/supabaseClient.js";
import { logger } from "../../core/logger.js";
import { MessageContext } from "../../infra/whatsapp/whatsappTypes.js";
import { parseExpense } from "./expenseParser.js";

export function initFinanceModule() {
  if (!supabase) {
    logger.warn("Finance module is disabled due to missing Supabase client.");
    return;
  }

  registerRoute({
    name: "finance_expense",
    priority: 20, // High priority, after system guards
    canHandle: (ctx: MessageContext) => {
      return parseExpense(ctx.normalizedText) !== null;
    },
    handle: financeMessageHandler
  });
  
  logger.info("Finance module initialized.");
}
