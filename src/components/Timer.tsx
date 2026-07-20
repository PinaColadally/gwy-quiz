import { Clock } from 'lucide-react';

interface Props {
  timeRemaining: number;
  totalMinutes: number;
}

export default function Timer({ timeRemaining, totalMinutes }: Props) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const percent = (timeRemaining / (totalMinutes * 60)) * 100;
  const isWarning = timeRemaining <= 120;
  const isCritical = timeRemaining <= 60;

  return (
    <div className="flex items-center gap-2">
      <Clock className={`w-4 h-4 ${isCritical ? 'text-red-500 animate-pulse' : isWarning ? 'text-orange-400' : 'text-slate-400'}`} />
      <div className="flex flex-col">
        <span className={`text-sm font-mono font-bold ${isCritical ? 'text-red-500' : isWarning ? 'text-orange-400' : 'text-slate-700 dark:text-slate-300'}`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
        <div className="w-20 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              isCritical ? 'bg-red-500' : isWarning ? 'bg-orange-400' : 'bg-green-500'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
