import { useState } from 'react';
import { Search, Bug, AlertTriangle, MapPin } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { useData } from '../contexts/DataContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatTimeAgo } from '../lib/utils';
import { motion } from 'framer-motion';
import { SEVERITY_COLORS } from '../types';

function extractLineNumber(desc: string): number | null {
  const m = desc.match(/line\s+(\d+)/i);
  return m ? parseInt(m[1]) : null;
}

const severityFilters = ['all', 'critical', 'high', 'medium', 'low'] as const;
const typeFilters = ['all', 'code_quality', 'security', 'performance', 'architecture'] as const;
const statusFilters = ['all', 'detected', 'assigned', 'in_progress', 'testing', 'resolved', 'closed'] as const;

export default function Bugs() {
  const { issues, loading } = useData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const repoFilter = searchParams.get('repo');

  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState(repoFilter ? '' : '');

  let filtered = issues;
  if (repoFilter) filtered = filtered.filter(i => i.repositoryId === repoFilter);
  filtered = filtered.filter(i => {
    if (severityFilter !== 'all' && i.severity !== severityFilter) return false;
    if (typeFilter !== 'all' && i.type !== typeFilter) return false;
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    if (search && !i.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeFilters = [severityFilter !== 'all', typeFilter !== 'all', statusFilter !== 'all', search !== ''].filter(Boolean).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Issues</h1>
          <p className="text-[var(--text-secondary)]">AI-detected code issues from automated scans</p>
        </div>
      </div>

      <Card className="mb-6">
        <div className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
              <input type="text" placeholder="Search issues..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[var(--text-tertiary)] font-mono">Severity:</span>
            {severityFilters.map(s => (
              <button key={s} onClick={() => setSeverityFilter(s)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${severityFilter === s ? 'bg-blue-500/10 text-blue-400' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[#21262D]'}`}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
            <span className="h-4 w-px bg-[var(--border-primary)] mx-1" />
            <span className="text-xs text-[var(--text-tertiary)] font-mono">Type:</span>
            {typeFilters.map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${typeFilter === t ? 'bg-blue-500/10 text-blue-400' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[#21262D]'}`}>
                {t === 'all' ? 'All' : t.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
            <span className="h-4 w-px bg-[var(--border-primary)] mx-1" />
            <span className="text-xs text-[var(--text-tertiary)] font-mono">Status:</span>
            {statusFilters.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${statusFilter === s ? 'bg-blue-500/10 text-blue-400' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[#21262D]'}`}>
                {s === 'all' ? 'All' : s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
            {activeFilters > 0 && (
              <button onClick={() => { setSeverityFilter('all'); setTypeFilter('all'); setStatusFilter('all'); setSearch(''); }}
                className="px-2.5 py-1 text-xs text-red-400 hover:bg-red-500/10 rounded-md transition-colors">Clear ({activeFilters})</button>
            )}
          </div>
        </div>
      </Card>

      {loading ? (
        <Card>
          <div className="p-6">
            <div className="space-y-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <Skeleton className="h-4 w-8" /><Skeleton className="h-4 w-64" /><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Bug className="h-12 w-12 text-[var(--text-tertiary)] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">No issues found</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">{activeFilters > 0 ? 'Try adjusting your filters.' : 'Run a scan to detect code issues.'}</p>
          <Button onClick={() => navigate('/dashboard/projects')}>Run a Scan</Button>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-primary)]">
                  <th className="text-left p-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Issue</th>
                  <th className="text-left p-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Line</th>
                  <th className="text-left p-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Severity</th>
                  <th className="text-left p-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Type</th>
                  <th className="text-left p-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
                  <th className="text-left p-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Assignee</th>
                  <th className="text-left p-4 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Found</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((issue, index) => (
                  <motion.tr key={issue.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.02 }}
                    onClick={() => navigate(`/dashboard/bugs/${issue.id}`)}
                    className="border-b border-[var(--border-secondary)] hover:bg-[#21262D]/50 transition-colors cursor-pointer">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`h-4 w-4 shrink-0 ${issue.severity === 'critical' ? 'text-red-400' : issue.severity === 'high' ? 'text-orange-400' : issue.severity === 'medium' ? 'text-yellow-400' : 'text-green-400'}`} />
                        <span className="text-sm text-[var(--text-primary)] font-medium truncate max-w-[280px]">{issue.title}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {(() => { const ln = extractLineNumber(issue.description); return ln ? <span className="inline-flex items-center gap-1 text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded"><MapPin className="h-3 w-3" />{ln}</span> : <span className="text-xs text-[var(--text-tertiary)]">—</span>; })()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${SEVERITY_COLORS[issue.severity] || 'bg-gray-500/10 text-gray-400'}`}>
                        {issue.severity}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">{issue.type.replace('_', ' ')}</td>
                    <td className="p-4"><Badge value={issue.status} variant="status" /></td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">{issue.assignee}</td>
                    <td className="p-4 text-sm text-[var(--text-tertiary)]">{formatTimeAgo(issue.createdAt)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
