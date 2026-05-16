import { supabase } from "./financeService.js";

export async function verifyWhatsappLink(verificationCode: string, remoteJid: string, role: 'sender' | 'report_receiver') {
  if (!supabase) return null;

  // Extract phone number from JID (e.g. 6281234567890@s.whatsapp.net -> 6281234567890)
  const phoneNumber = remoteJid.split('@')[0];

  const { data: link, error } = await supabase
    .from('whatsapp_links')
    .select('*')
    .eq('verification_code', verificationCode)
    .eq('role', role)
    .eq('status', 'pending')
    .single();

  if (error || !link) {
    return null;
  }

  // Check if expired
  if (new Date(link.expires_at) < new Date()) {
    return null;
  }

  // Update link to verified
  const { error: updateError } = await supabase
    .from('whatsapp_links')
    .update({
      status: 'verified',
      verified_at: new Date().toISOString(),
      wa_jid: remoteJid,
      phone_number: link.phone_number || phoneNumber
    })
    .eq('id', link.id);

  if (updateError) {
    console.error("Failed to update whatsapp_links:", updateError);
    return null;
  }

  return link;
}

export async function getVerifiedSenderWorkspace(remoteJid: string) {
  if (!supabase) return null;

  const phoneNumber = remoteJid.split('@')[0];

  const { data: links, error } = await supabase
    .from('whatsapp_links')
    .select('workspace_id, phone_number, wa_jid')
    .eq('role', 'sender')
    .eq('status', 'verified')
    .or(`wa_jid.eq.${remoteJid},phone_number.eq.${phoneNumber}`);

  if (error || !links || links.length === 0) {
    return null;
  }

  // Just return the first one matched
  return links[0];
}

export async function getVerifiedReportReceivers(workspaceId: string) {
  if (!supabase) return [];

  const { data: receivers, error } = await supabase
    .from('whatsapp_links')
    .select('wa_jid, phone_number, display_name')
    .eq('workspace_id', workspaceId)
    .eq('role', 'report_receiver')
    .eq('status', 'verified')
    .not('wa_jid', 'is', null);

  if (error || !receivers) {
    return [];
  }

  return receivers;
}
