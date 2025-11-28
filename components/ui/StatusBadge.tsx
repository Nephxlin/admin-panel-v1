import { cn, getStatusBadgeColor, getStatusLabel } from '@/lib/utils';

interface StatusBadgeProps {
  status: number;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        getStatusBadgeColor(status),
        className
      )}
    >
      {getStatusLabel(status)}
    </span>
  );
}

