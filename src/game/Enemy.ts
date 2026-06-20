import { EnemyType, ENEMY_WIDTH, ENEMY_HEIGHT } from './types';

export class Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  type: EnemyType;
  alive = true;
  private animFrame = 0;
  private animTimer = 0;

  constructor(x: number, y: number, type: EnemyType) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = ENEMY_WIDTH;
    this.height = ENEMY_HEIGHT;
    this.health = type;
    this.maxHealth = type;
  }

  hit(): boolean {
    this.health--;
    if (this.health <= 0) {
      this.alive = false;
      return true;
    }
    return false;
  }

  update(deltaTime: number) {
    this.animTimer += deltaTime;
    if (this.animTimer > 300) {
      this.animFrame = (this.animFrame + 1) % 2;
      this.animTimer = 0;
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    if (!this.alive) return;

    const { x, y, width, height, type, animFrame } = this;
    const cx = x + width / 2;
    const cy = y + height / 2;

    switch (type) {
      case EnemyType.Easy:
        this.renderEasy(ctx, cx, cy, animFrame);
        break;
      case EnemyType.Medium:
        this.renderMedium(ctx, cx, cy, animFrame);
        break;
      case EnemyType.Heavy:
        this.renderHeavy(ctx, cx, cy, animFrame);
        break;
    }

    // Health bar for non-easy enemies
    if (this.maxHealth > 1) {
      const barWidth = width - 4;
      const barHeight = 4;
      const barX = x + 2;
      const barY = y - 6;

      ctx.fillStyle = '#333';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      ctx.fillStyle = this.health === this.maxHealth ? '#0f0' : '#ff0';
      ctx.fillRect(barX, barY, barWidth * (this.health / this.maxHealth), barHeight);
    }
  }

  private renderEasy(ctx: CanvasRenderingContext2D, cx: number, cy: number, frame: number) {
    ctx.fillStyle = '#0ff';
    // Simple crab-like alien
    ctx.fillRect(cx - 12, cy - 8, 24, 14);
    ctx.fillRect(cx - 16, cy - 4, 6, 8);
    ctx.fillRect(cx + 10, cy - 4, 6, 8);
    ctx.fillRect(cx - 8, cy - 12, 4, 4);
    ctx.fillRect(cx + 4, cy - 12, 4, 4);
    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(cx - 6, cy - 4, 4, 4);
    ctx.fillRect(cx + 2, cy - 4, 4, 4);
    // Legs
    ctx.fillStyle = '#0ff';
    ctx.fillRect(cx - 14, cy + 6, 4, frame === 0 ? 4 : 2);
    ctx.fillRect(cx + 10, cy + 6, 4, frame === 0 ? 4 : 2);
  }

  private renderMedium(ctx: CanvasRenderingContext2D, cx: number, cy: number, frame: number) {
    ctx.fillStyle = '#f0f';
    // Octopus-like alien
    ctx.fillRect(cx - 14, cy - 10, 28, 16);
    ctx.fillRect(cx - 8, cy - 14, 16, 6);
    // Tentacles
    ctx.fillRect(cx - 16, cy + 2, 4, frame === 0 ? 6 : 4);
    ctx.fillRect(cx - 8, cy + 2, 4, frame === 0 ? 8 : 6);
    ctx.fillRect(cx - 2, cy + 2, 4, frame === 0 ? 8 : 6);
    ctx.fillRect(cx + 4, cy + 2, 4, frame === 0 ? 6 : 8);
    ctx.fillRect(cx + 12, cy + 2, 4, frame === 0 ? 4 : 6);
    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(cx - 8, cy - 6, 4, 4);
    ctx.fillRect(cx + 4, cy - 6, 4, 4);
  }

  private renderHeavy(ctx: CanvasRenderingContext2D, cx: number, cy: number, frame: number) {
    ctx.fillStyle = '#f00';
    // Squid-like boss
    ctx.fillRect(cx - 16, cy - 12, 32, 20);
    ctx.fillRect(cx - 20, cy - 8, 8, 12);
    ctx.fillRect(cx + 12, cy - 8, 8, 12);
    // Head
    ctx.fillRect(cx - 12, cy - 16, 24, 6);
    // Legs
    ctx.fillRect(cx - 18, cy + 4, 4, frame === 0 ? 8 : 6);
    ctx.fillRect(cx - 8, cy + 4, 4, frame === 0 ? 10 : 8);
    ctx.fillRect(cx + 4, cy + 4, 4, frame === 0 ? 8 : 10);
    ctx.fillRect(cx + 14, cy + 4, 4, frame === 0 ? 6 : 8);
    // Eyes
    ctx.fillStyle = '#ff0';
    ctx.fillRect(cx - 10, cy - 8, 6, 6);
    ctx.fillRect(cx + 4, cy - 8, 6, 6);
    ctx.fillStyle = '#000';
    ctx.fillRect(cx - 8, cy - 6, 2, 2);
    ctx.fillRect(cx + 6, cy - 6, 2, 2);
  }
}