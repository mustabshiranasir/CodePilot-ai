import { supabase } from '../supabase';
import type { TeamMember } from '../../types';

const mapProfile = (p: any): TeamMember => ({
  id: p.id,
  name: p.name || p.email?.split('@')[0] || 'Unknown',
  email: p.email || '',
  avatar: p.avatar || p.name?.split(' ').map((n: string) => n[0]).join('') || '?',
  role: p.role || 'Developer',
  status: 'active',
});

export const teamService = {
  getAll: async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('name', { ascending: true });
    if (error) throw error;
    return (data || []).map(mapProfile) as TeamMember[];
  },
  getById: async (id: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (error) throw error;
    return mapProfile(data) as TeamMember;
  },
  findByEmail: async (email: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('email', email).maybeSingle();
    if (error) throw error;
    return data ? mapProfile(data) as TeamMember : null;
  },
  create: async (member: { name: string; email: string; role?: string }) => {
    const { data, error } = await supabase.from('profiles').insert({
      name: member.name,
      email: member.email,
      role: member.role || 'Developer',
      avatar: '',
    }).select().single();
    if (error) throw error;
    return mapProfile(data) as TeamMember;
  },
  update: async (id: string, updates: { role?: string }) => {
    const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return mapProfile(data) as TeamMember;
  },
  remove: async (id: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
  },
};
