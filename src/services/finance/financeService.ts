import { createClient } from "@supabase/supabase-js";
import { ClassifiedExpense } from "../../types/finance.js";

let supabaseUrl = process.env.SUPABASE_URL || '';
let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// If supabase client isn't available or credentials missing, we don't crash, we just fail gracefully on save
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export async function saveExpense(expense: ClassifiedExpense): Promise<boolean> {
  if (!supabase) {
    console.warn("Supabase credentials not found. Expense not saved.");
    return false;
  }

  try {
    const { error } = await supabase.from('expenses').insert({
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      raw_text: expense.rawText,
      source: 'whatsapp_asisten_farros',
      created_at: new Date().toISOString()
    });

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
