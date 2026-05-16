import { ExpenseCategory } from "./financeTypes.js";

export const categoryKeywords: Record<ExpenseCategory, string[]> = {
  makan: ["makan", "nasi", "pecel", "penyetan", "sarapan", "warteg", "mie", "soto", "sate"],
  jajan: ["jajan", "kopi", "es", "roti", "snack", "teh", "minum", "boba", "kue", "gorengan", "cafe", "kafe"],
  kebutuhan_kos: ["galon", "sabun", "shampo", "sikat", "odol", "deterjen", "kos", "kosan", "air", "token", "penyerap lembap", "pewangi", "karbol", "sikat gigi", "sapu"],
  tagihan: ["tagihan", "wifi", "internet", "kuota", "pulsa", "bpjs", "pajak", "listrik"],
  laundry: ["laundry", "cuci baju", "cucian", "setrika"],
  transportasi: ["bensin", "parkir", "ojol", "gojek", "grab", "maxim", "inDrive", "kereta", "tiket", "tol", "tambal ban", "servis"],
  kesehatan: ["obat", "dokter", "vitamin", "rumah sakit", "klinik", "puskesmas", "masker", "tolak angin"],
  hiburan: ["game", "film", "bioskop", "netflix", "spotify", "youtube", "konser", "tiket", "langganan", "steam", "topup"],
  sosial: ["bayar", "utang", "sumbangan", "kondangan", "kado", "zakat", "infaq", "sedekah", "traktir", "patungan", "dimas"],
  belanja_pribadi: ["baju", "celana", "sepatu", "tas", "skincare", "parfum", "potong rambut", "cukur", "barbershop", "pomade"],
  edukasi: ["buku", "kursus", "webinar", "fotokopi", "print", "alat tulis", "pulpen", "kertas"],
  lain_lain: []
};
