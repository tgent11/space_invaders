import { BULLET_WIDTH, BULLET_HEIGHT, BULLET_SPEED, GAME_HEIGHT } from './constants';

export class Bullet {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  isPlayerBullet: boolean;
  damage = 1;
  active = true;

  constructor(x: number, y: number, isPlayerBullet: boolean) {
    this.x = x;
    this.y = y;
    this.width = BULLET_WIDTH;
    this.height = BULLET_HEIGHT;
    this.speed = BULLET_SPEED;
    this.isPlayerBullet = isPlayerBullet;
  }

  update(deltaTime: number): void {
    const factor = deltaTime / 16;
    if (this.isPlayerBullet) {
      this.y -= this.speed * factor;
    } else {
      this.y += this.speed * factor;
    }

    if (this.isPlayerBullet) {
      this.active = this.y + this.height > 0;
    } else {
      this.active = this.y < GAME_HEIGHT;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;
    
    ctx.fillStyle = this.isPlayerBullet ? '#fff' : '#f80';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}