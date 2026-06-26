import { Card } from '../components/ui/Card';
import { StatsCardSkeleton } from '../components/ui/Skeleton';
import { WelcomeSection } from '../components/dashboard/WelcomeSection';
import { StatsCards } from '../components/dashboard/StatsCards';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { useData } from '../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cpu, Shield, Bug, BarChart3, Users, ArrowRight, Clock, TrendingUp } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export default function Dashboard() {
  const { repositories, scans, issues, loading, error } = useData();
  const navigate = useNavigate();

  const quickLinks = [
    { label: 'Run New Scan', icon: Cpu, desc: 'Analyze code for issues', path: '/dashboard/projects', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'View Issues', icon: Bug, desc: `${issues.filter(i => i.status !== 'resolved' && i.status !== 'closed').length} unresolved`, path: '/dashboard/bugs', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Analytics', icon: BarChart3, desc: 'Code quality & metrics', path: '/dashboard/analytics', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Team', icon: Users, desc: 'Manage collaborators', path: '/dashboard/team', color: 'text-green-400', bg: 'bg-green-500/10' },
  ];

  const loadingSkeleton = (
    <div>
      <div className="mb-8 space-y-2">
        <div className="h-8 w-64 bg-gradient-to-r from-[#21262D] via-[#30363D] to-[#21262D] rounded animate-pulse bg-[length:200%_100%]" />
        <div className="h-4 w-96 bg-gradient-to-r from-[#21262D] via-[#30363D] to-[#21262D] rounded animate-pulse bg-[length:200%_100%]" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {Array.from({ length: 6 }).map((_, i) => <StatsCardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-[var(--border-primary)] p-6">
            <div className="h-6 w-32 bg-[#21262D] rounded animate-pulse mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-[#21262D] rounded animate-pulse" />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return loadingSkeleton;

  if (error) {
    return (
      <div className="text-center py-16">
        <Shield className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-400 text-lg font-medium">Failed to load dashboard data</p>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">Check your Supabase connection and try again</p>
      </div>
    );
  }

  const latestScan = scans[0];
  const recentIssues = issues.slice(0, 5);
  const resolved = issues.filter(i => i.status === 'resolved' || i.status === 'closed').length;
  const totalScore = scans.length > 0
    ? Math.round(scans.reduce((s, scan) => s + (Number.isFinite(Number(scan.codeQualityScore)) ? Number(scan.codeQualityScore) : 0) + (Number.isFinite(Number(scan.securityScore)) ? Number(scan.securityScore) : 0) + (Number.isFinite(Number(scan.performanceScore)) ? Number(scan.performanceScore) : 0), 0) / (scans.length * 3))
    : 0;

  return (
    <div className="space-y-6">
      <WelcomeSection />
      <StatsCards stats={{
        totalRepositories: repositories.length,
        totalScans: scans.length,
        totalIssues: issues.length,
        resolvedIssues: resolved,
        criticalIssues: issues.filter(i => i.severity === 'critical').length,
        codeQualityScore: scans.length > 0 ? Math.round(scans.reduce((s, scan) => s + (Number.isFinite(Number(scan.codeQualityScore)) ? Number(scan.codeQualityScore) : 0), 0) / scans.length) : 0,
        securityScore: scans.length > 0 ? Math.round(scans.reduce((s, scan) => s + (Number.isFinite(Number(scan.securityScore)) ? Number(scan.securityScore) : 0), 0) / scans.length) : 0,
        performanceScore: scans.length > 0 ? Math.round(scans.reduce((s, scan) => s + (Number.isFinite(Number(scan.performanceScore)) ? Number(scan.performanceScore) : 0), 0) / scans.length) : 0,
      }} />

      {scans.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="p-5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-500" />
            <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500/10 to-transparent blur-xl" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-7 w-7 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] font-mono">PROJECT HEALTH OVERVIEW</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-3xl font-bold text-[var(--text-primary)] font-mono">{totalScore}%</span>
                    <Badge value={totalScore >= 80 ? 'Good' : totalScore >= 50 ? 'Needs Work' : 'Poor'} variant="status" />
                    <span className="text-xs text-[var(--text-tertiary)] font-mono hidden sm:inline">· {scans.length} scan{scans.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {(['code_quality', 'security', 'performance'] as const).map((t) => {
                  const score = t === 'code_quality' ? latestScan?.codeQualityScore : t === 'security' ? latestScan?.securityScore : latestScan?.performanceScore;
                  const safe = Number.isFinite(Number(score)) ? Number(score) : 0;
                  return (
                    <div key={t} className="px-3 py-2 rounded-lg bg-[#21262D] text-center min-w-[80px] border border-transparent hover:border-blue-500/20 transition-all">
                      <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">{t.replace('_', ' ')}</p>
                      <p className="text-base font-mono font-bold mt-0.5" style={{ color: safe >= 80 ? '#22c55e' : safe >= 50 ? '#eab308' : '#ef4444' }}>{safe}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>

        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-blue-400" /> Quick Actions
              </h3>
              <div className="space-y-1">
                {quickLinks.map(link => (
                  <button key={link.label} onClick={() => navigate(link.path)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-[#21262D] transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg ${link.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <link.icon className={`h-4 w-4 ${link.color}`} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-[var(--text-primary)]">{link.label}</p>
                        <p className="text-[10px] text-[var(--text-tertiary)]">{link.desc}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>

          {recentIssues.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                  <Bug className="h-4 w-4 text-yellow-400" /> Recent Issues
                </h3>
                <div className="space-y-1">
                  {recentIssues.map(issue => (
                    <div key={issue.id} onClick={() => navigate(`/dashboard/bugs/${issue.id}`)}
                      className="p-2.5 rounded-lg hover:bg-[#21262D] cursor-pointer transition-colors">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge value={issue.severity} variant="severity" />
                        <p className="text-sm text-[var(--text-primary)] truncate flex-1">{issue.title}</p>
                      </div>
                      <p className="text-[11px] text-[var(--text-tertiary)] ml-0.5 truncate">{issue.filePath}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" /> Issue Resolution
              </h3>
              {issues.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-tertiary)]">Resolved</span>
                    <span className="text-green-400 font-mono font-bold">{resolved}/{issues.length}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#21262D] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(resolved / issues.length * 100)}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 rounded-lg bg-[#21262D] text-center">
                      <p className="text-[10px] text-[var(--text-tertiary)]">In Progress</p>
                      <p className="text-sm font-mono font-bold text-blue-400">{issues.filter(i => i.status === 'assigned' || i.status === 'in_progress' || i.status === 'testing').length}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#21262D] text-center">
                      <p className="text-[10px] text-[var(--text-tertiary)]">Open</p>
                      <p className="text-sm font-mono font-bold text-yellow-400">{issues.filter(i => i.status === 'detected').length}</p>
                    </div>
                  </div>
                  {(issues.filter(i => i.severity === 'critical' && i.status !== 'resolved' && i.status !== 'closed').length > 0 ||
                    issues.filter(i => i.severity === 'high' && i.status !== 'resolved' && i.status !== 'closed').length > 0) && (
                    <div className="pt-1 space-y-1.5 border-t border-[var(--border-secondary)]">
                      <p className="text-[10px] text-[var(--text-tertiary)] font-medium">UNRESOLVED BY SEVERITY</p>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-[var(--text-tertiary)]">Critical</span>
                        <span className="text-red-400 font-mono">{issues.filter(i => i.severity === 'critical' && i.status !== 'resolved' && i.status !== 'closed').length}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-[var(--text-tertiary)]">High</span>
                        <span className="text-orange-400 font-mono">{issues.filter(i => i.severity === 'high' && i.status !== 'resolved' && i.status !== 'closed').length}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Clock className="h-8 w-8 text-[var(--text-tertiary)] mx-auto mb-2" />
                  <p className="text-xs text-[var(--text-tertiary)]">No issues yet. Run a scan to get started.</p>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
