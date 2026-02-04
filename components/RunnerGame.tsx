import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  JUMP_FORCE,
  INITIAL_SPEED,
  MAX_SPEED,
  ACCELERATION,
  BIRD_RADIUS,
  GROUND_HEIGHT,
} from '../config/runnerConfig';
import { updatePhysics } from '../game/runner/physics';
import { checkCollision, Obstacle } from '../game/runner/collision';
import { shouldSpawn, spawnObstacle, calculateNextSpawn } from '../game/runner/spawning';
import { drawBackground, drawObstacle, drawPlayer } from '../game/runner/rendering';

interface RunnerGameProps {
  onGameOver: (popcornEarned: number, eatenLasagna: boolean) => void;
  hasSuperJump: boolean;
  hasSantaSuit: boolean;
}    

const RunnerGame: React.FC<RunnerGameProps> = ({ onGameOver, hasSuperJump, hasSantaSuit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(INITIAL_SPEED);
  
  // Mutable Game State
  const gameState = useRef({
    isPlaying: true,
    birdY: 200,
    velocity: 0,
    obstacles: [] as Obstacle[],
    frame: 0,
    score: 0,
    gotLasagna: false,
    groundY: 0,
    width: 0,
    height: 0,
    speed: INITIAL_SPEED,
    nextSpawn: 0,
    isGliding: false,
  });

  const jump = useCallback(() => {
    if (!gameState.current.isPlaying) return;
    
    const state = gameState.current;
    // Forgiving ground check (within 15px of ground)
    const distToGround = state.groundY - (state.birdY + BIRD_RADIUS);
    const isOnGround = distToGround <= 15;
    
    if (isOnGround) {
      state.velocity = JUMP_FORCE;
    } else if (hasSuperJump && state.velocity > -4) {
      // Double jump logic
      state.velocity = JUMP_FORCE * 0.9;
    }
  }, [hasSuperJump]);

  const startGlide = () => { gameState.current.isGliding = true; };
  const endGlide = () => { gameState.current.isGliding = false; };
  
  const slam = useCallback(() => { 
    if (!gameState.current.isPlaying) return;
    gameState.current.velocity = 15; // Fast drop
  }, []);

  // Handle Touch/Click for Jump/Glide
  const handleInputStart = (e: React.TouchEvent | React.MouseEvent) => {
    // If clicking a button, don't jump
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    
    startGlide();
    jump();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize dimensions
    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gameState.current.width = canvas.width;
      gameState.current.height = canvas.height;
      gameState.current.groundY = canvas.height - GROUND_HEIGHT;
      // Reset position on resize only if way off screen
      if (gameState.current.birdY > canvas.height) {
        gameState.current.birdY = canvas.height - 200;
      }
    };
    setSize();
    window.addEventListener('resize', setSize);

    // Initial Spawn setup
    gameState.current.nextSpawn = 60;

    let animationFrameId: number;

    const loop = () => {
      if (!gameState.current.isPlaying) return;

      const state = gameState.current;
      const { width, height, groundY } = state;
      state.frame++;

      // 1. Update Physics
      // Increase game speed slowly
      if (state.speed < MAX_SPEED) {
        state.speed += ACCELERATION;
      }

      // Update physics
      const physicsState = updatePhysics({
        birdY: state.birdY,
        velocity: state.velocity,
        isGliding: state.isGliding,
        groundY: state.groundY,
      });
      state.birdY = physicsState.birdY;
      state.velocity = physicsState.velocity;

      // 2. Spawning Logic
      if (shouldSpawn(state.frame, state.nextSpawn)) {
        const obstacle = spawnObstacle({
          frame: state.frame,
          nextSpawn: state.nextSpawn,
          speed: state.speed,
          gotLasagna: state.gotLasagna,
          groundY: state.groundY,
          width: state.width,
        });
        state.obstacles.push(obstacle);
        state.nextSpawn = calculateNextSpawn(state.frame, state.speed);
      }

      // 3. Update Obstacles & Collision
      for (let i = state.obstacles.length - 1; i >= 0; i--) {
        const obs = state.obstacles[i];
        obs.x -= state.speed;

        const collision = checkCollision(80, state.birdY, obs);

        if (collision.hit) {
          if (collision.type === 'rock') {
            state.isPlaying = false;
            onGameOver(state.score, state.gotLasagna);
          } else if (collision.type === 'popcorn') {
            state.score += 10;
            state.obstacles.splice(i, 1);
            setScore(state.score);
          } else if (collision.type === 'lasagna') {
            state.gotLasagna = true;
            state.score += 100;
            state.obstacles.splice(i, 1);
            setScore(state.score);
          }
        }

        // Cleanup
        if (obs.x < -150) {
          state.obstacles.splice(i, 1);
        }
      }

      // Sync speed to UI
      if (state.frame % 30 === 0) setGameSpeed(state.speed);

      // 4. Drawing
      ctx.clearRect(0, 0, width, height);
      drawBackground(ctx, width, height, state.groundY, hasSantaSuit);
      
      state.obstacles.forEach(obs => drawObstacle(ctx, obs));
      drawPlayer(ctx, state.birdY, state.velocity, state.frame, hasSantaSuit);

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', setSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [hasSantaSuit, hasSuperJump, onGameOver]);

  return (
    <div 
      className="relative w-full h-full overflow-hidden select-none touch-none"
      onMouseDown={handleInputStart}
      onTouchStart={handleInputStart}
      onMouseUp={endGlide}
      onTouchEnd={endGlide}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {/* HUD */}
      <div className="absolute top-4 left-4 flex gap-4 pointer-events-none">
        <div className="bg-white/90 rounded-full px-5 py-2 font-black text-xl text-orange-600 border-4 border-orange-300 shadow-lg">
          🍿 {score}
        </div>
        <div className="bg-white/90 rounded-full px-4 py-2 font-bold text-blue-500 border-2 border-blue-300 shadow-lg text-sm flex items-center">
          ⚡ {(gameSpeed * 10).toFixed(0)} km/h
        </div>
      </div>

      {/* Touch Controls Overlay Hints */}
      <div className="absolute bottom-8 w-full flex justify-between px-8 pointer-events-none">
        <div className="text-white/50 font-bold text-2xl animate-pulse drop-shadow-lg">
          TAP TO JUMP
        </div>
        
        <button 
          className="pointer-events-auto bg-red-500 hover:bg-red-600 text-white font-black py-6 px-6 rounded-full shadow-xl border-b-8 border-red-800 active:border-b-0 active:translate-y-2 transition-all transform hover:scale-110"
          onMouseDown={(e) => { e.stopPropagation(); slam(); }}
          onTouchStart={(e) => { e.stopPropagation(); slam(); }}
        >
          ⬇️ DROP
        </button>
      </div>

      <div className="absolute top-4 right-4">
        <button 
          className="bg-gray-800/50 text-white px-4 py-2 rounded-full font-bold hover:bg-gray-800 transition"
          onClick={(e) => { e.stopPropagation(); onGameOver(score, false); }}
        >
          ❌ STOP
        </button>
      </div>
    </div>
  );
};

export default RunnerGame;