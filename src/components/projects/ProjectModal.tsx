import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Project, ProjectMember } from '../../types';
import { PROJECT_STATUSES } from '../../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  project?: Project;
}

const teamMemberOptions: ProjectMember[] = [
  { id: 'm1', name: 'Alex Chen', avatar: 'AC', role: 'Lead Developer' },
  { id: 'm2', name: 'Sarah Kim', avatar: 'SK', role: 'Frontend Developer' },
  { id: 'm3', name: 'Marcus Johnson', avatar: 'MJ', role: 'Backend Developer' },
  { id: 'm4', name: 'Emily Rodriguez', avatar: 'ER', role: 'UI/UX Designer' },
  { id: 'm5', name: 'David Wilson', avatar: 'DW', role: 'DevOps Engineer' },
  { id: 'm6', name: 'Lisa Park', avatar: 'LP', role: 'QA Engineer' },
];

export function ProjectModal({ isOpen, onClose, onSubmit, project }: ProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'completed' | 'archived'>('active');
  const [progress, setProgress] = useState(0);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      setStatus(project.status);
      setProgress(project.progress);
      setSelectedMembers(project.members.map(m => m.id));
    } else {
      setName('');
      setDescription('');
      setStatus('active');
      setProgress(0);
      setSelectedMembers([]);
    }
  }, [project, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const members = teamMemberOptions.filter(m => selectedMembers.includes(m.id));
    if (project) {
      onSubmit({ name, description, status, progress, members });
    } else {
      onSubmit({ name, description, status, progress, members });
    }
    onClose();
  };

  const toggleMember = (id: string) => {
    setSelectedMembers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-primary)]">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">{project ? 'Edit Project' : 'Create Project'}</h2>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#21262D] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[var(--text-primary)]">Project Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Frontend App" required className="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[var(--text-primary)]">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the project..." rows={3} className="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[var(--text-primary)]">Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">
                    {PROJECT_STATUSES.map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[var(--text-primary)]">Progress (%)</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min={0} max={100} value={progress} onChange={e => setProgress(parseInt(e.target.value))} className="flex-1 accent-blue-500" />
                    <span className="text-sm font-mono text-[var(--text-secondary)] w-8 text-right">{progress}%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[var(--text-primary)]">Team Members</label>
                <div className="grid grid-cols-2 gap-2">
                  {teamMemberOptions.map(m => (
                    <button type="button" key={m.id} onClick={() => toggleMember(m.id)} className={`flex items-center gap-3 p-2.5 rounded-lg border text-sm transition-all ${selectedMembers.includes(m.id) ? 'border-blue-500/50 bg-blue-500/10 text-blue-400' : 'border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-blue-500/30'}`}>
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold">{m.avatar}</div>
                      <div className="text-left">
                        <p className="text-xs font-medium">{m.name}</p>
                        <p className="text-[10px] text-[var(--text-tertiary)]">{m.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit">{project ? 'Save Changes' : 'Create Project'}</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
