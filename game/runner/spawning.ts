import { OBSTACLE_SIZE, SPAWN_RATE_MIN, SPAWN_RATE_MAX } from '../../config/runnerConfig';
import { Obstacle } from './collision';

export interface SpawnState {
  frame: number;
  nextSpawn: number;
  speed: number;
  gotLasagna: boolean;
  groundY: number;
  width: number;
}

export type SpawnCheckParams = Pick<SpawnState, 'frame' | 'nextSpawn'>;

export const shouldSpawn = (frame: number, nextSpawn: number): boolean => {
  return frame >= nextSpawn;
};

export const spawnObstacle = (state: SpawnState): Obstacle => {
  const typeRoll = Math.random();
  let type: 'rock' | 'popcorn' | 'lasagna' = 'rock';
  let y = state.groundY - OBSTACLE_SIZE;

  if (typeRoll > 0.96 && !state.gotLasagna) {
    type = 'lasagna';
    y = state.groundY - 200; // Higher up
  } else if (typeRoll > 0.60) {
    type = 'popcorn';
    y = state.groundY - (Math.random() * 160 + 70); // Random height
  }

  return {
    x: state.width,
    y: y,
    w: OBSTACLE_SIZE,
    h: OBSTACLE_SIZE,
    type,
  };
};

export const calculateNextSpawn = (frame: number, speed: number): number => {
  const rate = Math.max(SPAWN_RATE_MIN, SPAWN_RATE_MAX - (speed * 8));
  return frame + rate + (Math.random() * 40);
};
