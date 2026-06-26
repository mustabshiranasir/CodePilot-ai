import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import { Button } from '../ui/Button';
import { useData } from '../../contexts/DataContext';
import type { Bug } from '../../types';
import { BUG_STATUSES, PRIORITIES } from '../../types';

interface BugModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  bug?: Bug;
}

const assigneeOptions = ['Alex C.', 'Sarah K.', 'Marcus J.', 'Emily R.', 'David W.', 'Lisa P.'];
const labelOptions = ['frontend', 'backend', 'mobile', 'auth', 'api', 'ui', 'database', 'performance', 'security', 'css', 'forms', 'search', 'notifications', 'realtime', 'theme'];

export function BugModal({ isOpen, onClose, onSubmit, bug }: BugModalProps) {
  const { projects } = useData();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Bug['status']>('todo');
  const [priority, setPriority] = useState<Bug['priority']>('medium');
  const [projectId, setProjectId] = useState('');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);

  useEffect(() => {
    if (bug) {
      setTitle(bug.title);
      setDescription(bug.description);
      setStatus(bug.status);
      setPriority(bug.priority);
      setProjectId(bug.projectId);
      setAssignee(bug.assignee);
      setDueDate(bug.dueDate);
      setLabels(bug.labels);
      setAttachments(bug.attachments);
    } else {
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setProjectId(projects[0]?.id || '');
      setAssignee('');
      setDueDate('');
      setLabels([]);
      setAttachments([]);
    }
  }, [bug, isOpen, projects]);

  const toggleLabel = (l: string) => {
    setLabels(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description, status, priority, projectId, assignee, dueDate, labels, attachments });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-primary)]">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">{bug ? 'Edit Bug' : 'Report Bug'}</h2>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#21262D] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[var(--text-primary)]">Bug Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Memory leak in data processing pipeline" required className="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[var(--text-primary)]">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the bug, steps to reproduce, and expected behavior..." rows={4} className="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none font-mono text-xs" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[var(--text-primary)]">Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value as Bug['status'])} className="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">
                    {BUG_STATUSES.map(s => (
                      <option key={s} value={s}>{s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[var(--text-primary)]">Priority</label>
                  <select value={priority} onChange={e => setPriority(e.target.value as Bug['priority'])} className="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">
                    {PRIORITIES.map(p => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[var(--text-primary)]">Project</label>
                  <select value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[var(--text-primary)]">Assignee</label>
                  <select value={assignee} onChange={e => setAssignee(e.target.value)} className="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500">
                    <option value="">Unassigned</option>
                    {assigneeOptions.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[var(--text-primary)]">Due Date</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[var(--text-primary)]">Labels</label>
                <div className="flex flex-wrap gap-1.5">
                  {labelOptions.map(l => (
                    <button type="button" key={l} onClick={() => toggleLabel(l)} className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-all ${labels.includes(l) ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-[#21262D] text-[var(--text-tertiary)] border-transparent hover:border-[var(--border-primary)]'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[var(--text-primary)]">Screenshot / Attachment</label>
                <div className="border-2 border-dashed border-[var(--border-primary)] rounded-lg p-8 text-center hover:border-blue-500/50 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 text-[var(--text-tertiary)] mx-auto mb-2" />
                  <p className="text-sm text-[var(--text-tertiary)]">Drop files here or click to upload</p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">PNG, JPG, GIF up to 10MB</p>
                </div>
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {attachments.map((a, i) => (
                      <div key={i} className="px-2.5 py-1 rounded-md bg-[#21262D] text-xs text-[var(--text-secondary)] flex items-center gap-1">
                        {a} <button type="button" onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300"><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border-primary)]">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit">{bug ? 'Save Changes' : 'Create Bug'}</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
