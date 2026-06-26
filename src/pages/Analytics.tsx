import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertTriangle, Activity } from 'lucide-react';
import { Card } from '../components/ui/Card';

const metrics = [
  { label: 'Bug Resolution Rate', value: '76%', change: '+12%', positive: true, icon: CheckCircle2, color: 'text-green-400' },
  { label: 'Avg Response Time', value: '2.4h', change: '-18%', positive: true, icon: Clock, color: 'text-blue-400' },
  { label: 'Critical Bugs', value: '3', change: '+2', positive: false, icon: AlertTriangle, color: 'text-red-400' },
  { label: 'Team Velocity', value: '28/wk', change: '+8%', positive: true, icon: Activity, color: 'text-purple-400' },
];

const weeklyData = [
  { day: 'Mon', bugs: 12, resolved: 8 },
  { day: 'Tue', bugs: 8, resolved: 10 },
  { day: 'Wed', bugs: 15, resolved: 12 },
  { day: 'Thu', bugs: 6, resolved: 14 },
  { day: 'Fri', bugs: 10, resolved: 9 },
  { day: 'Sat', bugs: 3, resolved: 5 },
  { day: 'Sun', bugs: 2, resolved: 4 },
];

export default function Analytics() {
  const maxVal = Math.max(...weeklyData.flatMap(d => [d.bugs, d.resolved]));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Analytics</h1>
        <p className="text-[var(--text-secondary)]">Track your team's performance and bug trends</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
                <span className={`text-xs font-medium ${metric.positive ? 'text-green-400' : 'text-red-400'}`}>
                  {metric.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)] font-mono mb-1">{metric.value}</p>
              <p className="text-xs text-[var(--text-tertiary)]">{metric.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Weekly Bug Activity</h3>
          <div className="flex items-end gap-2 h-48">
            {weeklyData.map(d => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div className="w-full flex flex-col items-center gap-0.5">
                  <div
                    className="w-3/4 rounded-t bg-blue-500/60 transition-all duration-300 hover:bg-blue-500/80"
                    style={{ height: `${(d.bugs / maxVal) * 100}%` }}
                  />
                  <div
                    className="w-3/4 rounded-t bg-green-500/60 transition-all duration-300 hover:bg-green-500/80"
                    style={{ height: `${(d.resolved / maxVal) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-[var(--text-tertiary)] mt-1">{d.day}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-[var(--text-tertiary)]">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-blue-500/60" /> Reported</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-green-500/60" /> Resolved</span>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Top Projects</h3>
          <div className="space-y-4">
            {[
              { name: 'Frontend App', bugs: 23, color: 'bg-blue-500' },
              { name: 'Mobile App', bugs: 31, color: 'bg-purple-500' },
              { name: 'API Gateway', bugs: 12, color: 'bg-green-500' },
              { name: 'Data Pipeline', bugs: 8, color: 'bg-orange-500' },
            ].map(project => (
              <div key={project.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--text-primary)]">{project.name}</span>
                  <span className="text-[var(--text-tertiary)] font-mono">{project.bugs} bugs</span>
                </div>
                <div className="h-2 rounded-full bg-[#21262D] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${project.color} transition-all duration-500`}
                    style={{ width: `${(project.bugs / 40) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
