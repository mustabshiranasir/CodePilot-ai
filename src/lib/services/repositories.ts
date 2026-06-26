import { supabase } from '../supabase';
import type { Repository } from '../../types';

const mapRepository = (d: any): Repository => ({
  id: d.id,
  name: d.name,
  url: d.url,
  type: d.type,
  ownerId: d.owner_id,
  description: d.description,
  language: d.language,
  stars: d.stars,
  defaultBranch: d.default_branch,
  createdAt: d.created_at,
  updatedAt: d.updated_at,
});

export const repositoryService = {
  getAll: async () => {
    const { data, error } = await supabase.from('repositories').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRepository);
  },
  getById: async (id: string) => {
    const { data, error } = await supabase.from('repositories').select('*').eq('id', id).single();
    if (error) throw error;
    return mapRepository(data);
  },
  create: async (repo: Omit<Repository, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data, error } = await supabase.from('repositories').insert({
      name: repo.name, url: repo.url, type: repo.type, owner_id: repo.ownerId,
      description: repo.description, language: repo.language, stars: repo.stars, default_branch: repo.defaultBranch,
    }).select().single();
    if (error) throw error;
    return mapRepository(data);
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('repositories').delete().eq('id', id);
    if (error) throw error;
  },
};
