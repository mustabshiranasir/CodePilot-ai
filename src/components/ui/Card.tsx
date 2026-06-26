import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'glow';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border bg-[var(--bg-secondary)] transition-all duration-200',
        variant === 'default' && 'border-[var(--border-primary)]',
        variant === 'interactive' && 'border-[var(--border-primary)] hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 cursor-pointer',
        variant === 'glow' && 'border-blue-500/20 shadow-lg shadow-blue-500/5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pb-0', className)} {...props}>{children}</div>;
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6', className)} {...props}>{children}</div>;
}

export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-0 flex items-center gap-2', className)} {...props}>{children}</div>;
}
