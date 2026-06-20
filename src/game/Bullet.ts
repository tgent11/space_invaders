import { BULLET_WIDTH, BULLET_HEIGHT, BULLET_SPEED, GAME_HEIGHT } from './types';

export class Bullet {
  x: number;
  y: number;
  width: number;
  height: number;
  private speed: number;
  readonly isPlayerBullet: boolean;
  public damage = 1;

  constructor(x: number, y: number, isPlayerBullet: boolean) {
    this.x = x;
    this.y = y;
    this.width = BULLET_WIDTH;
    this.height = BULLET_HEIGHT;
    this.speed = BULLET_SPEED;
    this.isPlayerBullet = isPlayerBullet;
  }

  get active(): boolean {
    if (this.isPlayerBullet) {
      return this.y + this.height > 0;
    }
    return this.y < GAME_HEIGHT;
  }

  update(deltaTime: number) {
    const factor = deltaTime / 16;
    if (this.isPlayerBullet) {
      this.y -= this.speed * factor;
    } else {
      this.y += this.speed * factor;
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.isPlayerBullet ? '#fff' : '#f80';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}