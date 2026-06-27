import { supabase } from '../supabase';
import type { Invitation } from '../../types';

const mapInvitation = (data: any): Invitation => ({
  id: data.id,
  email: data.email,
  name: data.name,
  role: data.role,
  invitedBy: data.invited_by,
  status: data.status,
  createdAt: data.created_at,
  expiresAt: data.expires_at,
});

export const invitationService = {
  getAll: async (invitedBy?: string) => {
    let query = supabase.from('invitations').select('*');
    if (invitedBy) query = query.eq('invited_by', invitedBy);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapInvitation);
  },
  getPending: async () => {
    const { data, error } = await supabase.from('invitations').select('*').eq('status', 'pending').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapInvitation);
  },
  getByEmail: async (email: string) => {
    const { data, error } = await supabase.from('invitations').select('*').eq('email', email).maybeSingle();
    if (error) throw error;
    return data ? mapInvitation(data) : null;
  },
  create: async (inv: { email: string; name: string; role: string; invitedBy: string }) => {
    const { data, error } = await supabase.from('invitations').insert({
      email: inv.email,
      name: inv.name,
      role: inv.role,
      invited_by: inv.invitedBy,
      status: 'pending',
    }).select().single();
    if (error) throw error;
    return mapInvitation(data);
  },
  accept: async (id: string) => {
    const { data, error } = await supabase.from('invitations').update({ status: 'accepted' }).eq('id', id).select().single();
    if (error) throw error;
    return mapInvitation(data);
  },
  remove: async (id: string) => {
    const { error } = await supabase.from('invitations').delete().eq('id', id);
    if (error) throw error;
  },
  sendEmailInvite: async (inv: { email: string; name: string; role: string; invitedByName: string; invitationId: string }) => {
    const { data, error } = await supabase.functions.invoke('send-invite', {
      body: inv,
    });
    if (error) throw error;
    return data;
  },
};
