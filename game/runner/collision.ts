import { BIRD_RADIUS } from '../../config/runnerConfig';

export interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'rock' | 'popcorn' | 'lasagna';
}

export interface CollisionResult {
  hit: boolean;
  type?: 'rock' | 'popcorn' | 'lasagna';
}

export const checkCollision = (
  playerX: number,
  playerY: number,
  obstacle: Obstacle
): CollisionResult => {
  // Make player hitbox significantly smaller (70% of visual) for "fluff" forgiveness
  const pR = BIRD_RADIUS * 0.7;
  const pX = playerX;
  const pY = playerY;

  // Obstacle hitbox
  const oX = obstacle.x + obstacle.w / 2;
  const oY = obstacle.y + obstacle.h / 2;
  const oR = obstacle.w / 2 * 0.85;

  // Circle collision check
  const dx = pX - oX;
  const dy = pY - oY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < pR + oR) {
    return { hit: true, type: obstacle.type };
  }

  return { hit: false };
};
