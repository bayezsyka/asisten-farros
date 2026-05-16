import { describe, it, expect } from 'vitest';
import { parseExpense } from '../src/services/finance/expenseParser.js';
import { classifyExpense } from '../src/services/finance/expenseClassifier.js';
import { handleFinanceMessage } from '../src/wa/financeHandler.js';
import * as financeService from '../src/services/finance/financeService.js';
import { vi } from 'vitest';

describe('Expense Parser', () => {
  it('should parse "makan 15k"', () => {
    const result = parseExpense("makan 15k");
    expect(result).toBeDefined();
    expect(result?.amount).toBe(15000);
    expect(result?.description).toBe("makan");
  });

  it('should parse "beli kopi 18k"', () => {
    const result = parseExpense("beli kopi 18k");
    expect(result).toBeDefined();
    expect(result?.amount).toBe(18000);
    expect(result?.description).toBe("beli kopi");
  });

  it('should parse "isi bensin 50rb"', () => {
    const result = parseExpense("isi bensin 50rb");
    expect(result).toBeDefined();
    expect(result?.amount).toBe(50000);
    expect(result?.description).toBe("isi bensin");
  });

  it('should parse "bayar dimas 25000"', () => {
    const result = parseExpense("bayar dimas 25000");
    expect(result).toBeDefined();
    expect(result?.amount).toBe(25000);
    expect(result?.description).toBe("bayar dimas");
  });

  it('should ignore commands like "tugas classroom"', () => {
    const result = parseExpense("tugas classroom");
    expect(result).toBeNull();
  });

  it('should ignore commands like "ping"', () => {
    const result = parseExpense("ping");
    expect(result).toBeNull();
  });
});

describe('Expense Classifier', () => {
  it('should classify "makan" correctly', () => {
    const parsed = parseExpense("makan 15k")!;
    const classified = classifyExpense(parsed);
    expect(classified.category).toBe("makan");
  });

  it('should classify "beli kopi" correctly', () => {
    const parsed = parseExpense("beli kopi 18k")!;
    const classified = classifyExpense(parsed);
    expect(classified.category).toBe("jajan");
  });

  it('should classify "isi bensin" correctly', () => {
    const parsed = parseExpense("isi bensin 50rb")!;
    const classified = classifyExpense(parsed);
    expect(classified.category).toBe("transportasi");
  });

  it('should classify "bayar dimas" correctly', () => {
    const parsed = parseExpense("bayar dimas 25000")!;
    const classified = classifyExpense(parsed);
    expect(classified.category).toBe("sosial");
  });

  it('should classify "penyerap lembap" correctly', () => {
    const parsed = parseExpense("penyerap lembap 18000")!;
    const classified = classifyExpense(parsed);
    expect(classified.category).toBe("kebutuhan_kos");
  });
});

describe('Finance Handler', () => {
  it('should handle finance message and format the response', async () => {
    vi.spyOn(financeService, 'saveExpense').mockResolvedValue(true);
    const response = await handleFinanceMessage("beli kopi 18k", "6281234567890@s.whatsapp.net");
    expect(response).toContain("Tercatat.");
    expect(response).toContain("Deskripsi: beli kopi");
    expect(response).toContain("Nominal: Rp18.000");
    expect(response).toContain("Kategori: jajan");
    vi.restoreAllMocks();
  });

  it('should return null for non-finance message', async () => {
    const response = await handleFinanceMessage("ping", "6281234567890@s.whatsapp.net");
    expect(response).toBeNull();
  });
});
