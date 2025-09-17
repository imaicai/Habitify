import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Navbar } from '@/components/Navbar';
import { 
  Trophy, 
  Plus, 
  Zap, 
  Gift, 
  Star,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Reward } from '@/types/habit';
import { getRewards, saveReward, redeemReward, getUser } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const energyCostOptions = [
  { value: 'streak_7' as const, label: '较少 (7天连续)', days: 7, energy: 14 },
  { value: 'streak_14' as const, label: '一般 (14天连续)', days: 14, energy: 28 },
  { value: 'streak_30' as const, label: '较多 (30天连续)', days: 30, energy: 60 },
  { value: 'streak_60' as const, label: '很多 (60天连续)', days: 60, energy: 120 },
  { value: 'custom' as const, label: '自定义', days: 0, energy: 0 },
];

const Rewards = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [user, setUser] = useState(getUser());
  const { toast } = useToast();

  const [newReward, setNewReward] = useState({
    title: '',
    description: '',
    category: 'streak_7' as Reward['category'],
    customEnergy: 10,
    isRepeatable: false,
  });

  useEffect(() => {
    setRewards(getRewards());
    setUser(getUser());
  }, []);

  const calculateEnergyCost = () => {
    const option = energyCostOptions.find(opt => opt.value === newReward.category);
    return newReward.category === 'custom' ? newReward.customEnergy : (option?.energy || 0);
  };

  const handleCreateReward = () => {
    if (!newReward.title.trim()) {
      toast({
        title: "请输入奖励标题",
        variant: "destructive",
      });
      return;
    }

    const reward: Reward = {
      id: crypto.randomUUID(),
      title: newReward.title.trim(),
      description: newReward.description.trim(),
      energyCost: calculateEnergyCost(),
      isRepeatable: newReward.isRepeatable,
      timesRedeemed: 0,
      createdAt: new Date(),
      category: newReward.category,
    };

    saveReward(reward);
    setRewards(prev => [...prev, reward]);
    setIsCreateDialogOpen(false);
    
    // Reset form
    setNewReward({
      title: '',
      description: '',
      category: 'streak_7',
      customEnergy: 10,
      isRepeatable: false,
    });

    toast({
      title: "奖励创建成功！",
      description: `"${reward.title}" 已添加到奖励列表`,
    });
  };

  const handleRedeemReward = (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return;

    if (user.totalEnergy < reward.energyCost) {
      toast({
        title: "能量不足",
        description: `需要 ${reward.energyCost} 点能量，你目前有 ${user.totalEnergy} 点`,
        variant: "destructive",
      });
      return;
    }

    if (!reward.isRepeatable && reward.timesRedeemed > 0) {
      toast({
        title: "无法重复兑换",
        description: "这个奖励只能兑换一次",
        variant: "destructive",
      });
      return;
    }

    const success = redeemReward(rewardId);
    if (success) {
      setRewards(getRewards());
      setUser(getUser());
      
      toast({
        title: "兑换成功！",
        description: `恭喜获得奖励：${reward.title}`,
      });
    }
  };

  const getCategoryInfo = (category: Reward['category']) => {
    return energyCostOptions.find(opt => opt.value === category);
  };

  const availableRewards = rewards.filter(r => r.isRepeatable || r.timesRedeemed === 0);
  const redeemedRewards = rewards.filter(r => !r.isRepeatable && r.timesRedeemed > 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Trophy className="h-8 w-8 text-primary" />
              奖励中心
            </h1>
            <p className="text-muted-foreground mt-2">
              用你的能量兑换精彩奖励
            </p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:shadow-glow gap-2">
                <Plus className="h-4 w-4" />
                添加奖励
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>创建新奖励</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">奖励标题</Label>
                  <Input
                    id="title"
                    value={newReward.title}
                    onChange={(e) => setNewReward(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="例如：看一部电影"
                  />
                </div>

                <div>
                  <Label htmlFor="description">奖励描述</Label>
                  <Textarea
                    id="description"
                    value={newReward.description}
                    onChange={(e) => setNewReward(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="详细描述这个奖励..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>兑换所需能量</Label>
                  <Select
                    value={newReward.category}
                    onValueChange={(value) => setNewReward(prev => ({ 
                      ...prev, 
                      category: value as Reward['category'] 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {energyCostOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                          {option.value !== 'custom' && (
                            <span className="ml-2 text-muted-foreground">
                              ({option.energy} 能量)
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {newReward.category === 'custom' && (
                  <div>
                    <Label>自定义能量值</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newReward.customEnergy}
                      onChange={(e) => setNewReward(prev => ({ 
                        ...prev, 
                        customEnergy: parseInt(e.target.value) || 1 
                      }))}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="repeatable"
                    checked={newReward.isRepeatable}
                    onCheckedChange={(checked) => 
                      setNewReward(prev => ({ ...prev, isRepeatable: checked }))
                    }
                  />
                  <Label htmlFor="repeatable">可重复兑换</Label>
                </div>

                <Button 
                  onClick={handleCreateReward} 
                  className="w-full bg-gradient-primary hover:shadow-glow"
                >
                  创建奖励
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Energy Status */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-energy/10 to-primary/10 border-energy/20">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-energy p-4 rounded-2xl shadow-medium">
              <Zap className="h-8 w-8 text-white energy-orb" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">当前能量</h3>
              <p className="text-3xl font-bold text-energy">{user.totalEnergy} 点</p>
              <p className="text-sm text-muted-foreground">
                总计获得：{user.totalEnergyEarned} | 已花费：{user.totalEnergySpent}
              </p>
            </div>
          </div>
        </Card>

        {rewards.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="bg-gradient-primary p-6 rounded-2xl shadow-medium">
                <Gift className="h-12 w-12 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">还没有奖励</h3>
                <p className="text-muted-foreground mb-4">
                  添加一些奖励来激励自己坚持习惯
                </p>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-gradient-primary hover:shadow-glow gap-2"
                >
                  <Plus className="h-4 w-4" />
                  添加第一个奖励
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Available Rewards */}
            {availableRewards.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Star className="h-6 w-6 text-primary" />
                  可兑换奖励
                </h2>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {availableRewards.map((reward) => {
                    const categoryInfo = getCategoryInfo(reward.category);
                    const canRedeem = user.totalEnergy >= reward.energyCost;
                    
                    return (
                      <Card 
                        key={reward.id} 
                        className={cn(
                          "p-6 transition-smooth hover:shadow-medium",
                          canRedeem ? "ring-2 ring-primary/20 bg-primary/5" : "opacity-75"
                        )}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{reward.title}</h3>
                            {reward.description && (
                              <p className="text-muted-foreground text-sm mt-1">
                                {reward.description}
                              </p>
                            )}
                          </div>
                          
                          {reward.isRepeatable && (
                            <Badge variant="secondary">可重复</Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Zap className="h-4 w-4 text-energy" />
                              <span className="font-medium text-energy">
                                {reward.energyCost} 能量
                              </span>
                            </div>
                            
                            {categoryInfo && categoryInfo.days > 0 && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{categoryInfo.days}天连续</span>
                              </div>
                            )}
                            
                            {reward.timesRedeemed > 0 && (
                              <div className="flex items-center gap-1">
                                <CheckCircle className="h-4 w-4 text-success" />
                                <span>已兑换 {reward.timesRedeemed} 次</span>
                              </div>
                            )}
                          </div>

                          <Button
                            onClick={() => handleRedeemReward(reward.id)}
                            disabled={!canRedeem}
                            className={cn(
                              "gap-2",
                              canRedeem 
                                ? "bg-gradient-primary hover:shadow-glow" 
                                : "opacity-50 cursor-not-allowed"
                            )}
                          >
                            {canRedeem ? (
                              <>
                                <Trophy className="h-4 w-4" />
                                兑换
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-4 w-4" />
                                能量不足
                              </>
                            )}
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Redeemed Rewards */}
            {redeemedRewards.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-success" />
                  已兑换奖励
                </h2>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {redeemedRewards.map((reward) => (
                    <Card key={reward.id} className="p-6 bg-success/5 border-success/20">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-success">{reward.title}</h3>
                          {reward.description && (
                            <p className="text-muted-foreground text-sm mt-1">
                              {reward.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                            <div className="flex items-center gap-1">
                              <Zap className="h-4 w-4 text-energy" />
                              <span>花费 {reward.energyCost} 能量</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4 text-success" />
                              <span>已兑换</span>
                            </div>
                          </div>
                        </div>
                        
                        <Badge className="bg-success text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          完成
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Rewards;