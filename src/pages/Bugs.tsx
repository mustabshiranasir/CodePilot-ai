import { useState, useEffect } from 'react';
import { Plus, Search, LayoutGrid, List, Bug } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { BugModal } from '../components/bugs/BugModal';
import { KanbanBoard } from '../components/bugs/KanbanBoard';
import { useData } from '../contexts/DataContext';
import { useToast } from '../components/ui/Toast';
import { useNavigate } from 'react-router-dom';
import { formatDate, getPriorityColor, getPriorityBg } from '../lib/utils';
import { motion } from 'framer-motion';

const statusFilters = ['all', 'todo', 'in_progress', 'testing', 'resolved', 'closed'] as const;
const priorityFilters = ['all', 'critical', 'high', 'medium', 'low'] as const;

export default function Bugs() {
  const { bugs, projects, addBug } = useData();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const assignees = [...new Set(bugs.map(b => b.assignee))];
  const activeFilters = [statusFilter !== 'all', priorityFilter !== 'all', assigneeFilter !== 'all', projectFilter !== 'all', search !== ''].filter(Boolean).length;

  const filtered = bugs.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && b.priority !== priorityFilter) return false;
    if (assigneeFilter !== 'all' && b.assignee !== assigneeFilter) return false;
    if (projectFilter !== 'all' && b.projectId !== projectFilter) return false;
    if (search && !b.title.toLowerCase().includes(search.toLowerCase()) && !b.id.includes(search)) return false;
    return true;
  });

  const handleCreate = (data: any) => {
    addBug(data);
    addToast('success', 'Bug created successfully');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Bugs</h1>
          <p className="text-[var(--text-secondary)]">Track and manage reported bugs</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-[var(--border-primary)] overflow-hidden">
            <button
              onClick={() => setView('list')}
              className={`p-2 transition-colors ${view === 'list' ? 'bg-blue-500/10 text-blue-400' : 'text-[var(--text-tertiary)] hover:bg-[#21262D]'}`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`p-2 transition-colors ${view === 'kanban' ? 'bg-blue-500/10 text-blue-400' : 'text-[var(--text-tertiary)] hover:bg-[#21262D]'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" /> Report Bug
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <div className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
              <input
                type="text"
                placeholder="Search by title or ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              />
            </div>
            <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50">
              <option value="all">All Projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)} className="rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50">
              <option value="all">All Assignees</option>
              {assignees.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[var(--text-tertiary)] font-mono">Status:</span>
            {statusFilters.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  statusFilter === s
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[#21262D]'
                }`}
              >
                {s === 'all' ? 'All' : s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
            <span className="h-4 w-px bg-[var(--border-primary)] mx-1" />
            <span className="text-xs text-[var(--text-tertiary)] font-mono">Priority:</span>
            {priorityFilters.map(p => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  priorityFilter === p
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[#21262D]'
                }`}
              >
                {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
            {activeFilters > 0 && (
              <button
                onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); setAssigneeFilter('all'); setProjectFilter('all'); setSearch(''); }}
                className="px-2.5 py-1 text-xs text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
              >
                Clear ({activeFilters})
              </button>
            )}
          </div>
        </div>
      </Card>

      {loading ? (
        view === 'list' ? (
          <Card>
            <div className="p-6">
              <div className="space-y-3">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-[var(--border-primary)] p-4 space-y-3">
                <Skeleton className="h-5 w-24" />
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            ))}
          </div>
        )
      ) : view === 'kanban' ? (
        <KanbanBoard />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Bug className="h-12 w-12 text-[var(--text-tertiary)] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">No bugs found</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">{activeFilters > 0 ? 'Try adjusting your filters.' : 'No bugs have been reported yet.'}</p>
          <Button onClick={() => setShowModal(true)}><Plus className="h-4 w-4" /> Report Bug</Button>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-primary)]">
                  <th className="text-left p-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">ID</th>
                  <th className="text-left p-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Bug</th>
                  <th className="text-left p-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
                  <th className="text-left p-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Priority</th>
                  <th className="text-left p-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Assignee</th>
                  <th className="text-left p-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Due</th>
                  <th className="text-left p-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Labels</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((bug, index) => (
                  <motion.tr
                    key={bug.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => navigate(`/dashboard/bugs/${bug.id}`)}
                    className="border-b border-[var(--border-secondary)] hover:bg-[#21262D]/50 transition-colors cursor-pointer"
                  >
                    <td className="p-4 text-sm font-mono text-[var(--text-tertiary)]">#{bug.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Bug className={`h-4 w-4 ${getPriorityColor(bug.priority)}`} />
                        <span className="text-sm text-[var(--text-primary)] font-medium">{bug.title}</span>
                      </div>
                    </td>
                    <td className="p-4"><Badge value={bug.status} variant="status" /></td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${getPriorityBg(bug.priority)}`}>
                        {bug.priority}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">{bug.assignee}</td>
                    <td className="p-4 text-sm text-[var(--text-tertiary)]">{bug.dueDate ? formatDate(bug.dueDate) : '—'}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {bug.labels.slice(0, 2).map(l => (
                          <span key={l} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#21262D] text-[var(--text-tertiary)]">{l}</span>
                        ))}
                        {bug.labels.length > 2 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-[var(--text-tertiary)]">+{bug.labels.length - 2}</span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <BugModal isOpen={showModal} onClose={() => setShowModal(false)} onSubmit={handleCreate} />
    </div>
  );
}
