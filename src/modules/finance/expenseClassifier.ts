import { ClassifiedExpense, ExpenseCategory, ParsedExpense } from "./financeTypes.js";
import { categoryKeywords } from "./categories.js";

export function classifyExpense(expense: ParsedExpense): ClassifiedExpense {
  let matchedCategory: ExpenseCategory = 'lain_lain';
  const descWords = expense.description.toLowerCase().split(/\s+/);
  
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    const category = cat as ExpenseCategory;
    for (const keyword of keywords) {
      if (expense.description.toLowerCase().includes(keyword)) {
        matchedCategory = category;
        break;
      }
    }
    if (matchedCategory !== 'lain_lain') {
      break;
    }
  }

  return {
    description: expense.description,
    amount: expense.amount,
    rawText: expense.rawText,
    category: matchedCategory,
    confidence: matchedCategory !== 'lain_lain' ? 0.8 : 0.1,
    source: 'rules'
  };
}
