export interface UserStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  lastActiveDate: string;
  username?: string;
  avatarUrl?: string;
}

export type TaskStatus = 'todo' | 'inprogress' | 'inreview' | 'complete';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  xpReward: number;
  isQuest: boolean; // True for gamified daily quests
  dueDate?: string;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  parentId: string | null; // For hierarchical nesting
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  color?: string;
}

export interface Goal {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  period: 'daily' | 'weekly';
  category: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  assetSymbol: string;
  assetName: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number; // price per unit
  date: string;
}

export interface AssetHolding {
  symbol: string;
  name: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  category: 'crypto' | 'stock' | 'cash' | 'metal' | 'other';
}
