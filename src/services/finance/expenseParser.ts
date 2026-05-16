import { ParsedExpense } from "../../types/finance.js";

export function parseExpense(rawText: string): ParsedExpense | null {
  const text = rawText.trim().toLowerCase();
  
  // Exclude commands that are not expenses
  const excludedCommands = [
    "ping", "help", "tugas", "tugas classroom", 
    "sync classroom", "hubungkan classroom",
    "aktifkan reminder", "matikan reminder", "status reminder"
  ];
  if (excludedCommands.includes(text) || text.startsWith('/')) {
    return null;
  }

  // Regex for parsing amount. We look for IDR patterns: 15k, 15rb, 15 ribu, 15000, 20.000, rp 20k
  // \b(?:\s*rupiah)? avoids eating "ribu" if we match it, but we handle "ribu" directly.
  const moneyRegex = /(?:rp\s*)?(\d{1,3}(?:[.,]\d{3})*|\d+)\s*(k|rb|ribu)?\b/ig;
  let match;
  let amount = 0;
  let fullMatchString = "";

  // Loop through all matches to find a plausible amount (>= 100)
  while ((match = moneyRegex.exec(text)) !== null) {
    const rawNum = match[1].replace(/[.,]/g, '');
    let parsedNum = parseInt(rawNum, 10);
    
    const multiplier = match[2]?.toLowerCase();
    if (multiplier === 'k' || multiplier === 'rb' || multiplier === 'ribu') {
      parsedNum *= 1000;
    }
    
    // Most likely minimum amount in IDR is 100. Let's say max 1B.
    if (parsedNum >= 100 && parsedNum <= 1000000000) {
      amount = parsedNum;
      fullMatchString = match[0];
      break;
    }
  }

  if (amount === 0) {
    return null;
  }

  // Remove the matched amount from the string to get the description
  // Also clean up trailing/leading symbols or spaces
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
