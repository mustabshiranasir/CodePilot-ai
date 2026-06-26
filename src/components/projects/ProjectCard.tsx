import { motion } from 'framer-motion';
import { FolderKanban, Bug, Clock, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatTimeAgo } from '../../lib/utils';
import type { Project } from '../../types';
import { useState } from 'react';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <Card variant="interactive" className="h-full group">
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FolderKanban className="h-5 w-5 text-blue-400" />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-lg hover:bg-[#21262D] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-8 w-36 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] shadow-xl z-20 py-1">
                    <button onClick={() => { onEdit(project); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[#21262D] transition-colors">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button onClick={() => { onDelete(project.id); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">{project.name}</h3>
            <Badge value={project.status} variant="status" />
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">{project.description}</p>

          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[var(--text-tertiary)]">Progress</span>
              <span className="text-[var(--text-secondary)] font-mono">{project.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-[#21262D] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${project.progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${project.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
              <span className="flex items-center gap-1"><Bug className="h-3.5 w-3.5" /> {project.bugCount}</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatTimeAgo(project.updatedAt)}</span>
            </div>
            <div className="flex -space-x-2">
              {project.members.slice(0, 4).map(m => (
                <div key={m.id} className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[9px] font-bold border-2 border-[var(--bg-secondary)]" title={m.name}>
                  {m.avatar}
                </div>
              ))}
              {project.members.length > 4 && (
                <div className="h-7 w-7 rounded-full bg-[#21262D] flex items-center justify-center text-[9px] text-[var(--text-tertiary)] border-2 border-[var(--bg-secondary)]">
                  +{project.members.length - 4}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
