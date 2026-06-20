import { POWERUP_SIZE, POWERUP_SPEED, GAME_HEIGHT } from './types';

export class PowerUp {
  x: number;
  y: number;
  width: number;
  height: number;
  private speed: number;
  private animFrame = 0;
  private animTimer = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.width = POWERUP_SIZE;
    this.height = POWERUP_SIZE;
    this.speed = POWERUP_SPEED;
  }

  get active(): boolean {
    return this.y < GAME_HEIGHT + this.height;
  }

  update(deltaTime: number) {
    this.y += this.speed * (deltaTime / 16);

    this.animTimer += deltaTime;
    if (this.animTimer > 150) {
      this.animFrame = (this.animFrame + 1) % 2;
      this.animTimer = 0;
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    const { x, y, width, height, animFrame } = this;
    const cx = x + width / 2;
    const cy = y + height / 2;

    // Glowing star
    ctx.fillStyle = '#ff0';
    ctx.beginPath();
    ctx.arc(cx, cy, width / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Inner glow
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx, cy, width / 4, 0, Math.PI * 2);
    ctx.fill();

    // Power symbol
    ctx.fillStyle = '#00f';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡', cx, cy + 1);

    // Pulsing border
    ctx.strokeStyle = animFrame === 0 ? '#ff0' : '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, width - 2, height - 2);
  }
}