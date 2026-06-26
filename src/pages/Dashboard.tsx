import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { StatsCardSkeleton, TableRowSkeleton } from '../components/ui/Skeleton';
import { WelcomeSection } from '../components/dashboard/WelcomeSection';
import { StatsCards } from '../components/dashboard/StatsCards';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Plus, ArrowUpRight, GitBranch, Code2 } from 'lucide-react';
import type { Stats } from '../types';

const defaultStats: Stats = {
  totalBugs: 142,
  openBugs: 23,
  resolvedBugs: 108,
  activeProjects: 12,
  teamMembers: 8,
  criticalBugs: 3,
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats] = useState<Stats>(defaultStats);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div>
        <div className="mb-8 space-y-2">
          <div className="h-8 w-64 bg-[#21262D] rounded animate-pulse" />
          <div className="h-4 w-96 bg-[#21262D] rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-[var(--border-primary)] p-6">
              <div className="h-6 w-32 bg-[#21262D] rounded animate-pulse mb-4" />
              <TableRowSkeleton rows={4} />
            </div>
          </div>
          <div>
            <div className="rounded-xl border border-[var(--border-primary)] p-6">
              <div className="h-6 w-28 bg-[#21262D] rounded animate-pulse mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 bg-[#21262D] rounded animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <WelcomeSection />
      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="secondary" className="w-full justify-between">
                  <span className="flex items-center gap-2"><Plus className="h-4 w-4" /> New Bug Report</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
                <Button variant="secondary" className="w-full justify-between">
                  <span className="flex items-center gap-2"><Plus className="h-4 w-4" /> New Project</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
                <Button variant="secondary" className="w-full justify-between">
                  <span className="flex items-center gap-2"><Plus className="h-4 w-4" /> Invite Member</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Connected Apps</h3>
              <div className="space-y-3">
                {[
                  { icon: GitBranch, name: 'GitHub', connected: true },
                  { icon: GitBranch, name: 'GitLab', connected: true },
                  { icon: Code2, name: 'VS Code', connected: false },
                ].map(app => (
                  <div key={app.name} className="flex items-center justify-between p-3 rounded-lg bg-[#21262D]">
                    <div className="flex items-center gap-3">
                      <app.icon className="h-5 w-5 text-[var(--text-secondary)]" />
                      <span className="text-sm text-[var(--text-secondary)]">{app.name}</span>
                    </div>
                    <Badge value={app.connected ? 'Connected' : 'Install'} variant="status" />
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
