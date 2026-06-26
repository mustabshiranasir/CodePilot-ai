import { supabase } from '../supabase';
import type { IssueComment } from '../../types';

const mapComment = (d: any): IssueComment => ({
  id: d.id,
  issueId: d.issue_id,
  author: d.author,
  userId: d.user_id,
  content: d.content,
  mentions: d.mentions || [],
  createdAt: d.created_at,
});

export const commentService = {
  getByIssueId: async (issueId: string) => {
    const { data, error } = await supabase.from('issue_comments').select('*').eq('issue_id', issueId).order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []).map(mapComment);
  },
  create: async (c: Omit<IssueComment, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase.from('issue_comments').insert({
      issue_id: c.issueId, author: c.author, user_id: c.userId, content: c.content, mentions: c.mentions,
    }).select().single();
    if (error) throw error;
    return mapComment(data);
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('issue_comments').delete().eq('id', id);
    if (error) throw error;
  },
};
