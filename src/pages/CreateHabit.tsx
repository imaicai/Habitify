import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
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
  ArrowLeft,
  Plus,
  Clock
} from 'lucide-react';
import { Habit, HabitIcon, HabitDifficulty } from '@/types/habit';
import { saveHabit } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const iconOptions = [
  { value: 'book' as HabitIcon, icon: Book, label: '阅读' },
  { value: 'dumbbell' as HabitIcon, icon: Dumbbell, label: '健身' },
  { value: 'apple' as HabitIcon, icon: Apple, label: '饮食' },
  { value: 'droplets' as HabitIcon, icon: Droplets, label: '喝水' },
  { value: 'moon' as HabitIcon, icon: Moon, label: '睡眠' },
  { value: 'heart' as HabitIcon, icon: Heart, label: '冥想' },
  { value: 'brain' as HabitIcon, icon: Brain, label: '学习' },
  { value: 'target' as HabitIcon, icon: Target, label: '目标' },
  { value: 'coffee' as HabitIcon, icon: Coffee, label: '戒咖啡' },
  { value: 'leaf' as HabitIcon, icon: Leaf, label: '环保' },
];

const difficultyOptions = [
  { value: 'easy' as HabitDifficulty, label: '简单', description: '容易坚持', color: 'bg-success' },
  { value: 'normal' as HabitDifficulty, label: '普通', description: '需要努力', color: 'bg-primary' },
  { value: 'hard' as HabitDifficulty, label: '困难', description: '挑战自我', color: 'bg-destructive' },
];

const CreateHabit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    icon: 'book' as HabitIcon,
    difficulty: 'normal' as HabitDifficulty,
    weeklyDays: 7,
    dailyFrequency: 1,
    energyPerCompletion: 2,
    reminders: [] as string[],
    notificationsEnabled: false,
    newReminderTime: '09:00',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "请输入习惯名称",
        variant: "destructive",
      });
      return;
    }

    const habit: Habit = {
      id: crypto.randomUUID(),
      name: formData.name.trim(),
      icon: formData.icon,
      difficulty: formData.difficulty,
      weeklyDays: formData.weeklyDays,
      dailyFrequency: formData.dailyFrequency,
      energyPerCompletion: formData.energyPerCompletion,
      reminders: formData.reminders,
      notificationsEnabled: formData.notificationsEnabled,
      createdAt: new Date(),
      currentStreak: 0,
      longestStreak: 0,
      completedToday: 0,
      lastCompletedDate: null,
      weeklyProgress: [false, false, false, false, false, false, false],
    };

    saveHabit(habit);
    
    toast({
      title: "习惯创建成功！",
      description: `"${habit.name}" 已添加到你的习惯列表`,
    });
    
    navigate('/');
  };

  const addReminder = () => {
    if (formData.newReminderTime && !formData.reminders.includes(formData.newReminderTime)) {
      setFormData(prev => ({
        ...prev,
        reminders: [...prev.reminders, prev.newReminderTime].sort(),
      }));
    }
  };

  const removeReminder = (time: string) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.filter(t => t !== time),
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          <div>
            <h1 className="text-3xl font-bold">创建新习惯</h1>
            <p className="text-muted-foreground">设置你的新习惯并开始养成</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Habit Name */}
          <Card className="p-6">
            <div className="space-y-4">
              <Label htmlFor="name" className="text-lg font-semibold">习惯名称</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="例如：每天阅读30分钟"
                className="text-lg"
              />
            </div>
          </Card>

          {/* Icon Selection */}
          <Card className="p-6">
            <div className="space-y-4">
              <Label className="text-lg font-semibold">选择图标</Label>
              <div className="grid grid-cols-5 gap-3">
                {iconOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon: option.value }))}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                        formData.icon === option.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <IconComponent className="h-6 w-6" />
                      <span className="text-xs font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Difficulty */}
          <Card className="p-6">
            <div className="space-y-4">
              <Label className="text-lg font-semibold">难度选择</Label>
              <div className="grid grid-cols-3 gap-3">
                {difficultyOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, difficulty: option.value }))}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all",
                      formData.difficulty === option.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className={cn("w-4 h-4 rounded-full mx-auto mb-2", option.color)} />
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Frequency Settings */}
          <Card className="p-6">
            <div className="space-y-6">
              <Label className="text-lg font-semibold">频率设置</Label>
              
              {/* Weekly Days */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>每周打卡天数</Label>
                  <Badge variant="outline">{formData.weeklyDays} 天</Badge>
                </div>
                <Slider
                  value={[formData.weeklyDays]}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, weeklyDays: value[0] }))}
                  min={1}
                  max={7}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Daily Frequency */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>每日打卡次数</Label>
                  <Badge variant="outline">{formData.dailyFrequency} 次</Badge>
                </div>
                <Slider
                  value={[formData.dailyFrequency]}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, dailyFrequency: value[0] }))}
                  min={1}
                  max={24}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Energy Per Completion */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>每次获得能量</Label>
                  <Badge className="bg-gradient-energy text-white">+{formData.energyPerCompletion}</Badge>
                </div>
                <Slider
                  value={[formData.energyPerCompletion]}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, energyPerCompletion: value[0] }))}
                  min={1}
                  max={3}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </Card>

          {/* Reminders */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">打卡提醒</Label>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="notifications" className="text-sm">启用通知</Label>
                  <Switch
                    id="notifications"
                    checked={formData.notificationsEnabled}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, notificationsEnabled: checked }))
                    }
                  />
                </div>
              </div>

              {formData.notificationsEnabled && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      type="time"
                      value={formData.newReminderTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, newReminderTime: e.target.value }))}
                    />
                    <Button type="button" onClick={addReminder} size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      添加
                    </Button>
                  </div>

                  {formData.reminders.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.reminders.map((time) => (
                        <Badge
                          key={time}
                          variant="secondary"
                          className="gap-2 cursor-pointer hover:bg-destructive hover:text-white transition-colors"
                          onClick={() => removeReminder(time)}
                        >
                          <Clock className="h-3 w-3" />
                          {time}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Submit Button */}
          <Card className="p-6">
            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:shadow-glow text-lg py-6"
            >
              创建习惯
            </Button>
          </Card>
        </form>
      </main>
    </div>
  );
};

export default CreateHabit;