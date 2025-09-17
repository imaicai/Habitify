import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trophy, Calendar, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HabitCard } from '@/components/HabitCard';
import { Navbar } from '@/components/Navbar';
import { getHabits, saveHabit, addCompletion, getUser } from '@/lib/storage';
import { Habit, HabitCompletion } from '@/types/habit';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import heroImage from '@/assets/hero-image.jpg';

const Index = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setHabits(getHabits());
  }, []);

  const handleCompleteHabit = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit || habit.completedToday >= habit.dailyFrequency) return;

    const updatedHabit = {
      ...habit,
      completedToday: habit.completedToday + 1,
      lastCompletedDate: new Date(),
    };

    // Update streak logic
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    
    if (!habit.lastCompletedDate || 
        new Date(habit.lastCompletedDate).toDateString() === yesterdayStr) {
      updatedHabit.currentStreak = habit.currentStreak + 1;
    } else if (new Date(habit.lastCompletedDate).toDateString() !== today) {
      updatedHabit.currentStreak = 1;
    }
    
    updatedHabit.longestStreak = Math.max(updatedHabit.longestStreak, updatedHabit.currentStreak);

    // Save updated habit
    saveHabit(updatedHabit);
    setHabits(prev => prev.map(h => h.id === habitId ? updatedHabit : h));

    // Record completion
    const completion: HabitCompletion = {
      habitId,
      date: new Date(),
      completedCount: 1,
      energyEarned: habit.energyPerCompletion,
    };
    addCompletion(completion);

    // Show success toast
    toast({
      title: "打卡成功！",
      description: `获得 ${habit.energyPerCompletion} 点能量`,
      duration: 2000,
    });
  };

  const activeHabits = habits.filter(h => {
    const today = new Date().toDateString();
    return h.completedToday < h.dailyFrequency || 
           new Date(h.lastCompletedDate || 0).toDateString() === today;
  });

  const completedHabits = habits.filter(h => h.completedToday >= h.dailyFrequency);
  const user = getUser();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              每一天都是新的开始
            </span>
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            坚持好习惯，收获更好的自己
          </p>
          
          {habits.length === 0 && (
            <Card className="overflow-hidden bg-gradient-to-br from-primary/5 to-success/5 border-primary/20">
              <div 
                className="relative h-64 bg-cover bg-center flex items-center justify-center"
                style={{ backgroundImage: `url(${heroImage})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-success/80 backdrop-blur-sm" />
                <div className="relative z-10 text-center text-white">
                  <div className="bg-white/20 p-4 rounded-2xl shadow-strong backdrop-blur-md mb-4 inline-block">
                    <Sparkles className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">开启你的习惯之旅</h3>
                  <p className="text-white/90 mb-4 max-w-md mx-auto">
                    每一个好习惯都是通向更好自己的台阶
                  </p>
                  <Link to="/create">
                    <Button className="bg-white text-primary hover:bg-white/90 hover:shadow-glow gap-2 font-semibold">
                      <Plus className="h-4 w-4" />
                      创建第一个习惯
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          )}
        </div>

        {habits.length > 0 && (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{habits.length}</div>
                <div className="text-sm text-muted-foreground">总习惯</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-success">{completedHabits.length}</div>
                <div className="text-sm text-muted-foreground">已完成</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-energy">{user.totalEnergy}</div>
                <div className="text-sm text-muted-foreground">能量点</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {habits.reduce((sum, h) => sum + h.currentStreak, 0)}
                </div>
                <div className="text-sm text-muted-foreground">连续天数</div>
              </Card>
            </div>

            {/* Active Habits */}
            {activeHabits.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-primary" />
                    今日习惯
                  </h2>
                  <Link to="/create">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      添加习惯
                    </Button>
                  </Link>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {activeHabits.map((habit) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      onComplete={handleCompleteHabit}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Habits */}
            {completedHabits.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-success" />
                  今日已完成
                </h2>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {completedHabits.map((habit) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      onComplete={handleCompleteHabit}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/rewards">
                <Card className="p-6 cursor-pointer hover:shadow-medium transition-smooth">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-energy p-3 rounded-xl">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">奖励中心</h3>
                      <p className="text-sm text-muted-foreground">兑换你的奖励</p>
                    </div>
                  </div>
                </Card>
              </Link>
              
              <Link to="/stats">
                <Card className="p-6 cursor-pointer hover:shadow-medium transition-smooth">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-primary p-3 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">数据统计</h3>
                      <p className="text-sm text-muted-foreground">查看进度</p>
                    </div>
                  </div>
                </Card>
              </Link>
              
              <Link to="/create">
                <Card className="p-6 cursor-pointer hover:shadow-medium transition-smooth">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-success p-3 rounded-xl">
                      <Plus className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">新建习惯</h3>
                      <p className="text-sm text-muted-foreground">添加新习惯</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
