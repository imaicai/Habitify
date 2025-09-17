import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Navbar } from '@/components/Navbar';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Volume2, 
  Smartphone,
  Calendar,
  Trash2,
  Download,
  Upload,
  AlertTriangle
} from 'lucide-react';
import { getUser, saveUser, getHabits, getCompletions, getRewards } from '@/lib/storage';
import { User as UserType } from '@/types/habit';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const Settings = () => {
  const [user, setUser] = useState<UserType>(getUser());
  const { toast } = useToast();

  const handleUpdateProfile = (updates: Partial<UserType>) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    saveUser(updatedUser);
    
    toast({
      title: "设置已保存",
      description: "你的更改已成功保存",
    });
  };

  const handleUpdateSettings = (settingKey: keyof UserType['settings'], value: boolean) => {
    const updatedUser = {
      ...user,
      settings: {
        ...user.settings,
        [settingKey]: value,
      },
    };
    setUser(updatedUser);
    saveUser(updatedUser);
  };

  const exportData = () => {
    const data = {
      user: getUser(),
      habits: getHabits(),
      completions: getCompletions(),
      rewards: getRewards(),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "数据导出成功",
      description: "数据备份文件已下载",
    });
  };

  const clearAllData = () => {
    localStorage.clear();
    
    toast({
      title: "数据已清除",
      description: "所有数据已被清除，页面将刷新",
    });
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast({
          title: "通知权限已开启",
          description: "你将收到习惯提醒通知",
        });
        handleUpdateSettings('notificationsEnabled', true);
      } else {
        toast({
          title: "通知权限被拒绝",
          description: "请在浏览器设置中手动开启通知权限",
          variant: "destructive",
        });
        handleUpdateSettings('notificationsEnabled', false);
      }
    } else {
      toast({
        title: "不支持通知",
        description: "你的浏览器不支持通知功能",
        variant: "destructive",
      });
    }
  };

  const memberSince = new Date(user.joinedAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <SettingsIcon className="h-8 w-8 text-primary" />
            设置
          </h1>
          <p className="text-muted-foreground">
            管理你的账户和应用偏好
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">账户信息</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  value={user.name}
                  onChange={(e) => setUser(prev => ({ ...prev, name: e.target.value }))}
                  onBlur={() => handleUpdateProfile({ name: user.name })}
                  placeholder="输入你的姓名"
                />
              </div>
              
              <div>
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  onChange={(e) => setUser(prev => ({ ...prev, email: e.target.value }))}
                  onBlur={() => handleUpdateProfile({ email: user.email })}
                  placeholder="输入你的邮箱"
                />
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>加入时间：{memberSince}</p>
                  <p>总能量：{user.totalEnergyEarned} 点</p>
                  <p>已消费：{user.totalEnergySpent} 点</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">通知设置</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>推送通知</Label>
                  <p className="text-sm text-muted-foreground">
                    接收习惯提醒和进度通知
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={user.settings.notificationsEnabled}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        requestNotificationPermission();
                      } else {
                        handleUpdateSettings('notificationsEnabled', false);
                      }
                    }}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>仅打卡提醒</Label>
                  <p className="text-sm text-muted-foreground">
                    只接收打卡提醒，不接收其他通知
                  </p>
                </div>
                <Switch
                  checked={user.settings.checkinRemindersOnly}
                  onCheckedChange={(checked) => handleUpdateSettings('checkinRemindersOnly', checked)}
                  disabled={!user.settings.notificationsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>每周进展提醒</Label>
                  <p className="text-sm text-muted-foreground">
                    每周日收到进展总结通知
                  </p>
                </div>
                <Switch
                  checked={user.settings.weeklyProgressReminders}
                  onCheckedChange={(checked) => handleUpdateSettings('weeklyProgressReminders', checked)}
                  disabled={!user.settings.notificationsEnabled}
                />
              </div>
            </div>
          </Card>

          {/* Sound Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Volume2 className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">声音设置</h3>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>音效提示</Label>
                <p className="text-sm text-muted-foreground">
                  打卡时播放音效反馈
                </p>
              </div>
              <Switch
                checked={user.settings.soundEnabled}
                onCheckedChange={(checked) => handleUpdateSettings('soundEnabled', checked)}
              />
            </div>
          </Card>

          {/* Data Management */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Smartphone className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">数据管理</h3>
            </div>
            
            <div className="space-y-4">
              <Button
                onClick={exportData}
                variant="outline"
                className="w-full gap-2"
              >
                <Download className="h-4 w-4" />
                导出数据备份
              </Button>

              <div className="text-sm text-muted-foreground">
                <p>导出功能可以将你的所有习惯数据保存为JSON文件，用于备份或迁移。</p>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="p-6 border-destructive/20 bg-destructive/5">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h3 className="text-lg font-semibold text-destructive">危险区域</h3>
            </div>
            
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>以下操作不可逆，请谨慎操作。建议在执行前先导出数据备份。</p>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full gap-2">
                    <Trash2 className="h-4 w-4" />
                    清除所有数据
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>确认清除所有数据？</AlertDialogTitle>
                    <AlertDialogDescription>
                      此操作将永久删除所有习惯、打卡记录、奖励和设置。这个操作无法撤销。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={clearAllData}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      确认清除
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>

          {/* App Info */}
          <Card className="p-6">
            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>习惯养成应用 v1.0.0</p>
              <p>专注成长每一天 🌱</p>
              <p className="text-xs">
                使用本地存储，数据保存在你的设备上
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;