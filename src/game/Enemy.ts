import { ENEMY_WIDTH, ENEMY_HEIGHT, EnemyType } from './constants';

export class Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  type: EnemyType;
  health: number;
  maxHealth: number;
  alive = true;
  private animFrame = 0;
  private animTimer = 0;
  private flashTimer = 0;

  constructor(x: number, y: number, type: EnemyType, hp: number) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = ENEMY_WIDTH;
    this.height = ENEMY_HEIGHT;
    this.health = hp;
    this.maxHealth = hp;
  }

  takeDamage(amount: number): boolean {
    this.health -= amount;
    this.flashTimer = 150; // Flash for 150ms on hit
    if (this.health <= 0) {
      this.alive = false;
      return true;
    }
    return false;
  }

  update(deltaTime: number): void {
    this.animTimer += deltaTime;
    if (this.animTimer > 400) {
      this.animFrame = (this.animFrame + 1) % 2;
      this.animTimer = 0;
    }
    
    if (this.flashTimer > 0) {
      this.flashTimer -= deltaTime;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.alive) return;

    const { x, y, width, height, type, animFrame } = this;
    const cx = x + width / 2;
    const cy = y + height / 2;
    const isFlashing = this.flashTimer > 0;

    // Draw flash overlay if hit
    if (isFlashing) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillRect(x - 2, y - 2, width + 4, height + 4);
    }

    switch (type) {
      case EnemyType.Scout:
        this.renderScout(ctx, cx, cy, animFrame);
        break;
      case EnemyType.Fighter:
        this.renderFighter(ctx, cx, cy, animFrame);
        break;
      case EnemyType.Tank:
        this.renderTank(ctx, cx, cy, animFrame);
        break;
    }

    if (isFlashing) {
      ctx.restore();
    }

    if (this.maxHealth > 1) {
      const barWidth = width - 4;
      const barHeight = 3;
      const barX = x + 2;
      const barY = y - 6;

      ctx.fillStyle = '#333';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      ctx.fillStyle = this.health === this.maxHealth ? '#0f0' : '#ff0';
      ctx.fillRect(barX, barY, barWidth * (this.health / this.maxHealth), barHeight);
    }
  }

  private renderScout(ctx: CanvasRenderingContext2D, cx: number, cy: number, frame: number): void {
    ctx.fillStyle = '#0ff';
    ctx.fillRect(cx - 10, cy - 6, 20, 10);
    ctx.fillRect(cx - 14, cy - 3, 6, 6);
    ctx.fillRect(cx + 8, cy - 3, 6, 6);
    ctx.fillRect(cx - 7, cy - 10, 4, 4);
    ctx.fillRect(cx + 3, cy - 10, 4, 4);
    
    ctx.fillStyle = '#000';
    ctx.fillRect(cx - 5, cy - 3, 3, 3);
    ctx.fillRect(cx + 2, cy - 3, 3, 3);
    
    ctx.fillStyle = '#0ff';
    ctx.fillRect(cx - 12, cy + 4, 3, frame === 0 ? 4 : 2);
    ctx.fillRect(cx + 9, cy + 4, 3, frame === 0 ? 4 : 2);
  }

  private renderFighter(ctx: CanvasRenderingContext2D, cx: number, cy: number, frame: number): void {
    ctx.fillStyle = '#f0f';
    ctx.fillRect(cx - 12, cy - 8, 24, 14);
    ctx.fillRect(cx - 7, cy - 12, 14, 5);
    ctx.fillRect(cx - 15, cy - 3, 4, 6);
    ctx.fillRect(cx + 11, cy - 3, 4, 6);
    
    ctx.fillRect(cx - 14, cy + 2, 3, frame === 0 ? 6 : 4);
    ctx.fillRect(cx - 6, cy + 2, 3, frame === 0 ? 8 : 5);
    ctx.fillRect(cx + 3, cy + 2, 3, frame === 0 ? 8 : 5);
    ctx.fillRect(cx + 11, cy + 2, 3, frame === 0 ? 6 : 4);
    
    ctx.fillStyle = '#000';
    ctx.fillRect(cx - 7, cy - 5, 4, 4);
    ctx.fillRect(cx + 3, cy - 5, 4, 4);
  }

  private renderTank(ctx: CanvasRenderingContext2D, cx: number, cy: number, frame: number): void {
    ctx.fillStyle = '#f00';
    ctx.fillRect(cx - 14, cy - 10, 28, 16);
    ctx.fillRect(cx - 18, cy - 6, 6, 10);
    ctx.fillRect(cx + 12, cy - 6, 6, 10);
    ctx.fillRect(cx - 10, cy - 14, 20, 5);
    
    ctx.fillRect(cx - 16, cy + 3, 3, frame === 0 ? 7 : 5);
    ctx.fillRect(cx - 7, cy + 3, 3, frame === 0 ? 9 : 6);
    ctx.fillRect(cx + 4, cy + 3, 3, frame === 0 ? 9 : 6);
    ctx.fillRect(cx + 13, cy + 3, 3, frame === 0 ? 7 : 5);
    
    ctx.fillStyle = '#ff0';
    ctx.fillRect(cx - 8, cy - 7, 5, 5);
    ctx.fillRect(cx + 3, cy - 7, 5, 5);
    ctx.fillStyle = '#000';
    ctx.fillRect(cx - 6, cy - 5, 2, 2);
    ctx.fillRect(cx + 5, cy - 5, 2, 2);
  }
}