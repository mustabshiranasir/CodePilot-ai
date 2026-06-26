import { motion } from 'framer-motion';
import { Bug, CheckCircle2, UserPlus, GitCommit, MessageSquare, FolderKanban } from 'lucide-react';
import { Card } from '../ui/Card';
import { formatTimeAgo } from '../../lib/utils';
import type { Activity } from '../../types';

const activityIcons = {
  bug_created: { icon: Bug, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  bug_resolved: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
  bug_assigned: { icon: UserPlus, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  comment: { icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  project_created: { icon: FolderKanban, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  member_joined: { icon: GitCommit, color: 'text-pink-400', bg: 'bg-pink-500/10' },
};

const mockActivities: Activity[] = [
  { id: '1', type: 'bug_created', message: 'New bug reported in auth module: "Token expiration not handled"', user: 'Sarah K.', timestamp: new Date(Date.now() - 300000).toISOString() },
  { id: '2', type: 'bug_resolved', message: 'Fixed critical memory leak in data pipeline', user: 'Marcus J.', timestamp: new Date(Date.now() - 1800000).toISOString() },
  { id: '3', type: 'bug_assigned', message: 'Bug #1424 assigned to you: "UI glitch on mobile nav"', user: 'System', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: '4', type: 'comment', message: 'Added reproduction steps and logs to bug #1419', user: 'Emily R.', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: '5', type: 'project_created', message: 'New project created: "API Gateway v2"', user: 'Alex C.', timestamp: new Date(Date.now() - 14400000).toISOString() },
  { id: '6', type: 'member_joined', message: 'David W. joined the Frontend Team', user: 'System', timestamp: new Date(Date.now() - 28800000).toISOString() },
];

export function RecentActivity() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Recent Activity</h3>
        <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">View all</button>
      </div>
      <div className="space-y-0">
        {mockActivities.map((activity, index) => {
          const { icon: Icon, color, bg } = activityIcons[activity.type];
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
                  <span className="text-xs text-[var(--text-tertiary)]">{activity.user}</span>
                  <span className="h-1 w-1 rounded-full bg-[var(--text-tertiary)]" />
                  <span className="text-xs text-[var(--text-tertiary)]">{formatTimeAgo(activity.timestamp)}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
