import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'gold' | 'success' | 'destructive';
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: StatCardProps) {
  const iconColors = {
    default: 'text-muted-foreground',
    primary: 'text-primary',
    gold: 'text-accent',
    success: 'text-success',
    destructive: 'text-destructive',
  };

  const valueColors = {
    default: 'text-foreground',
    primary: 'text-gradient',
    gold: 'trophy-shimmer',
    success: 'text-success',
    destructive: 'text-destructive',
  };

  return (
    <div className={cn('stat-card', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn('text-3xl font-display font-bold', valueColors[variant])}>
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={cn(
            'flex h-12 w-12 items-center justify-center rounded-lg bg-muted/50',
            iconColors[variant]
          )}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
      
      {trend && (
        <div className="mt-3 flex items-center gap-1">
          <span className={cn(
            'text-sm font-medium',
            trend.isPositive ? 'text-success' : 'text-destructive'
          )}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-sm text-muted-foreground">vs last week</span>
        </div>
      )}
    </div>
  );
}
