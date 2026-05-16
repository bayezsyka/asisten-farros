import { parseExpense } from "./expenseParser.js";
import { classifyExpense } from "./expenseClassifier.js";
import { getVerifiedSender, saveExpenseRecord } from "./expenseRepository.js";
import { ClassifiedExpense } from "./financeTypes.js";

export async function processExpense(rawText: string, senderJid: string): Promise<{ success: boolean; message: string; data?: ClassifiedExpense }> {
  const parsed = parseExpense(rawText);
  if (!parsed) {
    return { success: false, message: "Bukan format pengeluaran." };
  }

  const classified = classifyExpense(parsed);

  const senderLink = await getVerifiedSender(senderJid);
  if (!senderLink) {
    return { success: false, message: "Nomor WhatsApp belum tertaut dengan workspace manapun." };
  }

  const saved = await saveExpenseRecord(classified, senderJid, senderLink);
  
  if (!saved) {
    return { success: false, message: "Maaf, transaksi belum berhasil disimpan. Coba kirim ulang sebentar lagi." };
  }

  const formattedAmount = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(classified.amount);

  const successMessage = `Tercatat.\n\nDeskripsi: ${classified.description}\nNominal: ${formattedAmount}\nKategori: ${classified.category}`;

  return { success: true, message: successMessage, data: classified };
}
