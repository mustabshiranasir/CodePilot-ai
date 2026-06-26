import { motion } from 'framer-motion';
import { Cpu, CheckCircle2, AlertTriangle, Shield, BarChart3, Bug } from 'lucide-react';
import { Card } from '../ui/Card';
import type { Stats } from '../../types';
import { cn } from '../../lib/utils';

const statCards = [
  { key: 'totalScans', icon: Cpu, label: 'Total Scans', color: 'text-blue-400', bg: 'bg-blue-500/10', isScore: false },
  { key: 'totalIssues', icon: Bug, label: 'Issues Found', color: 'text-yellow-400', bg: 'bg-yellow-500/10', isScore: false },
  { key: 'resolvedIssues', icon: CheckCircle2, label: 'Resolved', color: 'text-green-400', bg: 'bg-green-500/10', isScore: false },
  { key: 'criticalIssues', icon: AlertTriangle, label: 'Critical', color: 'text-red-400', bg: 'bg-red-500/10', isScore: false },
  { key: 'codeQualityScore', icon: Shield, label: 'Code Quality', color: 'text-purple-400', bg: 'bg-purple-500/10', isScore: true },
  { key: 'securityScore', icon: BarChart3, label: 'Security', color: 'text-orange-400', bg: 'bg-orange-500/10', isScore: true },
];

function ScoreRing({ value, size = 40 }: { value: number; size?: number }) {
  const radius = size / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;
  const strokeColor = value >= 80 ? '#22c55e' : value >= 50 ? '#eab308' : '#ef4444';
  return (
    <svg width={size} height={size} className="transform -rotate-90 shrink-0">
      <defs>
        <linearGradient id={`grad-${value}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={strokeColor} stopOpacity={0.6} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={1} />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#21262D" strokeWidth={3} />
      <motion.circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={`url(#grad-${value})`} strokeWidth={3}
        strokeDasharray={circumference} strokeDashoffset={circumference}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        strokeLinecap="round" />
    </svg>
  );
}

interface StatsCardsProps {
  stats: Stats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map(({ key, icon: Icon, label, color, bg, isScore }, index) => {
        const value = stats[key as keyof Stats] as number;
        const safeValue = Number.isFinite(value) ? value : 0;
        const displayValue = isScore ? `${Math.round(safeValue)}%` : safeValue;
        return (
          <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Card className={cn('p-4 group hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden', isScore && '')}>
              {isScore && (
                <div className="absolute inset-0 opacity-[0.03] transition-opacity duration-500 group-hover:opacity-[0.06]"
                  style={{ background: `linear-gradient(135deg, ${safeValue >= 80 ? '#22c55e' : safeValue >= 50 ? '#eab308' : '#ef4444'} 0%, transparent 100%)` }} />
              )}
              <div className="absolute -top-8 -right-8 h-16 w-16 rounded-full bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center justify-between mb-2 relative z-[1]">
                <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg', bg,
                  isScore ? `${bg.replace('/10', '/20')}` : '')}>
                  <Icon className={cn('h-4 w-4', color)} />
                </div>
                {isScore ? (
                  <ScoreRing value={safeValue} />
                ) : (
                  <motion.span
                    key={safeValue}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-bold text-[var(--text-primary)] font-mono">{displayValue}</motion.span>
                )}
              </div>
              <p className="text-xs text-[var(--text-tertiary)] relative z-[1]">{label}</p>
              {isScore && (
                <div className="mt-2 h-1.5 rounded-full bg-[#21262D] overflow-hidden relative z-[1]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${safeValue}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: index * 0.05 + 0.3 }}
                    className={cn('h-full rounded-full', safeValue >= 80 ? 'bg-green-500' : safeValue >= 50 ? 'bg-yellow-500' : 'bg-red-500')} />
                </div>
              )}
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
