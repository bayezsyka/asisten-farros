import { parseExpense } from "../services/finance/expenseParser.js";
import { classifyExpense } from "../services/finance/expenseClassifier.js";
import { saveExpense } from "../services/finance/financeService.js";

/**
 * Handles finance-related messages.
 * Returns reply text if handled as an expense, null otherwise.
 */
export async function handleFinanceMessage(
  text: string,
  senderJid: string,
): Promise<string | null> {
  const parsed = parseExpense(text);

  if (!parsed) {
    return null;
  }

  const classified = classifyExpense(parsed);
  const success = await saveExpense(classified, senderJid);

  if (!success) {
    return "Maaf, transaksi belum berhasil disimpan. Coba kirim ulang sebentar lagi.";
  }

  const formattedAmount = new Intl.NumberFormat("id-ID").format(classified.amount);

  return `Tercatat.

Deskripsi: ${classified.description}
Nominal: Rp${formattedAmount}
Kategori: ${classified.category}`;
}
