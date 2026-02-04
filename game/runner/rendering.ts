import { BIRD_RADIUS } from '../../config/runnerConfig';
import { Obstacle } from './collision';

export const drawBackground = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  groundY: number,
  hasSantaSuit: boolean
) => {
  // Sky
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, hasSantaSuit ? '#0f172a' : '#7dd3fc');
  gradient.addColorStop(1, hasSantaSuit ? '#1e293b' : '#e0f2fe');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Ground
  ctx.fillStyle = hasSantaSuit ? '#f1f5f9' : '#84cc16';
  ctx.fillRect(0, groundY, width, height - groundY);
  
  // Grass detail line
  ctx.fillStyle = hasSantaSuit ? '#cbd5e1' : '#65a30d';
  ctx.fillRect(0, groundY, width, 15);
};

export const drawObstacle = (ctx: CanvasRenderingContext2D, obs: Obstacle) => {
  if (obs.type === 'rock') {
    ctx.fillStyle = '#64748b'; // Slate-500
    ctx.beginPath();
    ctx.ellipse(obs.x + obs.w / 2, obs.y + obs.h / 2, obs.w / 2, obs.h / 2 - 5, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (obs.type === 'popcorn') {
    ctx.fillStyle = '#facc15'; // Yellow-400
    ctx.beginPath();
    ctx.arc(obs.x + obs.w / 2, obs.y + obs.h / 2, obs.w / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a'; // Highlight
    ctx.beginPath();
    ctx.arc(obs.x + obs.w / 2 - 5, obs.y + obs.h / 2 - 5, obs.w / 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (obs.type === 'lasagna') {
    // Plate
    ctx.fillStyle = '#fff';
    ctx.fillRect(obs.x, obs.y + obs.h - 10, obs.w, 10);
    // Layers
    ctx.fillStyle = '#ea580c'; // Orange-600
    ctx.fillRect(obs.x + 5, obs.y + 10, obs.w - 10, obs.h - 20);
    // Cheese
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(obs.x + 5, obs.y + 15, obs.w - 10, 5);
  }
};

export const drawPlayer = (
  ctx: CanvasRenderingContext2D,
  birdY: number,
  velocity: number,
  frame: number,
  hasSantaSuit: boolean
) => {
  ctx.save();
  ctx.translate(80, birdY);
  
  const rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (velocity * 0.05)));
  ctx.rotate(rotation);

  // Body (Massive White Blob)
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.ellipse(0, 0, BIRD_RADIUS, BIRD_RADIUS * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Stroke
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Wing (Flapping)
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  const wingOffset = Math.sin(frame * 0.5) * 8;
  ctx.ellipse(-8, 5 + wingOffset, 16, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Beak
  ctx.fillStyle = '#fb923c';
  ctx.beginPath();
  ctx.ellipse(BIRD_RADIUS * 0.7, -10, 16, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(BIRD_RADIUS * 0.4, -18, 5, 0, Math.PI * 2);
  ctx.fill();
  
  // Eye Shine
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(BIRD_RADIUS * 0.4 + 2, -20, 2, 0, Math.PI * 2);
  ctx.fill();

  // Accessories
  if (hasSantaSuit) {
    ctx.fillStyle = '#ef4444'; // Red Hat
    ctx.beginPath();
    ctx.moveTo(0, -BIRD_RADIUS + 10);
    ctx.lineTo(25, -BIRD_RADIUS + 10);
    ctx.lineTo(5, -BIRD_RADIUS - 30);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(5, -BIRD_RADIUS - 30, 8, 0, Math.PI * 2); // Pom pom
    ctx.fill();
  }

  ctx.restore();
};
