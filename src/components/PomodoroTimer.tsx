import { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useTaskStore } from '@/store/taskStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function PomodoroTimer() {
  const { pomodoro, pausePomodoro, resumePomodoro, resetPomodoro, tickPomodoro, startBreak } = useAppStore();
  const { tasks } = useTaskStore();
  
  const activeTask = tasks.find((t) => t.id === pomodoro.activeTaskId);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (pomodoro.isRunning && pomodoro.timeLeft > 0) {
      interval = setInterval(() => {
        tickPomodoro();
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pomodoro.isRunning, pomodoro.timeLeft, tickPomodoro]);

  if (!pomodoro.activeTaskId && !pomodoro.isBreak && pomodoro.timeLeft === 25 * 60) {
    return null;
  }

  const minutes = Math.floor(pomodoro.timeLeft / 60);
  const seconds = pomodoro.timeLeft % 60;
  const progress = ((pomodoro.totalTime - pomodoro.timeLeft) / pomodoro.totalTime) * 100;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className={cn(
        'glass-effect rounded-2xl shadow-large p-4 min-w-[280px]',
        pomodoro.isBreak ? 'border-success/30' : 'border-primary/30'
      )}>
        {/* Progress Ring */}
        <div className="flex items-center gap-4 mb-3">
          <div className="relative w-14 h-14">
            <svg className="w-14 h-14 -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                strokeWidth="4"
                className="stroke-muted"
              />
              <circle
                cx="28"
                cy="28"
                r="24"
                fill="none"
                strokeWidth="4"
                strokeLinecap="round"
                className={pomodoro.isBreak ? 'stroke-success' : 'stroke-primary'}
                style={{
                  strokeDasharray: 150.8,
                  strokeDashoffset: 150.8 - (150.8 * progress) / 100,
                  transition: 'stroke-dashoffset 1s linear',
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              {pomodoro.isBreak ? (
                <Coffee className="w-5 h-5 text-success" />
              ) : (
                <span className="text-xs font-medium">
                  {Math.round(progress)}%
                </span>
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="text-2xl font-mono font-semibold tabular-nums">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {pomodoro.isBreak ? 'Break time' : activeTask?.title || 'Focus session'}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {pomodoro.isRunning ? (
            <Button
              variant="outline"
              size="sm"
              onClick={pausePomodoro}
              className="flex-1"
            >
              <Pause className="w-4 h-4 mr-1" />
              Pause
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={resumePomodoro}
              className="flex-1"
            >
              <Play className="w-4 h-4 mr-1" />
              Resume
            </Button>
          )}
          
          {pomodoro.timeLeft === 0 && !pomodoro.isBreak ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => startBreak(5 * 60)}
              className="flex-1"
            >
              <Coffee className="w-4 h-4 mr-1" />
              Break
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={resetPomodoro}
              className="h-8 w-8"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
