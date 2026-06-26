import { supabase } from '../supabase';
import type { Issue } from '../../types';

const ROLE_MAP: Record<string, string> = {
  'Frontend Developer': 'Developer',
  'Backend Engineer': 'Developer',
  'Optimization Team': 'Developer',
  'Security Team': 'Admin',
  'Backend Developer': 'Developer',
  'Database Engineer': 'Lead Developer',
  'Organization Team': 'Developer',
};

const normalizeRole = (role: string): string => ROLE_MAP[role] || role;

const mapIssue = (d: any): Issue => ({
  id: d.id,
  scanId: d.scan_id,
  repositoryId: d.repository_id,
  title: d.title,
  description: d.description,
  severity: d.severity,
  type: d.type,
  category: d.category,
  filePath: d.file_path,
  codeSnippet: d.code_snippet,
  rootCause: d.root_cause,
  aiExplanation: d.ai_explanation,
  recommendedFix: d.recommended_fix,
  assignee: normalizeRole(d.assignee),
  assigneeId: d.assignee_id,
  status: d.status,
  createdAt: d.created_at,
  updatedAt: d.updated_at,
});

export const issueService = {
  getAll: async () => {
    const { data, error } = await supabase.from('issues').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapIssue);
  },
  getByScanId: async (scanId: string) => {
    const { data, error } = await supabase.from('issues').select('*').eq('scan_id', scanId);
    if (error) throw error;
    return (data || []).map(mapIssue);
  },
  getByRepositoryId: async (repoId: string) => {
    const { data, error } = await supabase.from('issues').select('*').eq('repository_id', repoId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapIssue);
  },
  getById: async (id: string) => {
    const { data, error } = await supabase.from('issues').select('*').eq('id', id).single();
    if (error) throw error;
    return mapIssue(data);
  },
  create: async (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data, error } = await supabase.from('issues').insert({
      scan_id: issue.scanId, repository_id: issue.repositoryId, title: issue.title,
      description: issue.description, severity: issue.severity, type: issue.type,
      category: issue.category, file_path: issue.filePath, code_snippet: issue.codeSnippet,
      root_cause: issue.rootCause, ai_explanation: issue.aiExplanation,
      recommended_fix: issue.recommendedFix, assignee: normalizeRole(issue.assignee),
      assignee_id: issue.assigneeId, status: issue.status,
    }).select().single();
    if (error) throw error;
    return mapIssue(data);
  },
  createMany: async (issues: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    const dbIssues = issues.map(i => ({
      scan_id: i.scanId, repository_id: i.repositoryId, title: i.title,
      description: i.description, severity: i.severity, type: i.type,
      category: i.category, file_path: i.filePath, code_snippet: i.codeSnippet,
      root_cause: i.rootCause, ai_explanation: i.aiExplanation,
      recommended_fix: i.recommendedFix, assignee: normalizeRole(i.assignee),
      assignee_id: i.assigneeId, status: i.status,
    }));
    const { data, error } = await supabase.from('issues').insert(dbIssues).select();
    if (error) throw error;
    return (data || []).map(mapIssue);
  },
  update: async (id: string, updates: Partial<Issue>) => {
    const db: Record<string, any> = { updated_at: new Date().toISOString() };
    if (updates.status !== undefined) db.status = updates.status;
    if (updates.assignee !== undefined) db.assignee = normalizeRole(updates.assignee);
    if (updates.assigneeId !== undefined) db.assignee_id = updates.assigneeId;
    const { data, error } = await supabase.from('issues').update(db).eq('id', id).select().single();
    if (error) throw error;
    return mapIssue(data);
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('issues').delete().eq('id', id);
    if (error) throw error;
  },
};
