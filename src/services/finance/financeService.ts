import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import { ClassifiedExpense } from "../../types/finance.js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        realtime: {
          transport: WebSocket as any
        }
      })
    : null;

type VerifiedWhatsappLink = {
  id: string;
  workspace_id: string;
  role: string;
  phone_number: string;
  wa_jid?: string | null;
  display_name?: string | null;
};

function normalizeSenderPhone(senderJid: string): string {
  return senderJid.split("@")[0].split(":")[0].replace(/\D/g, "");
}

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function extractRawAmount(rawText: string): string {
  const text = rawText.trim().toLowerCase();
  const match = text.match(/(?:rp\s*)?\d{1,3}(?:[.,]\d{3})*\s*(?:k|rb|ribu)?\b|(?:rp\s*)?\d+\s*(?:k|rb|ribu)?\b/i);
  return match ? match[0].trim() : "";
}

async function getVerifiedSender(senderJid: string): Promise<VerifiedWhatsappLink | null> {
  if (!supabase) {
    return null;
  }

  const senderPhone = normalizeSenderPhone(senderJid);

  const byPhone = await supabase
    .from("whatsapp_links")
    .select("id, workspace_id, role, phone_number, wa_jid, display_name")
    .eq("phone_number", senderPhone)
    .eq("role", "sender")
    .eq("status", "verified")
    .order("verified_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (byPhone.error) {
    console.error("Failed to find verified sender by phone:", byPhone.error);
  }

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

  if (byJid.error) {
    console.error("Failed to find verified sender by jid:", byJid.error);
    return null;
  }

  return (byJid.data as VerifiedWhatsappLink | null) ?? null;
}

export async function saveExpense(
  expense: ClassifiedExpense,
  senderJid: string,
): Promise<boolean> {
  if (!supabase) {
    console.warn("Supabase credentials not found. Expense not saved.");
    return false;
  }

  try {
    const senderPhone = normalizeSenderPhone(senderJid);
    const senderLink = await getVerifiedSender(senderJid);

    if (!senderLink) {
      console.warn("Sender is not linked to any verified workspace:", {
        senderJid,
        senderPhone,
      });
      return false;
    }

    const payload = {
      workspace_id: senderLink.workspace_id,
      created_by_phone: senderPhone,

      subject: expense.description,
      amount: expense.amount,
      raw_amount: extractRawAmount(expense.rawText) || String(expense.amount),
      sender_jid: senderJid,
      sender_phone: senderPhone,
      expense_date: getTodayDate(),

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
  } catch (err) {
    console.error("Error saving expense:", err);
    return false;
  }
}
