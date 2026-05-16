export type ExpenseCategory =
  | 'makan'
  | 'jajan'
  | 'kebutuhan_kos'
  | 'tagihan'
  | 'laundry'
  | 'transportasi'
  | 'kesehatan'
  | 'hiburan'
  | 'sosial'
  | 'belanja_pribadi'
  | 'edukasi'
  | 'lain_lain';

export interface ParsedExpense {
  description: string;
  amount: number;
  rawText: string;
}

export interface ClassifiedExpense {
  description: string;
  amount: number;
  category: ExpenseCategory;
  confidence: number;
  source: 'rules';
  rawText: string;
}
