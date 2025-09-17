import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Navbar } from '@/components/Navbar';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Zap,
  Calendar,
  Award,
  Activity,
  Clock,
  Flame
} from 'lucide-react';
import { getStats, getHabits, getCompletions, getRewards } from '@/lib/storage';
import { Stats as StatsType, Habit } from '@/types/habit';
import { cn } from '@/lib/utils';

const Stats = () => {
  const [stats, setStats] = useState<StatsType | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  
  useEffect(() => {
    setStats(getStats());
    setHabits(getHabits());
  }, []);

  if (!stats) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">加载中...</div>
        </div>
      </div>
    );
  }

  const weeklyCompletionRate = stats.weeklyProgress.reduce((sum, day) => sum + day.completions, 0) / (stats.activeHabits * 7) * 100;
  const bestStreak = Math.max(...habits.map(h => h.longestStreak), 0);
  const todayCompletions = stats.weeklyProgress[stats.weeklyProgress.length - 1]?.completions || 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            数据统计
          </h1>
          <p className="text-muted-foreground">
            追踪你的进步和成就
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex flex-col items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              <div className="text-2xl font-bold text-primary">{stats.totalHabits}</div>
              <div className="text-sm text-muted-foreground">总习惯数</div>
            </div>
          </Card>

          <Card className="p-4 text-center bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <div className="flex flex-col items-center gap-2">
              <Activity className="h-6 w-6 text-success" />
              <div className="text-2xl font-bold text-success">{stats.activeHabits}</div>
              <div className="text-sm text-muted-foreground">活跃习惯</div>
            </div>
          </Card>

          <Card className="p-4 text-center bg-gradient-to-br from-energy/10 to-energy/5 border-energy/20">
            <div className="flex flex-col items-center gap-2">
              <Zap className="h-6 w-6 text-energy" />
              <div className="text-2xl font-bold text-energy">{stats.totalEnergyEarned}</div>
              <div className="text-sm text-muted-foreground">总能量</div>
            </div>
          </Card>

          <Card className="p-4 text-center bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
            <div className="flex flex-col items-center gap-2">
              <Flame className="h-6 w-6 text-destructive" />
              <div className="text-2xl font-bold text-destructive">{bestStreak}</div>
              <div className="text-sm text-muted-foreground">最长连击</div>
            </div>
          </Card>
        </div>

        {/* Progress Overview */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">本周完成率</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>完成进度</span>
                <span className="font-medium">{Math.round(weeklyCompletionRate)}%</span>
              </div>
              <Progress value={weeklyCompletionRate} className="h-3" />
              <p className="text-sm text-muted-foreground">
                本周共完成 {stats.weeklyProgress.reduce((sum, day) => sum + day.completions, 0)} 次打卡
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Award className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">成就概览</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">今日完成</span>
                <Badge className="bg-gradient-success text-white">
                  {todayCompletions} 次
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">总打卡次数</span>
                <Badge variant="outline">{stats.totalCompletions} 次</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">当前连击</span>
                <Badge className="bg-gradient-primary text-white">
                  {stats.currentStreaks} 天
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">奖励兑换</span>
                <Badge className="bg-gradient-energy text-white">
                  {stats.totalRewardsRedeemed} 次
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Weekly Progress Chart */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">近七天进度</h3>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {stats.weeklyProgress.map((day, index) => {
              const maxCompletions = Math.max(...stats.weeklyProgress.map(d => d.completions), 1);
              const height = (day.completions / maxCompletions) * 100;
              const isToday = index === stats.weeklyProgress.length - 1;
              
              return (
                <div key={index} className="text-center">
                  <div className="h-32 flex flex-col justify-end mb-2">
                    <div 
                      className={cn(
                        "rounded-t-md transition-all duration-500",
                        isToday ? "bg-gradient-primary" : "bg-gradient-success",
                        height === 0 && "min-h-[4px] opacity-30"
                      )}
                      style={{ height: `${Math.max(height, 6)}%` }}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className={cn(
                      "text-xs font-medium",
                      isToday ? "text-primary" : "text-muted-foreground"
                    )}>
                      {day.day}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {day.completions}次
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs text-energy">
                      <Zap className="h-3 w-3" />
                      {day.energy}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Individual Habit Stats */}
        {habits.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">习惯详情</h3>
            </div>
            
            <div className="space-y-4">
              {habits.map((habit) => {
                const completionRate = habit.dailyFrequency > 0 
                  ? (habit.completedToday / habit.dailyFrequency) * 100 
                  : 0;
                
                return (
                  <div 
                    key={habit.id} 
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-lg">{habit.icon}</div>
                      <div>
                        <h4 className="font-medium">{habit.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>今日: {habit.completedToday}/{habit.dailyFrequency}</span>
                          <span>连续: {habit.currentStreak}天</span>
                          <span>最长: {habit.longestStreak}天</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium mb-1">
                        {Math.round(completionRate)}%
                      </div>
                      <div className="w-24">
                        <Progress value={completionRate} className="h-2" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {habits.length === 0 && (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="bg-gradient-primary p-6 rounded-2xl shadow-medium opacity-50">
                <BarChart3 className="h-12 w-12 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">暂无数据</h3>
                <p className="text-muted-foreground">
                  开始养成习惯后，这里将显示你的进度统计
                </p>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Stats;