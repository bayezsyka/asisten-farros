import { parseExpense } from "../services/finance/expenseParser.js";
import { classifyExpense } from "../services/finance/expenseClassifier.js";
import { saveExpense } from "../services/finance/financeService.js";

/**
 * Handles finance-related messages.
 * Returns true if the message was handled as an expense, false otherwise.
 */
export async function handleFinanceMessage(text: string): Promise<string | null> {
  // 1. Try to parse the text as an expense
  const parsed = parseExpense(text);
  if (!parsed) {
    return null; // Not an expense message
  }

  // 2. Classify the parsed expense
  const classified = classifyExpense(parsed);

  // 3. Save to database
  const success = await saveExpense(classified);

  if (!success) {
    return "Maaf, transaksi belum berhasil disimpan. Coba kirim ulang sebentar lagi.";
  }

  // Format amount
  const formattedAmount = new Intl.NumberFormat('id-ID').format(classified.amount);

  // 4. Return confirmation message
  return `Tercatat.

Deskripsi: ${classified.description}
Nominal: Rp${formattedAmount}
Kategori: ${classified.category}`;
}
