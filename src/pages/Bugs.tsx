import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Bug, ArrowUpDown, Filter } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { TableRowSkeleton } from '../components/ui/Skeleton';
import { formatDate, getPriorityColor } from '../lib/utils';
import type { Bug as BugType } from '../types';

const mockBugs: BugType[] = [
  { id: '1424', title: 'Memory leak in data processing pipeline', description: '', status: 'open', priority: 'critical', projectId: '1', assignee: 'Marcus J.', createdAt: '2026-06-24', updatedAt: '2026-06-24' },
  { id: '1423', title: 'Token expiration not handled gracefully', description: '', status: 'in_progress', priority: 'high', projectId: '1', assignee: 'Sarah K.', createdAt: '2026-06-23', updatedAt: '2026-06-24' },
  { id: '1422', title: 'UI glitch on mobile navigation drawer', description: '', status: 'open', priority: 'medium', projectId: '3', assignee: 'Emily R.', createdAt: '2026-06-22', updatedAt: '2026-06-23' },
  { id: '1421', title: 'API rate limiting not working for authenticated routes', description: '', status: 'resolved', priority: 'high', projectId: '2', assignee: 'Marcus J.', createdAt: '2026-06-20', updatedAt: '2026-06-22' },
  { id: '1420', title: 'CSS overflow in settings panel', description: '', status: 'closed', priority: 'low', projectId: '1', assignee: undefined, createdAt: '2026-06-18', updatedAt: '2026-06-21' },
  { id: '1419', title: 'WebSocket connection drops after 5 minutes', description: '', status: 'in_progress', priority: 'critical', projectId: '2', assignee: 'Alex C.', createdAt: '2026-06-17', updatedAt: '2026-06-20' },
  { id: '1418', title: 'Database connection pool exhaustion', description: '', status: 'resolved', priority: 'critical', projectId: '5', assignee: 'David W.', createdAt: '2026-06-15', updatedAt: '2026-06-19' },
];

const statusFilters = ['all', 'open', 'in_progress', 'resolved', 'closed'];

export default function Bugs() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const filtered = filter === 'all' ? mockBugs : mockBugs.filter(b => b.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Bugs</h1>
          <p className="text-[var(--text-secondary)]">Track and manage reported bugs</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" /> Report Bug
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between">
          <div className="flex gap-1">
            {statusFilters.map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  filter === s
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[#21262D]'
                }`}
              >
                {s === 'all' ? 'All' : s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm"><Filter className="h-4 w-4" /> Filter</Button>
            <Button variant="ghost" size="sm"><ArrowUpDown className="h-4 w-4" /> Sort</Button>
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <TableRowSkeleton rows={7} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-primary)]">
                  <th className="text-left p-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Bug</th>
                  <th className="text-left p-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
                  <th className="text-left p-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Priority</th>
                  <th className="text-left p-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Assignee</th>
                  <th className="text-left p-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Created</th>
                  <th className="text-right p-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">ID</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((bug, index) => (
                  <motion.tr
                    key={bug.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-[var(--border-secondary)] hover:bg-[#21262D]/50 transition-colors cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Bug className={`h-4 w-4 ${getPriorityColor(bug.priority)}`} />
                        <span className="text-sm text-[var(--text-primary)] font-medium">{bug.title}</span>
                      </div>
                    </td>
                    <td className="p-4"><Badge value={bug.status} variant="status" /></td>
                    <td className="p-4"><Badge value={bug.priority} variant="priority" /></td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">{bug.assignee || '—'}</td>
                    <td className="p-4 text-sm text-[var(--text-tertiary)]">{formatDate(bug.createdAt)}</td>
                    <td className="p-4 text-right text-sm text-[var(--text-tertiary)] font-mono">#{bug.id}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
