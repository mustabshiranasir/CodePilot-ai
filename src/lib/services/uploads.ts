import { supabase } from '../supabase';
import type { ProjectUpload } from '../../types';

const mapUpload = (d: any): ProjectUpload => ({
  id: d.id,
  repositoryId: d.repository_id,
  userId: d.user_id,
  fileName: d.file_name,
  fileSize: d.file_size,
  fileType: d.file_type,
  status: d.status,
  totalFiles: d.total_files,
  createdAt: d.created_at,
});

export const uploadService = {
  getAll: async () => {
    const { data, error } = await supabase.from('project_uploads').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapUpload);
  },
  create: async (u: Omit<ProjectUpload, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase.from('project_uploads').insert({
      repository_id: u.repositoryId, user_id: u.userId, file_name: u.fileName,
      file_size: u.fileSize, file_type: u.fileType, status: u.status, total_files: u.totalFiles,
    }).select().single();
    if (error) throw error;
    return mapUpload(data);
  },
  update: async (id: string, updates: Partial<ProjectUpload>) => {
    const db: Record<string, any> = {};
    if (updates.status !== undefined) db.status = updates.status;
    if (updates.totalFiles !== undefined) db.total_files = updates.totalFiles;
    const { data, error } = await supabase.from('project_uploads').update(db).eq('id', id).select().single();
    if (error) throw error;
    return mapUpload(data);
  },
};
