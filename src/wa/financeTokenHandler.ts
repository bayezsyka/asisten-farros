import { verifyWhatsappLink } from "../services/finance/whatsappLinkService.js";

export async function handleFinanceToken(text: string, remoteJid: string): Promise<string | null> {
  const upperText = text.toUpperCase().trim();
  
  if (upperText.startsWith("PENGIRIM BF-")) {
    const code = upperText.replace("PENGIRIM ", "").trim();
    const link = await verifyWhatsappLink(code, remoteJid, "sender");
    if (link) {
      return "Nomor ini berhasil terhubung sebagai Pengirim. Nomor ini sekarang bisa mencatat pengeluaran.";
    }
    return "Kode verifikasi tidak valid atau sudah kedaluwarsa.";
  }

  if (upperText.startsWith("LAPORAN BF-")) {
    const code = upperText.replace("LAPORAN ", "").trim();
    const link = await verifyWhatsappLink(code, remoteJid, "report_receiver");
    if (link) {
      // NOTE: We could directly send today's report here, but instructions say "boleh langsung kirim laporan... jika service tersedia".
      // We'll leave it as a success message for now, the user can type 'rekap hari ini'.
      return "Nomor ini berhasil terhubung sebagai Penerima Laporan. Nomor ini akan menerima laporan sesuai pengaturan workspace.";
    }
    return "Kode verifikasi tidak valid atau sudah kedaluwarsa.";
  }

  return null;
}
