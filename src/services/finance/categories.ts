import { ExpenseCategory } from "../../types/finance.js";

export const categoryKeywords: Record<ExpenseCategory, string[]> = {
  makan: ['makan', 'sarapan', 'makan siang', 'makan malam', 'nasi', 'ayam', 'penyetan', 'ketoprak', 'indomie', 'telor'],
  jajan: ['kopi', 'es', 'snack', 'cemilan', 'gooday', 'mocafrio', 'kopken', 'cappucino', 'teler', 'minuman'],
  kebutuhan_kos: ['galon', 'sabun', 'spons', 'penyerap lembap', 'sendok', 'garpu', 'kamar', 'kos'],
  tagihan: ['listrik', 'internet', 'wifi', 'air', 'iuran'],
  laundry: ['laundry', 'cuci', 'setrika'],
  transportasi: ['bensin', 'parkir', 'ojek', 'gojek', 'grab', 'tol', 'servis motor', 'service motor'],
  kesehatan: ['obat', 'urut', 'vitamin', 'softlens', 'periksa', 'dokter'],
  hiburan: ['futsal', 'nonton', 'game', 'nongkrong'],
  sosial: ['bayar', 'patungan', 'traktir', 'transfer'],
  belanja_pribadi: ['baju', 'sandal', 'sepatu', 'tas', 'aksesoris'],
  edukasi: ['buku', 'kursus', 'belajar', 'software belajar', 'alat produktivitas'],
  lain_lain: []
};
