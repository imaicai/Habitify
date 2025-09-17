import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Book, 
  Dumbbell, 
  Apple, 
  Droplets, 
  Moon, 
  Heart, 
  Brain, 
  Target, 
  Coffee, 
  Leaf,
  Zap,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Habit } from '@/types/habit';
import { cn } from '@/lib/utils';

const iconMap = {
  book: Book,
  dumbbell: Dumbbell,
  apple: Apple,
  droplets: Droplets,
  moon: Moon,
  heart: Heart,
  brain: Brain,
  target: Target,
  coffee: Coffee,
  leaf: Leaf,
};

const difficultyColors = {
  easy: 'bg-success text-white',
  normal: 'bg-primary text-white', 
  hard: 'bg-destructive text-white',
};

const difficultyLabels = {
  easy: '简单',
  normal: '普通',
  hard: '困难',
};

interface HabitCardProps {
  habit: Habit;
  onComplete: (habitId: string) => void;
  onEdit?: (habit: Habit) => void;
}

export const HabitCard = ({ habit, onComplete, onEdit }: HabitCardProps) => {
  const [isCompleting, setIsCompleting] = useState(false);
  
  const IconComponent = iconMap[habit.icon];
  const progress = (habit.completedToday / habit.dailyFrequency) * 100;
  const isCompleted = habit.completedToday >= habit.dailyFrequency;
  
  const handleComplete = async () => {
    if (isCompleted) return;
    
    setIsCompleting(true);
    setTimeout(() => {
      onComplete(habit.id);
      setIsCompleting(false);
    }, 300);
  };

  return (
    <Card className={cn(
      "habit-card p-6 cursor-pointer",
      isCompleted && "ring-2 ring-success/50 bg-success/5"
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-3 rounded-xl shadow-soft transition-smooth",
            isCompleted ? "bg-gradient-success" : "bg-gradient-primary"
          )}>
            <IconComponent className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg leading-tight">{habit.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={difficultyColors[habit.difficulty]}>
                {difficultyLabels[habit.difficulty]}
              </Badge>
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <Zap className="h-3 w-3" />
                <span>+{habit.energyPerCompletion}</span>
              </div>
            </div>
          </div>
        </div>
        
        {habit.reminders.length > 0 && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{habit.reminders[0]}</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>今日进度</span>
          <span className="font-medium">
            {habit.completedToday}/{habit.dailyFrequency}
          </span>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>连续 {habit.currentStreak} 天</span>
            <span>每周 {habit.weeklyDays} 天</span>
          </div>
          
          <Button
            onClick={handleComplete}
            disabled={isCompleted || isCompleting}
            className={cn(
              "transition-bounce relative overflow-hidden",
              isCompleted 
                ? "bg-success hover:bg-success/90 text-white" 
                : "bg-gradient-primary hover:shadow-glow"
            )}
          >
            {isCompleting && (
              <div className="absolute inset-0 bg-gradient-energy animate-pulse" />
            )}
            <div className="relative flex items-center gap-2">
              {isCompleted ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  已完成
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  打卡
                </>
              )}
            </div>
          </Button>
        </div>
      </div>
    </Card>
  );
};