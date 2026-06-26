import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Cpu, CheckCircle2, AlertTriangle, TrendingUp, Bug, Clock, Users, BarChart3, GitBranch, Award } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { useData } from '../contexts/DataContext';
import { cn } from '../lib/utils';

function safe(val: any, fallback = 0) {
  const n = Number(val);
  return Number.isFinite(n) ? Math.round(n) : fallback;
}

function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return '—'; }
}

function formatDateTime(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return '—'; }
}

function ScoreBar({ value, label, sub }: { value: number; label: string; sub?: string; color?: string }) {
  const v = Math.min(100, Math.max(0, value));
  const barColor = v >= 80 ? 'bg-green-500' : v >= 50 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span className="text-[var(--text-primary)] font-mono font-bold">{v}/100</span>
      </div>
      {sub && <p className="text-[10px] text-[var(--text-tertiary)] mb-1.5">{sub}</p>}
      <div className="h-2 rounded-full bg-[#21262D] overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} className={cn('h-full rounded-full', barColor)} />
      </div>
    </div>
  );
}

export default function Analytics() {
  const { scans, issues, loading } = useData();

  const metrics = useMemo(() => {
    const total = issues.length;
    const resolved = issues.filter(i => i.status === 'resolved' || i.status === 'closed').length;
    const critical = issues.filter(i => i.severity === 'critical').length;
    const high = issues.filter(i => i.severity === 'high').length;
    const scanned = scans.filter(s => s.status === 'completed');
    const scanCount = scanned.length;

    const calcAvg = (key: 'codeQualityScore' | 'securityScore' | 'performanceScore'): number => {
      if (scanCount === 0) return 0;
      const sum = scanned.reduce((acc, s) => acc + safe(s[key]), 0);
      return Math.round(sum / scanCount);
    };

    const codeQuality = calcAvg('codeQualityScore');
    const security = calcAvg('securityScore');
    const performance = calcAvg('performanceScore');

    // Architecture score: based on issue type distribution + import structure
    const archIssues = issues.filter(i => i.type === 'architecture').length;
    const totalArchPenalty = Math.min(archIssues * 5, 40);
    const architectureScore = Math.max(0, 100 - totalArchPenalty);

    // Technical debt score: weighted by severity and type
    const debtWeights = { critical: 15, high: 8, medium: 4, low: 1 };
    const debtTotal = issues.reduce((acc, i) => acc + (debtWeights[i.severity as keyof typeof debtWeights] || 1), 0);
    const techDebt = Math.min(100, Math.round((debtTotal / Math.max(total, 1)) * 10));

    // Bug density: issues per scan file
    const totalFilesScanned = scanned.reduce((acc, s) => acc + safe(s.totalFiles), 0);
    const bugDensity = totalFilesScanned > 0 ? +((total / totalFilesScanned) * 100).toFixed(1) : 0;

    // Resolution time: avg hours to resolve
    const resolvedIssuesWithTime = issues.filter(i => (i.status === 'resolved' || i.status === 'closed') && i.createdAt && i.updatedAt);
    let avgResolutionHours = 0;
    if (resolvedIssuesWithTime.length > 0) {
      const totalHours = resolvedIssuesWithTime.reduce((acc, i) => {
        const created = new Date(i.createdAt).getTime();
        const updated = new Date(i.updatedAt).getTime();
        if (!Number.isNaN(created) && !Number.isNaN(updated) && updated > created) {
          return acc + (updated - created) / (1000 * 60 * 60);
        }
        return acc;
      }, 0);
      avgResolutionHours = Math.round(totalHours / resolvedIssuesWithTime.length);
    }

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    return {
      total, resolved, critical, high, scanCount, codeQuality, security, performance,
      architectureScore, techDebt, bugDensity, avgResolutionHours, resolutionRate, totalFilesScanned, scanned,
    };
  }, [issues, scans]);

  if (loading) {
    return (
      <div>
        <div className="mb-8 space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-64" /></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}</div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  const issuesBySeverity = [
    { label: 'Critical', count: issues.filter(i => i.severity === 'critical').length, color: 'bg-red-500' },
    { label: 'High', count: issues.filter(i => i.severity === 'high').length, color: 'bg-orange-500' },
    { label: 'Medium', count: issues.filter(i => i.severity === 'medium').length, color: 'bg-yellow-500' },
    { label: 'Low', count: issues.filter(i => i.severity === 'low').length, color: 'bg-green-500' },
  ];
  const maxSeverity = Math.max(...issuesBySeverity.map(s => s.count), 1);

  const issuesByType = [
    { label: 'Code Quality', count: issues.filter(i => i.type === 'code_quality').length, color: 'bg-blue-500' },
    { label: 'Security', count: issues.filter(i => i.type === 'security').length, color: 'bg-red-500' },
    { label: 'Performance', count: issues.filter(i => i.type === 'performance').length, color: 'bg-yellow-500' },
    { label: 'Architecture', count: issues.filter(i => i.type === 'architecture').length, color: 'bg-purple-500' },
  ];
  const maxType = Math.max(...issuesByType.map(t => t.count), 1);

  const assignees = [...new Set(issues.filter(i => i.assignee && i.assignee !== 'Unassigned').map(i => i.assignee))];
  const teamPerformance = assignees.map(name => {
    const assigned = issues.filter(i => i.assignee === name).length;
    const resolved = issues.filter(i => i.assignee === name && (i.status === 'resolved' || i.status === 'closed')).length;
    return { name, assigned, resolved, rate: assigned > 0 ? Math.round((resolved / assigned) * 100) : 0 };
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Analytics</h1>
        <p className="text-[var(--text-secondary)] text-sm">Code quality metrics, security scores, and team performance</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Scans', value: metrics.scanCount, icon: Cpu, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Issues Found', value: metrics.total, icon: Bug, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { label: 'Resolved', value: metrics.resolved, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
            { label: 'Resolution Rate', value: `${metrics.resolutionRate}%`, icon: TrendingUp, color: metrics.resolutionRate >= 70 ? 'text-green-400' : 'text-orange-400', bg: metrics.resolutionRate >= 70 ? 'bg-green-500/10' : 'bg-orange-500/10' },
          ].map((metric, index) => (
            <motion.div key={metric.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + index * 0.03 }}>
              <Card className="p-5 group hover:border-blue-500/20 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110', metric.bg)}>
                    <metric.icon className={cn('h-5 w-5', metric.color)} />
                  </div>
                  <span className="text-2xl font-bold text-[var(--text-primary)] font-mono">{metric.value}</span>
                </div>
                <p className="text-xs text-[var(--text-tertiary)]">{metric.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
            <Award className="h-4 w-4 text-blue-400" /> Project Health Score
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ScoreBar value={metrics.codeQuality} label="Code Quality" sub={`${issues.filter(i => i.type === 'code_quality').length} code issues`} color="bg-blue-500" />
            <ScoreBar value={metrics.security} label="Security" sub={`${issues.filter(i => i.type === 'security').length} security issues`} color="bg-red-500" />
            <ScoreBar value={metrics.performance} label="Performance" sub={`${issues.filter(i => i.type === 'performance').length} perf issues`} color="bg-yellow-500" />
            <ScoreBar value={metrics.architectureScore} label="Architecture" sub={`${issues.filter(i => i.type === 'architecture').length} arch issues`} color="bg-purple-500" />
            <ScoreBar value={Math.max(0, 100 - metrics.techDebt)} label="Technical Debt" sub={`Debt load: ${metrics.techDebt}%`} color="bg-orange-500" />
            <ScoreBar value={Math.max(0, 100 - Math.round(metrics.bugDensity * 5))} label="Bug Density" sub={`${metrics.bugDensity} bugs per 100 files`} color="bg-pink-500" />
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" /> Issues by Severity
            </h3>
            <div className="space-y-4">
              {issuesBySeverity.map(s => (
                <div key={s.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-[var(--text-secondary)]">{s.label}</span>
                    <span className="font-mono font-medium" style={{ color: s.count > 0 ? undefined : 'var(--text-tertiary)' }}>{s.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#21262D] overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(s.count / maxSeverity) * 100}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} className={cn('h-full rounded-full', s.color)} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-400" /> Issues by Type
            </h3>
            <div className="space-y-4">
              {issuesByType.map(t => (
                <div key={t.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-[var(--text-secondary)]">{t.label}</span>
                    <span className="font-mono font-medium" style={{ color: t.count > 0 ? undefined : 'var(--text-tertiary)' }}>{t.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#21262D] overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(t.count / maxType) * 100}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} className={cn('h-full rounded-full', t.color)} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-400" /> Issue Resolution
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-[#21262D] text-center">
                <p className="text-2xl font-bold font-mono text-green-400">{metrics.resolved}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Resolved</p>
              </div>
              <div className="p-4 rounded-xl bg-[#21262D] text-center">
                <p className="text-2xl font-bold font-mono text-blue-400">{metrics.total - metrics.resolved}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Open</p>
              </div>
              <div className="p-4 rounded-xl bg-[#21262D] text-center">
                <p className="text-2xl font-bold font-mono text-orange-400">{metrics.avgResolutionHours}h</p>
                <p className="text-xs text-[var(--text-tertiary)]">Avg resolution</p>
              </div>
              <div className="p-4 rounded-xl bg-[#21262D] text-center">
                <p className="text-2xl font-bold font-mono text-purple-400">{metrics.resolutionRate}%</p>
                <p className="text-xs text-[var(--text-tertiary)]">Completion rate</p>
              </div>
            </div>
            <div className="h-3 rounded-full bg-[#21262D] overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${metrics.resolutionRate}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400" />
            </div>
            <div className="flex justify-between text-xs text-[var(--text-tertiary)] mt-1">
              <span>0%</span>
              <span>{metrics.resolved}/{metrics.total} issues</span>
              <span>100%</span>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-400" /> Team Performance
            </h3>
            {teamPerformance.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-8 w-8 text-[var(--text-tertiary)] mx-auto mb-2" />
                <p className="text-sm text-[var(--text-tertiary)]">No team performance data available</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">Assign issues to team members to see metrics</p>
              </div>
            ) : (
              <div className="space-y-4">
                {teamPerformance.map((t, i) => (
                  <motion.div key={t.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="p-3 rounded-xl bg-[#21262D]/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[var(--text-primary)]">{t.name}</span>
                      <span className="text-xs font-mono text-[var(--text-tertiary)]">{t.assigned} assigned · {t.resolved} done</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-[#21262D] overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${t.rate}%` }} transition={{ duration: 0.8 }}
                          className={cn('h-full rounded-full', t.rate >= 70 ? 'bg-green-500' : t.rate >= 40 ? 'bg-yellow-500' : 'bg-red-500')} />
                      </div>
                      <span className="text-xs font-mono font-bold" style={{ color: t.rate >= 70 ? '#22c55e' : t.rate >= 40 ? '#eab308' : '#ef4444' }}>{t.rate}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-blue-400" /> Scan History
            </h3>
            <span className="text-xs text-[var(--text-tertiary)]">{scans.length} scan{scans.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-primary)]">
                  <th className="text-left p-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Date</th>
                  <th className="text-left p-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Files</th>
                  <th className="text-left p-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Issues</th>
                  <th className="text-left p-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Quality</th>
                  <th className="text-left p-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Security</th>
                  <th className="text-left p-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Performance</th>
                  <th className="text-left p-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Duration</th>
                  <th className="text-left p-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {scans.length === 0 ? (
                  <tr><td colSpan={8} className="p-6 text-center text-sm text-[var(--text-tertiary)]">No scans yet. Connect a repository and run a scan.</td></tr>
                ) : (
                  scans.map((scan, i) => {
                    const started = scan.startedAt ? new Date(scan.startedAt).getTime() : 0;
                    const completed = scan.completedAt ? new Date(scan.completedAt).getTime() : 0;
                    const durationMs = completed > started ? completed - started : 0;
                    const duration = durationMs > 0 ? `${Math.round(durationMs / 1000)}s` : '—';
                    return (
                      <motion.tr key={scan.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b border-[var(--border-secondary)] hover:bg-[#21262D]/30 transition-colors">
                        <td className="p-3 text-sm text-[var(--text-primary)] font-mono text-xs">{formatDateTime(scan.createdAt)}</td>
                        <td className="p-3 text-sm text-[var(--text-secondary)] font-mono">{safe(scan.totalFiles)}</td>
                        <td className="p-3 text-sm text-[var(--text-secondary)] font-mono">{safe(scan.totalIssues)}</td>
                        <td className="p-3"><span className="font-mono text-xs">{Math.min(100, safe(scan.codeQualityScore))}/100</span></td>
                        <td className="p-3"><span className="font-mono text-xs">{Math.min(100, safe(scan.securityScore))}/100</span></td>
                        <td className="p-3"><span className="font-mono text-xs">{Math.min(100, safe(scan.performanceScore))}/100</span></td>
                        <td className="p-3 text-sm text-[var(--text-tertiary)] font-mono text-xs">{duration}</td>
                        <td className="p-3"><Badge value={scan.status} variant="status" /></td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {scans.length >= 2 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-400" /> Score Trend (Last 5 Scans)
            </h3>
            <div className="space-y-3">
              {scans.slice(0, 5).reverse().map(scan => (
                <div key={scan.id} className="flex items-center gap-4 text-xs">
                  <span className="w-24 text-[var(--text-tertiary)] font-mono shrink-0">{formatDate(scan.createdAt)}</span>
                  <div className="flex-1 h-6 rounded bg-[#21262D] flex overflow-hidden">
                    <div className="h-full bg-blue-500/80 flex items-center justify-center text-[10px] text-white font-mono" style={{ width: `${Math.min(100, safe(scan.codeQualityScore))}%` }}>
                      {safe(scan.codeQualityScore) > 15 ? `${safe(scan.codeQualityScore)}` : ''}
                    </div>
                  </div>
                  <div className="flex-1 h-6 rounded bg-[#21262D] flex overflow-hidden">
                    <div className="h-full bg-red-500/80 flex items-center justify-center text-[10px] text-white font-mono" style={{ width: `${Math.min(100, safe(scan.securityScore))}%` }}>
                      {safe(scan.securityScore) > 15 ? `${safe(scan.securityScore)}` : ''}
                    </div>
                  </div>
                  <div className="flex-1 h-6 rounded bg-[#21262D] flex overflow-hidden">
                    <div className="h-full bg-yellow-500/80 flex items-center justify-center text-[10px] text-white font-mono" style={{ width: `${Math.min(100, safe(scan.performanceScore))}%` }}>
                      {safe(scan.performanceScore) > 15 ? `${safe(scan.performanceScore)}` : ''}
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-4 text-[10px] text-[var(--text-tertiary)]">
                <span className="w-24" />
                <span className="flex-1 text-center">Code Quality</span>
                <span className="flex-1 text-center">Security</span>
                <span className="flex-1 text-center">Performance</span>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
