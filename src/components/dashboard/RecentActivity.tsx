import { motion } from 'framer-motion';
import { Cpu, CheckCircle2, UserPlus, Shield, MessageSquare, FolderKanban } from 'lucide-react';
import { Card } from '../ui/Card';
import { formatTimeAgo } from '../../lib/utils';
import { useData } from '../../contexts/DataContext';

const activityIcons: Record<string, { icon: any; color: string; bg: string }> = {
  scan_started: { icon: Cpu, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  scan_completed: { icon: Shield, color: 'text-green-400', bg: 'bg-green-500/10' },
  issue_resolved: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
  comment: { icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  repository_connected: { icon: FolderKanban, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  issue_assigned: { icon: UserPlus, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  scan_failed: { icon: Shield, color: 'text-red-400', bg: 'bg-red-500/10' },
  project_uploaded: { icon: FolderKanban, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  issue_detected: { icon: Cpu, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
};

export function RecentActivity() {
  const { activities, loading } = useData();
  const recent = activities.slice(0, 10);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="h-6 w-32 bg-[#21262D] rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-[#21262D] rounded animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Recent Activity</h3>
      </div>
      <div className="space-y-0">
        {recent.length === 0 ? (
          <p className="text-sm text-[var(--text-tertiary)] text-center py-8">No recent activity</p>
        ) : (
          recent.map((activity, index) => {
            const iconConfig = activityIcons[activity.type] || activityIcons.bug_created;
            const { icon: Icon, color, bg } = iconConfig;
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 py-3 border-b border-[var(--border-secondary)] last:border-0"
              >
                <div className={`h-8 w-8 rounded-lg ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text-primary)]">{activity.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-[var(--text-tertiary)]">{activity.userName || activity.userId}</span>
                    <span className="h-1 w-1 rounded-full bg-[var(--text-tertiary)]" />
                    <span className="text-xs text-[var(--text-tertiary)]">{formatTimeAgo(activity.createdAt)}</span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </Card>
  );
}
