import { ParsedExpense } from "./financeTypes.js";

export function parseExpense(rawText: string): ParsedExpense | null {
  const text = rawText.trim().toLowerCase();
  
  // Exclude commands that are not expenses
  const excludedCommands = [
    "ping", "help", "daftar command", "menu", "tugas", "tugas classroom", 
    "sync classroom", "hubungkan classroom",
    "aktifkan reminder", "matikan reminder", "status reminder",
    "rekap hari ini", "laporan hari ini", "kirim laporan", "kirim rekap"
  ];
  
  if (excludedCommands.includes(text) || text.startsWith('/')) {
    return null;
  }

  // Regex for parsing amount. We look for IDR patterns: 15k, 15rb, 15 ribu, 15000, 20.000, rp 20k
  const moneyRegex = /(?:rp\s*)?(\d{1,3}(?:[.,]\d{3})*|\d+)\s*(k|rb|ribu)?\b/ig;
  let match;
  let amount = 0;
  let fullMatchString = "";

  while ((match = moneyRegex.exec(text)) !== null) {
    const rawNum = match[1].replace(/[.,]/g, '');
    let parsedNum = parseInt(rawNum, 10);
    
    const multiplier = match[2]?.toLowerCase();
    if (multiplier === 'k' || multiplier === 'rb' || multiplier === 'ribu') {
      parsedNum *= 1000;
    }
    
    if (parsedNum >= 100 && parsedNum <= 1000000000) {
      amount = parsedNum;
      fullMatchString = match[0];
      break;
    }
  }

  if (amount === 0) {
    return null;
  }

  const descriptionRaw = text.replace(fullMatchString, '').trim();
  const description = descriptionRaw.replace(/\s+/g, ' ').replace(/^rp\s*/, '').trim();

  if (!description) {
    return null;
  }

  return {
    description,
    amount,
    rawText
  };
}

export function extractRawAmount(rawText: string): string {
  const text = rawText.trim().toLowerCase();
  const match = text.match(/(?:rp\s*)?\d{1,3}(?:[.,]\d{3})*\s*(?:k|rb|ribu)?\b|(?:rp\s*)?\d+\s*(?:k|rb|ribu)?\b/i);
  return match ? match[0].trim() : "";
}
