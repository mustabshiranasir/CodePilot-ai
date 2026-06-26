import { motion } from 'framer-motion';
import { Bug, CheckCircle2, AlertTriangle, FolderKanban, TrendingUp, Activity } from 'lucide-react';
import { Card } from '../ui/Card';
import type { Stats } from '../../types';

const statCards = [
  { key: 'totalBugs', icon: Bug, label: 'Total Bugs', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { key: 'openBugs', icon: AlertTriangle, label: 'Open Bugs', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { key: 'resolvedBugs', icon: CheckCircle2, label: 'Resolved', color: 'text-green-400', bg: 'bg-green-500/10' },
  { key: 'criticalBugs', icon: TrendingUp, label: 'Critical', color: 'text-red-400', bg: 'bg-red-500/10' },
  { key: 'activeProjects', icon: FolderKanban, label: 'Active Projects', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { key: 'teamMembers', icon: Activity, label: 'Team Members', color: 'text-orange-400', bg: 'bg-orange-500/10' },
];

interface StatsCardsProps {
  stats: Stats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map(({ key, icon: Icon, label, color, bg }, index) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`h-8 w-8 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <span className="text-2xl font-bold text-[var(--text-primary)] font-mono">
                {stats[key as keyof Stats]}
              </span>
            </div>
            <p className="text-xs text-[var(--text-tertiary)]">{label}</p>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
