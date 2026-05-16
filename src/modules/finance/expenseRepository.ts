import { supabase } from "../../infra/supabase/supabaseClient.js";
import { VerifiedWhatsappLink, ClassifiedExpense } from "./financeTypes.js";
import { normalizePhone } from "../../config/identity.js";
import { extractRawAmount } from "./expenseParser.js";
import { env } from "../../config/env.js";

export async function getVerifiedSender(senderJid: string): Promise<VerifiedWhatsappLink | null> {
  if (!supabase) return null;

  let senderPhone = "";
  if (senderJid.includes("@lid")) {
    senderPhone = senderJid; // We'll try to match jid directly if LID
  } else {
    senderPhone = normalizePhone(senderJid.split("@")[0].split(":")[0]);
  }

  const byPhone = await supabase
    .from("whatsapp_links")
    .select("id, workspace_id, role, phone_number, wa_jid, display_name")
    .eq("phone_number", senderPhone)
    .eq("role", "sender")
    .eq("status", "verified")
    .order("verified_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (byPhone.data) {
    return byPhone.data as VerifiedWhatsappLink;
  }

  const byJid = await supabase
    .from("whatsapp_links")
    .select("id, workspace_id, role, phone_number, wa_jid, display_name")
    .eq("wa_jid", senderJid)
    .eq("role", "sender")
    .eq("status", "verified")
    .order("verified_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (byJid.data as VerifiedWhatsappLink | null) ?? null;
}

export async function saveExpenseRecord(expense: ClassifiedExpense, senderJid: string, senderLink: VerifiedWhatsappLink): Promise<boolean> {
  if (!supabase) return false;

  const senderPhone = senderJid.includes("@lid") ? "" : normalizePhone(senderJid.split("@")[0].split(":")[0]);
  const finalPhone = senderPhone || senderLink.phone_number;

  const payload = {
    workspace_id: senderLink.workspace_id,
    created_by_phone: finalPhone,
    subject: expense.description,
    amount: expense.amount,
    raw_amount: extractRawAmount(expense.rawText) || String(expense.amount),
    sender_jid: senderJid,
    sender_phone: finalPhone,
    expense_date: new Date().toLocaleDateString('en-CA', { timeZone: env.TZ }), // Format YYYY-MM-DD in local tz
    predicted_category: expense.category,
    confidence: expense.confidence,
    confirmed_category: null,
    is_confirmed: false,
    model_version: "rules-v1",
    is_confident: expense.confidence >= 0.7,
    category: expense.category,
    raw_text: expense.rawText,
    source: "whatsapp_asisten_farros",
    description: expense.description,
  };

  const { error } = await supabase.from("expenses").insert(payload);
  if (error) {
    console.error("Failed to save expense to Supabase:", error);
    return false;
  }
  return true;
}
