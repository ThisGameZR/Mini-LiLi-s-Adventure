
export enum GameMode {
  HOME = 'HOME',
  ADVENTURE = 'ADVENTURE',
  SHOP = 'SHOP',
}

export enum Mood {
  HAPPY = 'HAPPY',
  SLEEPY = 'SLEEPY',
  MAD = 'MAD', // Red Mode
  SMART = 'SMART', // Reading
  DANCING = 'DANCING'
}

export interface Stats {
  tummy: number; // 0-100
  joy: number;   // 0-100
  energy: number;// 0-100
}

export enum ItemId {
  LASAGNA = 'lasagna',
  POPCORN = 'popcorn',
  RED_BOW = 'red_bow',
  COOL_GLASSES = 'cool_glasses',
  SANTA_SUIT = 'santa_suit',
  RED_CAPE = 'red_cape',
}

export interface Item {
  id: ItemId;
  name: string;
  type: 'FOOD' | 'COSMETIC' | 'UPGRADE';
  cost: number;
  description: string;
  owned: boolean;
  icon: string;
  effect?: (stats: Stats) => Partial<Stats>;
}

export interface GameState {
  popcorn: number; // Currency
  inventory: Record<string, number>; // ItemId -> Count
  unlockedItems: string[]; // List of ItemIds
  stats: Stats;
  hasPoop: boolean;
  equipped: {
    hat?: ItemId;
    glasses?: ItemId;
    accessory?: ItemId;
  };
}
