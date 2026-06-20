import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
} from './types';

export class Player {
  x: number;
  y: number;
  width: number;
  height: number;
  private speed: number;
  private moveLeft = false;
  private moveRight = false;
  private lastFireTime = 0;
  private powerUpEndTime = 0;
  public hasPowerUp = false;

  constructor() {
    this.width = PLAYER_WIDTH;
    this.height = PLAYER_HEIGHT;
    this.x = (GAME_WIDTH - this.width) / 2;
    this.y = GAME_HEIGHT - this.height - 20;
    this.speed = PLAYER_SPEED;
  }

  setMoveLeft(val: boolean) {
    this.moveLeft = val;
  }

  setMoveRight(val: boolean) {
    this.moveRight = val;
  }

  canFire(currentTime: number): boolean {
    return currentTime - this.lastFireTime >= 200;
  }

  fire(currentTime: number) {
    this.lastFireTime = currentTime;
  }

  activatePowerUp(duration: number) {
    this.hasPowerUp = true;
    this.powerUpEndTime = Date.now() + duration;
  }

  update(deltaTime: number) {
    if (this.moveLeft) {
      this.x -= this.speed * (deltaTime / 16);
    }
    if (this.moveRight) {
      this.x += this.speed * (deltaTime / 16);
    }
    this.x = Math.max(0, Math.min(GAME_WIDTH - this.width, this.x));

    if (this.hasPowerUp && Date.now() > this.powerUpEndTime) {
      this.hasPowerUp = false;
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    const { x, y, width, height } = this;

    // Ship body
    ctx.fillStyle = this.hasPowerUp ? '#ff0' : '#0f0';
    ctx.fillRect(x + width / 4, y, width / 2, height * 0.4);

    ctx.fillStyle = this.hasPowerUp ? '#ff0' : '#0f0';
    ctx.fillRect(x, y + height * 0.3, width, height * 0.3);

    // Wings
    ctx.fillRect(x, y + height * 0.5, width * 0.25, height * 0.5);
    ctx.fillRect(x + width * 0.75, y + height * 0.5, width * 0.25, height * 0.5);

    // Cockpit
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + width / 2 - 4, y + 2, 8, 6);

    // Power-up glow
    if (this.hasPowerUp) {
      ctx.strokeStyle = '#ff0';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
    }
  }

  getCenterX(): number {
    return this.x + this.width / 2;
  }
}