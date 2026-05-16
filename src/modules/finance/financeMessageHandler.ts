import { processExpense } from "./expenseService.js";
import { MessageContext, RouteResult } from "../../infra/whatsapp/whatsappTypes.js";
import { parseExpense } from "./expenseParser.js";
import { supabase } from "../../infra/supabase/supabaseClient.js";

export async function financeMessageHandler(ctx: MessageContext): Promise<RouteResult> {
  // Jika Supabase tidak ada, skip finance module
  if (!supabase) {
    return { handled: false };
  }

  // Quick test if message is parseable before doing DB lookups
  const parsed = parseExpense(ctx.normalizedText);
  if (!parsed) {
    return { handled: false };
  }

  // It looks like an expense, process it
  const result = await processExpense(ctx.normalizedText, ctx.senderJid);
  
  // If parsing/processing failed (e.g. not linked, DB error), we might want to reply 
  // only if it's very clearly an expense, but since parseExpense passed, it's very likely meant to be an expense.
  // The service returns a message in all cases.
  return { handled: true, reply: result.message };
}
