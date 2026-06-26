import { supabase } from '../supabase';
import type { Notification } from '../../types';

export const notificationService = {
  getByUserId: async (userId: string) => {
    const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return data as unknown as Notification[];
  },
  create: async (n: Omit<Notification, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase.from('notifications').insert({
      user_id: n.userId, type: n.type, message: n.message, issue_id: n.issueId, read: n.read,
    }).select().single();
    if (error) throw error;
    return data as unknown as Notification;
  },
  markRead: async (id: string) => {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
    if (error) throw error;
  },
  deleteAll: async (userId: string) => {
    const { error } = await supabase.from('notifications').delete().eq('user_id', userId);
    if (error) throw error;
  },
};
