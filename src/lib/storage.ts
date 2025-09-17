import { Habit, HabitCompletion, Reward, User, Stats } from '@/types/habit';

const STORAGE_KEYS = {
  HABITS: 'habit-tracker-habits',
  COMPLETIONS: 'habit-tracker-completions',
  REWARDS: 'habit-tracker-rewards',
  USER: 'habit-tracker-user',
} as const;

// Default user data
const createDefaultUser = (): User => ({
  id: 'default-user',
  name: '习惯养成者',
  email: '',
  totalEnergy: 0,
  totalEnergyEarned: 0,
  totalEnergySpent: 0,
  joinedAt: new Date(),
  settings: {
    soundEnabled: true,
    notificationsEnabled: true,
    checkinRemindersOnly: false,
    weeklyProgressReminders: true,
  },
});

// Utility functions for localStorage
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Habit management
export const getHabits = (): Habit[] => {
  return getStorageItem(STORAGE_KEYS.HABITS, []);
};

export const saveHabit = (habit: Habit): void => {
  const habits = getHabits();
  const existingIndex = habits.findIndex(h => h.id === habit.id);
  
  if (existingIndex >= 0) {
    habits[existingIndex] = habit;
  } else {
    habits.push(habit);
  }
  
  setStorageItem(STORAGE_KEYS.HABITS, habits);
};

export const deleteHabit = (habitId: string): void => {
  const habits = getHabits().filter(h => h.id !== habitId);
  setStorageItem(STORAGE_KEYS.HABITS, habits);
  
  // Also remove related completions
  const completions = getCompletions().filter(c => c.habitId !== habitId);
  setStorageItem(STORAGE_KEYS.COMPLETIONS, completions);
};

// Completion management
export const getCompletions = (): HabitCompletion[] => {
  return getStorageItem(STORAGE_KEYS.COMPLETIONS, []);
};

export const addCompletion = (completion: HabitCompletion): void => {
  const completions = getCompletions();
  completions.push(completion);
  setStorageItem(STORAGE_KEYS.COMPLETIONS, completions);
  
  // Update user energy
  const user = getUser();
  user.totalEnergy += completion.energyEarned;
  user.totalEnergyEarned += completion.energyEarned;
  saveUser(user);
};

// Reward management
export const getRewards = (): Reward[] => {
  return getStorageItem(STORAGE_KEYS.REWARDS, []);
};

export const saveReward = (reward: Reward): void => {
  const rewards = getRewards();
  const existingIndex = rewards.findIndex(r => r.id === reward.id);
  
  if (existingIndex >= 0) {
    rewards[existingIndex] = reward;
  } else {
    rewards.push(reward);
  }
  
  setStorageItem(STORAGE_KEYS.REWARDS, rewards);
};

export const redeemReward = (rewardId: string): boolean => {
  const rewards = getRewards();
  const reward = rewards.find(r => r.id === rewardId);
  const user = getUser();
  
  if (!reward || user.totalEnergy < reward.energyCost) {
    return false;
  }
  
  // Deduct energy and increment redemption count
  user.totalEnergy -= reward.energyCost;
  user.totalEnergySpent += reward.energyCost;
  reward.timesRedeemed += 1;
  
  saveUser(user);
  saveReward(reward);
  return true;
};

// User management
export const getUser = (): User => {
  return getStorageItem(STORAGE_KEYS.USER, createDefaultUser());
};

export const saveUser = (user: User): void => {
  setStorageItem(STORAGE_KEYS.USER, user);
};

// Statistics
export const getStats = (): Stats => {
  const habits = getHabits();
  const completions = getCompletions();
  const rewards = getRewards();
  const user = getUser();
  
  const activeHabits = habits.filter(h => {
    const today = new Date().toDateString();
    const lastCompleted = h.lastCompletedDate?.toDateString();
    return !lastCompleted || lastCompleted === today || h.currentStreak > 0;
  }).length;
  
  const totalCompletions = completions.length;
  const currentStreaks = habits.reduce((sum, h) => sum + h.currentStreak, 0);
  const totalRewardsRedeemed = rewards.reduce((sum, r) => sum + r.timesRedeemed, 0);
  
  // Weekly progress (last 7 days)
  const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toDateString();
    
    const dayCompletions = completions.filter(c => 
      new Date(c.date).toDateString() === dateStr
    );
    
    return {
      day: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
      completions: dayCompletions.length,
      energy: dayCompletions.reduce((sum, c) => sum + c.energyEarned, 0),
    };
  }).reverse();
  
  return {
    totalHabits: habits.length,
    activeHabits,
    totalCompletions,
    currentStreaks,
    totalEnergyEarned: user.totalEnergyEarned,
    totalRewardsRedeemed,
    weeklyProgress,
  };
};