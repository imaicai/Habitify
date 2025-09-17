export type HabitDifficulty = 'easy' | 'normal' | 'hard';
export type HabitIcon = 'book' | 'dumbbell' | 'apple' | 'droplets' | 'moon' | 'heart' | 'brain' | 'target' | 'coffee' | 'leaf';

export interface Habit {
  id: string;
  name: string;
  icon: HabitIcon;
  difficulty: HabitDifficulty;
  weeklyDays: number; // 1-7 days per week
  dailyFrequency: number; // 1-24 times per day
  energyPerCompletion: number; // 1-3 energy points
  reminders: string[]; // Array of time strings like "09:00"
  notificationsEnabled: boolean;
  createdAt: Date;
  currentStreak: number;
  longestStreak: number;
  completedToday: number; // How many times completed today
  lastCompletedDate: Date | null;
  weeklyProgress: boolean[]; // 7 booleans for each day of the week
}

export interface HabitCompletion {
  habitId: string;
  date: Date;
  completedCount: number;
  energyEarned: number;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  energyCost: number;
  isRepeatable: boolean;
  timesRedeemed: number;
  createdAt: Date;
  category: 'streak_7' | 'streak_14' | 'streak_30' | 'streak_60' | 'custom';
}

export interface User {
  id: string;
  name: string;
  email: string;
  totalEnergy: number;
  totalEnergyEarned: number;
  totalEnergySpent: number;
  joinedAt: Date;
  settings: UserSettings;
}

export interface UserSettings {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  checkinRemindersOnly: boolean;
  weeklyProgressReminders: boolean;
}

export interface Stats {
  totalHabits: number;
  activeHabits: number;
  totalCompletions: number;
  currentStreaks: number;
  totalEnergyEarned: number;
  totalRewardsRedeemed: number;
  weeklyProgress: {
    day: string;
    completions: number;
    energy: number;
  }[];
}