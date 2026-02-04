import { GRAVITY, GLIDE_FORCE, BIRD_RADIUS } from '../../config/runnerConfig';

export interface PhysicsState {
  birdY: number;
  velocity: number;
  isGliding: boolean;
  groundY: number;
}

export const updatePhysics = (state: PhysicsState): PhysicsState => {
  const newState = { ...state };
  
  // Apply gravity or glide
  if (newState.isGliding && newState.velocity > 0) {
    newState.velocity += GLIDE_FORCE; // Fall slower
  } else {
    newState.velocity += GRAVITY;
  }
  
  newState.birdY += newState.velocity;

  // Floor Collision
  const floorLimit = newState.groundY - BIRD_RADIUS;
  if (newState.birdY >= floorLimit) {
    newState.birdY = floorLimit;
    newState.velocity = 0;
  }
  
  // Ceiling Collision
  if (newState.birdY < BIRD_RADIUS) {
    newState.birdY = BIRD_RADIUS;
    newState.velocity = 0;
  }

  return newState;
};
