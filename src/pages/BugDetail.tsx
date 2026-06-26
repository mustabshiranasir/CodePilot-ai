import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Tag, Clock, Trash2, Pencil, Paperclip, AlertTriangle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { BugModal } from '../components/bugs/BugModal';
import { useData } from '../contexts/DataContext';
import { useToast } from '../components/ui/Toast';
import { formatDate, formatTimeAgo, getPriorityBg } from '../lib/utils';

export default function BugDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bugs, projects, updateBug, deleteBug } = useData();
  const { addToast } = useToast();
  const [showEdit, setShowEdit] = useState(false);

  const bug = bugs.find(b => b.id === id);
  const project = bug ? projects.find(p => p.id === bug.projectId) : undefined;

  if (!bug) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="h-12 w-12 text-[var(--text-tertiary)] mx-auto mb-4" />
        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">Bug not found</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">The bug you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/dashboard/bugs')}>Back to Bugs</Button>
      </div>
    );
  }

  const handleDelete = () => {
    deleteBug(bug.id);
    addToast('success', 'Bug deleted successfully');
    navigate('/dashboard/bugs');
  };

  const handleEdit = (data: any) => {
    updateBug(bug.id, data);
    addToast('success', 'Bug updated successfully');
  };

  const handleStatusChange = (newStatus: string) => {
    updateBug(bug.id, { status: newStatus as any });
    addToast('success', `Bug moved to ${newStatus.replace('_', ' ')}`);
  };

  return (
    <div>
      <button onClick={() => navigate('/dashboard/bugs')} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Bugs
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-mono text-[var(--text-tertiary)] bg-[#21262D] px-2 py-0.5 rounded">BUG-{bug.id}</span>
                  <Badge value={bug.status} variant="status" />
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${getPriorityBg(bug.priority)}`}>
                    {bug.priority}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">{bug.title}</h1>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setShowEdit(true)}>
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
                <Button variant="danger" size="sm" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">Description</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{bug.description}</p>
                </div>

                {bug.labels.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2 flex items-center gap-2"><Tag className="h-4 w-4" /> Labels</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {bug.labels.map(l => (
                        <span key={l} className="px-2.5 py-1 rounded-md text-xs font-mono bg-[#21262D] text-[var(--text-tertiary)] border border-[var(--border-primary)]">{l}</span>
                      ))}
                    </div>
                  </div>
                )}

                {bug.attachments.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2 flex items-center gap-2"><Paperclip className="h-4 w-4" /> Attachments</h3>
                    <div className="space-y-2">{bug.attachments.map((a, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#21262D] text-sm text-[var(--text-secondary)]">{a}</div>
                    ))}</div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-[var(--text-tertiary)]" />
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)]">Assignee</p>
                      <p className="text-sm text-[var(--text-primary)]">{bug.assignee || 'Unassigned'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-[var(--text-tertiary)]" />
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)]">Due Date</p>
                      <p className="text-sm text-[var(--text-primary)]">{bug.dueDate ? formatDate(bug.dueDate) : 'No due date'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Tag className="h-4 w-4 text-[var(--text-tertiary)]" />
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)]">Project</p>
                      <p className="text-sm text-[var(--text-primary)]">{project?.name || 'Unknown'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-[var(--text-tertiary)]" />
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)]">Created</p>
                      <p className="text-sm text-[var(--text-primary)]">{formatTimeAgo(bug.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-[var(--text-tertiary)]" />
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)]">Reporter</p>
                      <p className="text-sm text-[var(--text-primary)]">{bug.reporter}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)]">
                  <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">Move to</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {['todo', 'in_progress', 'testing', 'resolved', 'closed'].map(s => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        disabled={bug.status === s}
                        className={`px-2.5 py-1 text-xs rounded-md border transition-all font-mono ${
                          bug.status === s
                            ? 'border-blue-500/30 bg-blue-500/10 text-blue-400 cursor-not-allowed'
                            : 'border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-blue-500/30 hover:text-blue-400'
                        }`}
                      >
                        {s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <BugModal isOpen={showEdit} onClose={() => setShowEdit(false)} onSubmit={handleEdit} bug={bug} />
    </div>
  );
}
