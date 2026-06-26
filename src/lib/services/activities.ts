import { supabase } from '../supabase';
import type { Activity } from '../../types';

export const activityService = {
  getAll: async (limit = 50) => {
    const { data, error } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return data as unknown as Activity[];
  },
  create: async (a: Omit<Activity, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase.from('activity_logs').insert({
      type: a.type, message: a.message, user_name: a.userName, user_id: a.userId,
      issue_id: a.issueId, repository_id: a.repositoryId,
    }).select().single();
    if (error) throw error;
    return data as unknown as Activity;
  },
};
