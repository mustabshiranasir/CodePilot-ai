import { useState, useEffect } from 'react';
import { Plus, FolderKanban, Search } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectModal } from '../components/projects/ProjectModal';
import { useData } from '../contexts/DataContext';
import { useToast } from '../components/ui/Toast';
import type { Project } from '../types';

const statusTabs = ['all', 'active', 'completed', 'archived'] as const;

export default function Projects() {
  const { projects, addProject, updateProject, deleteProject } = useData();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'archived'>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const filtered = projects.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCreate = (data: any) => {
    addProject(data);
    addToast('success', 'Project created successfully');
  };

  const handleEdit = (data: any) => {
    if (editingProject) {
      updateProject(editingProject.id, data);
      addToast('success', 'Project updated successfully');
    }
  };

  const handleDelete = (id: string) => {
    deleteProject(id);
    addToast('success', 'Project deleted successfully');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Projects</h1>
          <p className="text-[var(--text-secondary)]">Manage your development projects</p>
        </div>
        <Button onClick={() => { setEditingProject(undefined); setShowModal(true); }}>
          <Plus className="h-4 w-4" /> New Project
        </Button>
      </div>

      <Card className="mb-6">
        <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex gap-1">
            {statusTabs.map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  filter === s
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[#21262D]'
                }`}
              >
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[var(--border-primary)] p-5 space-y-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-1.5 w-full rounded-full" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <div className="flex">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} className="h-7 w-7 rounded-full -ml-2 first:ml-0" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FolderKanban className="h-12 w-12 text-[var(--text-tertiary)] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">No projects found</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">Get started by creating your first project.</p>
          <Button onClick={() => { setEditingProject(undefined); setShowModal(true); }}>
            <Plus className="h-4 w-4" /> Create Project
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={(p) => { setEditingProject(p); setShowModal(true); }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <ProjectModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingProject(undefined); }}
        onSubmit={editingProject ? handleEdit : handleCreate}
        project={editingProject}
      />
    </div>
  );
}
