export type ExpenseCategory =
  | "makan"
  | "jajan"
  | "kebutuhan_kos"
  | "tagihan"
  | "laundry"
  | "transportasi"
  | "kesehatan"
  | "hiburan"
  | "sosial"
  | "belanja_pribadi"
  | "edukasi"
  | "lain_lain";

export interface ParsedExpense {
  description: string;
  amount: number;
  rawText: string;
}

export interface ClassifiedExpense extends ParsedExpense {
  category: ExpenseCategory;
  confidence: number;
  source: "rules" | "ai";
}

export type VerifiedWhatsappLink = {
  id: string;
  workspace_id: string;
  role: string;
  phone_number: string;
  wa_jid?: string | null;
  display_name?: string | null;
};
