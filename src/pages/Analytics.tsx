import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bug, CheckCircle2, AlertTriangle, FolderKanban, Download } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { useData } from '../contexts/DataContext';
import { exportBugsCSV, exportProjectsCSV } from '../lib/export';

export default function Analytics() {
  const { projects, bugs } = useData();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const totalBugs = bugs.length;
  const openBugs = bugs.filter(b => b.status === 'todo' || b.status === 'in_progress').length;
  const resolvedBugs = bugs.filter(b => b.status === 'resolved' || b.status === 'closed').length;
  const activeProjects = projects.filter(p => p.status === 'active').length;

  const bugsByPriority = [
    { label: 'Critical', count: bugs.filter(b => b.priority === 'critical').length, color: 'bg-red-500' },
    { label: 'High', count: bugs.filter(b => b.priority === 'high').length, color: 'bg-orange-500' },
    { label: 'Medium', count: bugs.filter(b => b.priority === 'medium').length, color: 'bg-yellow-500' },
    { label: 'Low', count: bugs.filter(b => b.priority === 'low').length, color: 'bg-green-500' },
  ];
  const maxPriority = Math.max(...bugsByPriority.map(b => b.count), 1);

  const bugsByStatus = [
    { label: 'Todo', count: bugs.filter(b => b.status === 'todo').length, color: 'bg-gray-500' },
    { label: 'In Progress', count: bugs.filter(b => b.status === 'in_progress').length, color: 'bg-blue-500' },
    { label: 'Testing', count: bugs.filter(b => b.status === 'testing').length, color: 'bg-purple-500' },
    { label: 'Resolved', count: bugs.filter(b => b.status === 'resolved').length, color: 'bg-green-500' },
    { label: 'Closed', count: bugs.filter(b => b.status === 'closed').length, color: 'bg-gray-500' },
  ];

  const weeklyActivity = bugs.reduce<Record<string, { reported: number; resolved: number }>>((acc, b) => {
    const createdWeek = new Date(b.createdAt).toLocaleDateString('en', { weekday: 'short' });
    const resolvedWeek = b.status === 'resolved' || b.status === 'closed' ? new Date(b.updatedAt).toLocaleDateString('en', { weekday: 'short' }) : null;
    if (!acc[createdWeek]) acc[createdWeek] = { reported: 0, resolved: 0 };
    acc[createdWeek].reported++;
    if (resolvedWeek) {
      if (!acc[resolvedWeek]) acc[resolvedWeek] = { reported: 0, resolved: 0 };
      acc[resolvedWeek].resolved++;
    }
    return acc;
  }, {});
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyData = weekDays.map(d => weeklyActivity[d] || { reported: 0, resolved: 0 });
  const maxWeekly = Math.max(...weeklyData.flatMap(d => [d.reported, d.resolved]), 1);

  const teamPerformance = [
    { name: 'Sarah K.', assigned: bugs.filter(b => b.assignee === 'Sarah K.').length, resolved: bugs.filter(b => b.assignee === 'Sarah K.' && (b.status === 'resolved' || b.status === 'closed')).length },
    { name: 'Marcus J.', assigned: bugs.filter(b => b.assignee === 'Marcus J.').length, resolved: bugs.filter(b => b.assignee === 'Marcus J.' && (b.status === 'resolved' || b.status === 'closed')).length },
    { name: 'Emily R.', assigned: bugs.filter(b => b.assignee === 'Emily R.').length, resolved: bugs.filter(b => b.assignee === 'Emily R.' && (b.status === 'resolved' || b.status === 'closed')).length },
    { name: 'Alex C.', assigned: bugs.filter(b => b.assignee === 'Alex C.').length, resolved: bugs.filter(b => b.assignee === 'Alex C.' && (b.status === 'resolved' || b.status === 'closed')).length },
    { name: 'David W.', assigned: bugs.filter(b => b.assignee === 'David W.').length, resolved: bugs.filter(b => b.assignee === 'David W.' && (b.status === 'resolved' || b.status === 'closed')).length },
  ];


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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Analytics</h1>
          <p className="text-[var(--text-secondary)]">Track your team's performance and bug trends</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => exportBugsCSV(bugs, projects)}>
            <Download className="h-4 w-4" /> Export Bugs
          </Button>
          <Button variant="secondary" size="sm" onClick={() => exportProjectsCSV(projects)}>
            <Download className="h-4 w-4" /> Export Projects
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Bugs', value: totalBugs, icon: Bug, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Open Bugs', value: openBugs, icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { label: 'Resolved', value: resolvedBugs, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Active Projects', value: activeProjects, icon: FolderKanban, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map((metric, index) => (
          <motion.div key={metric.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`h-10 w-10 rounded-lg ${metric.bg} flex items-center justify-center`}><metric.icon className={`h-5 w-5 ${metric.color}`} /></div>
                <span className="text-2xl font-bold text-[var(--text-primary)] font-mono">{metric.value}</span>
              </div>
              <p className="text-xs text-[var(--text-tertiary)]">{metric.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-6">Bugs by Priority</h3>
          <div className="space-y-4">
            {bugsByPriority.map(p => (
              <div key={p.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-[var(--text-secondary)]">{p.label}</span>
                  <span className="text-[var(--text-primary)] font-mono font-medium">{p.count}</span>
                </div>
                <div className="h-2 rounded-full bg-[#21262D] overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(p.count / maxPriority) * 100}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} className={`h-full rounded-full ${p.color}`} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-6">Bugs by Status</h3>
          <div className="space-y-4">
            {bugsByStatus.map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-[var(--text-secondary)]">{s.label}</span>
                  <span className="text-[var(--text-primary)] font-mono font-medium">{s.count}</span>
                </div>
                <div className="h-2 rounded-full bg-[#21262D] overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(s.count / Math.max(...bugsByStatus.map(x => x.count), 1)) * 100}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} className={`h-full rounded-full ${s.color}`} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6 mb-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-6">Weekly Activity</h3>
        <div className="flex items-end gap-3 h-48">
          {weekDays.map((day, i) => {
            const data = weeklyData[i];
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div className="w-full flex flex-col items-center gap-0.5">
                  <motion.div initial={{ height: 0 }} animate={{ height: `${(data.reported / maxWeekly) * 100}%` }} transition={{ duration: 0.5, delay: i * 0.05 }} className="w-3/4 rounded-t bg-blue-500/60" />
                  <motion.div initial={{ height: 0 }} animate={{ height: `${(data.resolved / maxWeekly) * 100}%` }} transition={{ duration: 0.5, delay: i * 0.05 + 0.1 }} className="w-3/4 rounded-t bg-green-500/60" />
                </div>
                <span className="text-[10px] text-[var(--text-tertiary)] mt-1">{day}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-[var(--text-tertiary)]">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-blue-500/60" /> Reported</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-green-500/60" /> Resolved</span>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-6">Team Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-primary)]">
                <th className="text-left p-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Developer</th>
                <th className="text-left p-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Assigned</th>
                <th className="text-left p-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Resolved</th>
                <th className="text-left p-3 text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Resolution Rate</th>
              </tr>
            </thead>
            <tbody>
              {teamPerformance.map((t, i) => (
                <motion.tr key={t.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-[var(--border-secondary)]">
                  <td className="p-3 text-sm text-[var(--text-primary)] font-medium">{t.name}</td>
                  <td className="p-3 text-sm text-[var(--text-secondary)] font-mono">{t.assigned}</td>
                  <td className="p-3 text-sm text-[var(--text-secondary)] font-mono">{t.resolved}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-[#21262D] overflow-hidden">
                        <div className={`h-full rounded-full ${t.assigned > 0 && t.resolved / t.assigned > 0.7 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${t.assigned > 0 ? (t.resolved / t.assigned) * 100 : 0}%` }} />
                      </div>
                      <span className="text-xs font-mono text-[var(--text-tertiary)]">{t.assigned > 0 ? Math.round((t.resolved / t.assigned) * 100) : 0}%</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
