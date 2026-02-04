import { Item, ItemId } from '../types';

export const TICK_RATE = 3000; // 3 seconds
export const MAX_STAT = 100;
export const STAT_DECAY = 2;
export const POKE_TEXTS = ["LoLo!", "♥️", "Loooo!!"];

export const SHOP_ITEMS: Item[] = [
  { id: ItemId.LASAGNA, name: "Lasagna", type: 'FOOD', cost: 50, description: "LiLi's favorite!", owned: false, icon: "🥘" },
  { id: ItemId.RED_BOW, name: "Red Bow", type: 'COSMETIC', cost: 200, description: "Very chic.", owned: false, icon: "🎀" },
  { id: ItemId.COOL_GLASSES, name: "Cool Glasses", type: 'COSMETIC', cost: 500, description: "+Joy gain.", owned: false, icon: "🕶️" },
  { id: ItemId.SANTA_SUIT, name: "Santa Suit", type: 'UPGRADE', cost: 2000, description: "Festive mode.", owned: false, icon: "🎅" },
  { id: ItemId.RED_CAPE, name: "Red Cape", type: 'UPGRADE', cost: 5000, description: "Super Jump!", owned: false, icon: "🦸‍♀️" },
];

export const INITIAL_STATE = {
  popcorn: 10000,
  inventory: { [ItemId.LASAGNA]: 1 },
  unlockedItems: [],
  stats: { tummy: 80, joy: 80, energy: 90 },
  hasPoop: false,
  equipped: {},
};
