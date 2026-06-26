import { supabase } from '../supabase';
import type { CodeScan } from '../../types';

const mapScan = (d: any): CodeScan => ({
  id: d.id,
  repositoryId: d.repository_id,
  uploadId: d.upload_id,
  status: d.status,
  totalFiles: d.total_files,
  totalIssues: d.total_issues,
  resolvedIssues: d.resolved_issues,
  codeQualityScore: d.code_quality_score,
  securityScore: d.security_score,
  performanceScore: d.performance_score,
  teamProductivityScore: d.team_productivity_score,
  improvementScore: d.improvement_score,
  startedAt: d.started_at,
  completedAt: d.completed_at,
  createdAt: d.created_at,
});

export const scanService = {
  getAll: async () => {
    const { data, error } = await supabase.from('code_scans').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapScan);
  },
  getByRepositoryId: async (repoId: string) => {
    const { data, error } = await supabase.from('code_scans').select('*').eq('repository_id', repoId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapScan);
  },
  create: async (scan: Omit<CodeScan, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase.from('code_scans').insert({
      repository_id: scan.repositoryId, upload_id: scan.uploadId, status: scan.status,
      total_files: scan.totalFiles, total_issues: scan.totalIssues, resolved_issues: scan.resolvedIssues,
      code_quality_score: scan.codeQualityScore, security_score: scan.securityScore,
      performance_score: scan.performanceScore, team_productivity_score: scan.teamProductivityScore,
      improvement_score: scan.improvementScore, started_at: scan.startedAt, completed_at: scan.completedAt,
    }).select().single();
    if (error) throw error;
    return mapScan(data);
  },
  update: async (id: string, updates: Partial<CodeScan>) => {
    const db: Record<string, any> = {};
    if (updates.status !== undefined) db.status = updates.status;
    if (updates.totalFiles !== undefined) db.total_files = updates.totalFiles;
    if (updates.totalIssues !== undefined) db.total_issues = updates.totalIssues;
    if (updates.resolvedIssues !== undefined) db.resolved_issues = updates.resolvedIssues;
    if (updates.codeQualityScore !== undefined) db.code_quality_score = updates.codeQualityScore;
    if (updates.securityScore !== undefined) db.security_score = updates.securityScore;
    if (updates.performanceScore !== undefined) db.performance_score = updates.performanceScore;
    if (updates.teamProductivityScore !== undefined) db.team_productivity_score = updates.teamProductivityScore;
    if (updates.improvementScore !== undefined) db.improvement_score = updates.improvementScore;
    if (updates.completedAt !== undefined) db.completed_at = updates.completedAt;
    const { data, error } = await supabase.from('code_scans').update(db).eq('id', id).select().single();
    if (error) throw error;
    return mapScan(data);
  },
};
