import { cn } from '../../lib/utils';
import { getStatusColor, getPriorityColor } from '../../lib/utils';

interface BadgeProps {
  variant?: 'status' | 'priority' | 'default';
  value: string;
  className?: string;
}

export function Badge({ variant = 'default', value, className }: BadgeProps) {
  const colorClass = variant === 'status'
    ? getStatusColor(value)
    : variant === 'priority'
    ? getPriorityColor(value)
    : 'bg-[#21262D] text-[#8B949E] border border-[#30363D]';

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      colorClass,
      className
    )}>
      {value === 'in_progress' ? 'In Progress' : value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ')}
    </span>
  );
}
