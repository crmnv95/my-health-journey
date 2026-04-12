import { getCycleDay, getDaysRemaining } from '@/lib/cycleUtils';

interface Props {
  startDate: string;
  title: string;
}

export default function CycleHeader({ startDate, title }: Props) {
  const currentDay = getCycleDay(startDate);
  const remaining = getDaysRemaining(startDate);
  const progress = (currentDay / 21) * 100;

  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="text-xl font-bold text-foreground">{title}</h1>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm font-medium text-primary">
          Day {currentDay}/21
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{remaining} days remaining</p>
    </div>
  );
}
