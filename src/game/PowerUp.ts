import { POWERUP_SIZE, POWERUP_SPEED, GAME_HEIGHT } from './constants';

export class PowerUp {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  active = true;
  private animFrame = 0;
  private animTimer = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.width = POWERUP_SIZE;
    this.height = POWERUP_SIZE;
    this.speed = POWERUP_SPEED;
  }

  collect(): void {
    this.active = false;
  }

  update(deltaTime: number): void {
    this.y += this.speed * (deltaTime / 16);
    
    if (this.y > GAME_HEIGHT + this.height) {
      this.active = false;
    }

    this.animTimer += deltaTime;
    if (this.animTimer > 150) {
      this.animFrame = (this.animFrame + 1) % 2;
      this.animTimer = 0;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    const { x, y, width, height, animFrame } = this;
    const cx = x + width / 2;
    const cy = y + height / 2;
    const pulse = animFrame === 0;

    ctx.fillStyle = pulse ? '#ff0' : '#ffa500';
    ctx.beginPath();
    ctx.arc(cx, cy, width / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx, cy, width / 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = pulse ? '#fff' : '#ff0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, width / 2 + 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#f80';
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡', cx, cy + 1);
  }
}