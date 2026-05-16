import { supabase } from "./financeService.js";
import { getVerifiedReportReceivers, getVerifiedSenderWorkspace } from "./whatsappLinkService.js";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID').format(amount);
}

export async function generateDailyReport(workspaceId: string): Promise<string> {
  if (!supabase) return "Supabase belum terhubung.";

  // Get workspace info
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('name')
    .eq('id', workspaceId)
    .single();

  const name = workspace?.name || "Farros";

  // Get today's expenses
  const today = new Date().toISOString().slice(0, 10);
  const { data: expenses, error } = await supabase
    .from('expenses')
    .select('description, amount')
    .eq('workspace_id', workspaceId)
    .eq('expense_date', today);

  if (error || !expenses || expenses.length === 0) {
    return `${name} hari ini belum ada pengeluaran.`;
  }

  const total = expenses.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);

  let report = `${name} hari ini menghabiskan uang sebanyak: Rp ${formatCurrency(total)}.\n\nBerikut adalah rinciannya:\n`;
  expenses.forEach((exp: any, index: number) => {
    report += `${index + 1}. ${exp.description} Rp ${formatCurrency(Number(exp.amount) || 0)}\n`;
  });

  return report.trim();
}

export async function getDailyReportForSender(remoteJid: string): Promise<string | null> {
  const workspaceLink = await getVerifiedSenderWorkspace(remoteJid);
  if (!workspaceLink) {
    return null;
  }

  return generateDailyReport(workspaceLink.workspace_id);
}

export async function broadcastDailyReportFromSender(remoteJid: string): Promise<{ success: boolean, message: string, targets: string[], report: string }> {
  const workspaceLink = await getVerifiedSenderWorkspace(remoteJid);
  if (!workspaceLink) {
    return { success: false, message: "Nomor ini tidak terhubung dengan workspace manapun.", targets: [], report: "" };
  }

  const receivers = await getVerifiedReportReceivers(workspaceLink.workspace_id);
  if (receivers.length === 0) {
    return { success: false, message: "Belum ada penerima laporan yang terhubung.", targets: [], report: "" };
  }

  const report = await generateDailyReport(workspaceLink.workspace_id);
  const targets = receivers.map((r: any) => r.wa_jid).filter((j: any): j is string => j !== null);

  return { success: true, message: "Laporan berhasil dikirim.", targets, report };
}
