import { ClassifiedExpense, ExpenseCategory, ParsedExpense } from "../../types/finance.js";
import { categoryKeywords } from "./categories.js";

export function classifyExpense(expense: ParsedExpense): ClassifiedExpense {
  let matchedCategory: ExpenseCategory = 'lain_lain';
  
  // A simple rule-based classifier based on keywords
  // Find a category that matches the most words, or first match.
  // We iterate through all categories and their keywords.
  const descWords = expense.description.toLowerCase().split(/\s+/);
  
  // We'll prioritize longer phrases if needed, but for simplicity, we look for direct inclusion.
  // We can just check if any keyword exists in the description.
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    const category = cat as ExpenseCategory;
    for (const keyword of keywords) {
      // Check if keyword is in the description
      if (expense.description.includes(keyword)) {
        matchedCategory = category;
        break; // break inner loop
      }
    }
    if (matchedCategory !== 'lain_lain') {
      break; // break outer loop if found
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
