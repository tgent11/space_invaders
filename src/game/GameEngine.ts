import {
  GAME_WIDTH,
  GAME_HEIGHT,
  ENEMY_WIDTH,
  ENEMY_HEIGHT,
  ENEMY_COLS,
  ENEMY_ROWS,
  ENEMY_PADDING,
  ENEMY_SPEED,
  ENEMY_DROP,
  ENEMY_POINTS,
  EnemyType,
  INITIAL_LIVES,
  POWERUP_CHANCE,
  POWERUP_DURATION,
} from './types';
import { Player } from './Player';
import { Enemy } from './Enemy';
import { Bullet } from './Bullet';
import { PowerUp } from './PowerUp';

export type GameState = 'start' | 'playing' | 'gameover';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private enemies: Enemy[] = [];
  private bullets: Bullet[] = [];
  private powerUps: PowerUp[] = [];
  private score = 0;
  private lives = INITIAL_LIVES;
  private gameState: GameState = 'start';
  private enemyDirection = 1;
  private enemyMoveTimer = 0;
  private lastTime = 0;
  private animationId: number | null = null;
  private onStateChange: ((state: GameState, score: number, lives: number) => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.player = new Player();
    this.setupControls();
  }

  private setupControls() {
    const keyDown = (e: KeyboardEvent) => {
      if (this.gameState !== 'playing') {
        if (e.code === 'Space' || e.code === 'Enter') {
          this.startGame();
        }
        return;
      }

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          this.player.setMoveLeft(true);
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.player.setMoveRight(true);
          break;
        case 'Space':
          e.preventDefault();
          this.playerShoot();
          break;
      }
    };

    const keyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          this.player.setMoveLeft(false);
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.player.setMoveRight(false);
          break;
      }
    };

    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
  }

  setStateChangeHandler(handler: (state: GameState, score: number, lives: number) => void) {
    this.onStateChange = handler;
  }

  private playerShoot() {
    const now = Date.now();
    if (!this.player.canFire(now)) return;

    this.player.fire(now);
    const centerX = this.player.getCenterX();

    if (this.player.hasPowerUp) {
      // Triple shot
      this.bullets.push(new Bullet(centerX - 12, this.player.y - 12, true));
      this.bullets.push(new Bullet(centerX, this.player.y - 12, true));
      this.bullets.push(new Bullet(centerX + 12, this.player.y - 12, true));
      this.bullets.forEach(b => b.damage = 2);
    } else {
      this.bullets.push(new Bullet(centerX - 2, this.player.y - 12, true));
    }
  }

  private createEnemyFormation() {
    this.enemies = [];
    const startX = (GAME_WIDTH - (ENEMY_COLS * (ENEMY_WIDTH + ENEMY_PADDING))) / 2;
    const startY = 60;

    for (let row = 0; row < ENEMY_ROWS; row++) {
      for (let col = 0; col < ENEMY_COLS; col++) {
        let type: EnemyType;
        if (row === 0) {
          type = EnemyType.Heavy;
        } else if (row <= 2) {
          type = EnemyType.Medium;
        } else {
          type = EnemyType.Easy;
        }

        const x = startX + col * (ENEMY_WIDTH + ENEMY_PADDING);
        const y = startY + row * (ENEMY_HEIGHT + ENEMY_PADDING);
        this.enemies.push(new Enemy(x, y, type));
      }
    }
  }

  private checkCollisions() {
    // Player bullets vs enemies
    for (const bullet of this.bullets) {
      if (!bullet.isPlayerBullet || !bullet.active) continue;

      for (const enemy of this.enemies) {
        if (!enemy.alive) continue;

        if (this.collides(bullet, enemy)) {
          const killed = enemy.hit();
          bullet.y = -100; // Remove bullet

          if (killed) {
            this.score += ENEMY_POINTS[enemy.type];
            this.notifyStateChange();

            // Chance to drop power-up
            if (Math.random() < POWERUP_CHANCE) {
              this.powerUps.push(new PowerUp(
                enemy.x + enemy.width / 2 - 12,
                enemy.y
              ));
            }
          }
          break;
        }
      }
    }
  }

  private collides(a: { x: number; y: number; width: number; height: number }, 
                   b: { x: number; y: number; width: number; height: number }): boolean {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  private updateEnemies(deltaTime: number) {
    this.enemyMoveTimer += deltaTime;

    if (this.enemyMoveTimer >= 800) {
      this.enemyMoveTimer = 0;

      const aliveEnemies = this.enemies.filter(e => e.alive);
      if (aliveEnemies.length === 0) {
        this.createEnemyFormation();
        this.enemyDirection = 1;
        return;
      }

      // Check if any enemy hit edge
      let hitEdge = false;
      for (const enemy of aliveEnemies) {
        if (enemy.x <= 0 || enemy.x + enemy.width >= GAME_WIDTH) {
          hitEdge = true;
          break;
        }
      }

      if (hitEdge) {
        this.enemyDirection *= -1;
        for (const enemy of aliveEnemies) {
          enemy.y += ENEMY_DROP;
        }
      } else {
        for (const enemy of aliveEnemies) {
          enemy.x += ENEMY_SPEED * this.enemyDirection * 10;
        }
      }

      // Check if enemies reached player
      for (const enemy of aliveEnemies) {
        if (enemy.y + enemy.height >= this.player.y) {
          this.lives = 0;
          this.gameOver();
          return;
        }
      }
    }

    // Update enemy animation
    for (const enemy of this.enemies) {
      enemy.update(deltaTime);
    }
  }

  private updatePowerUps() {
    for (const powerUp of this.powerUps) {
      powerUp.update(16);

      if (powerUp.active && this.collides(powerUp, this.player)) {
        this.player.activatePowerUp(POWERUP_DURATION);
        powerUp.y = GAME_HEIGHT + 100; // Remove
        this.notifyStateChange();
      }
    }

    this.powerUps = this.powerUps.filter(p => p.active);
  }

  private startGame() {
    this.score = 0;
    this.lives = INITIAL_LIVES;
    this.gameState = 'playing';
    this.player = new Player();
    this.bullets = [];
    this.powerUps = [];
    this.enemyDirection = 1;
    this.enemyMoveTimer = 0;
    this.createEnemyFormation();
    this.notifyStateChange();

    if (this.animationId === null) {
      this.lastTime = performance.now();
      this.loop();
    }
  }

  restart() {
    this.startGame();
  }

  private gameOver() {
    this.gameState = 'gameover';
    this.notifyStateChange();
  }

  private notifyStateChange() {
    if (this.onStateChange) {
      this.onStateChange(this.gameState, this.score, this.lives);
    }
  }

  private loop = () => {
    const currentTime = performance.now();
    const deltaTime = Math.min(currentTime - this.lastTime, 50);
    this.lastTime = currentTime;

    if (this.gameState === 'playing') {
      this.update(deltaTime);
    }
    this.render();

    this.animationId = requestAnimationFrame(this.loop);
  };

  private update(deltaTime: number) {
    this.player.update(deltaTime);

    for (const bullet of this.bullets) {
      bullet.update(deltaTime);
    }
    this.bullets = this.bullets.filter(b => b.active);

    this.updateEnemies(deltaTime);
    this.updatePowerUps();
    this.checkCollisions();
  }

  private render() {
    const { ctx, canvas } = this;

    // Black space background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars background
    this.renderStars();

    if (this.gameState === 'start') {
      this.renderStartScreen();
      return;
    }

    if (this.gameState === 'gameover') {
      this.renderGameOver();
      return;
    }

    // Render game elements
    this.player.render(ctx);
    for (const enemy of this.enemies) {
      enemy.render(ctx);
    }
    for (const bullet of this.bullets) {
      bullet.render(ctx);
    }
    for (const powerUp of this.powerUps) {
      powerUp.render(ctx);
    }

    // Power-up indicator
    if (this.player.hasPowerUp) {
      this.renderPowerUpIndicator();
    }
  }

  private renderStars() {
    const { ctx, canvas } = this;
    ctx.fillStyle = '#333';
    const seed = 12345;
    for (let i = 0; i < 50; i++) {
      const x = ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280 * canvas.width;
      const y = ((seed * (i + 1) * 49297 + 9301) % 233280) / 233280 * canvas.height;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  private renderStartScreen() {
    const { ctx, canvas } = this;

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SPACE INVADERS', canvas.width / 2, 180);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#0f0';
    ctx.fillText('⚡ = 3x shots + 2x damage', canvas.width / 2, 260);

    ctx.fillStyle = '#aaa';
    ctx.fillText('← → or A D  to move', canvas.width / 2, 340);
    ctx.fillText('SPACE to shoot', canvas.width / 2, 360);

    ctx.fillStyle = '#ff0';
    ctx.font = '18px monospace';
    ctx.fillText('Press SPACE or ENTER to start', canvas.width / 2, 450);

    // Enemy preview
    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.fillText('ENEMY TYPES:', canvas.width / 2, 500);

    // Easy enemy
    ctx.fillStyle = '#0ff';
    ctx.fillRect(canvas.width / 2 - 100, 520, 24, 14);
    ctx.fillText('= 10 pts', canvas.width / 2 - 30, 528);

    // Medium enemy
    ctx.fillStyle = '#f0f';
    ctx.fillRect(canvas.width / 2 - 100, 550, 28, 16);
    ctx.fillText('= 25 pts', canvas.width / 2 - 30, 558);

    // Heavy enemy
    ctx.fillStyle = '#f00';
    ctx.fillRect(canvas.width / 2 - 100, 580, 32, 20);
    ctx.fillText('= 50 pts', canvas.width / 2 - 30, 588);
  }

  private renderGameOver() {
    const { ctx, canvas } = this;

    ctx.fillStyle = '#f00';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);

    ctx.fillStyle = '#fff';
    ctx.font = '24px monospace';
    ctx.fillText(`SCORE: ${this.score}`, canvas.width / 2, canvas.height / 2 + 20);

    ctx.fillStyle = '#ff0';
    ctx.font = '18px monospace';
    ctx.fillText('Press SPACE or ENTER to restart', canvas.width / 2, canvas.height / 2 + 80);
  }

  private renderPowerUpIndicator() {
    const { ctx } = this;
    ctx.fillStyle = '#ff0';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ POWER UP ACTIVE ⚡', GAME_WIDTH / 2, 30);
  }

  start() {
    if (this.animationId === null) {
      this.lastTime = performance.now();
      this.loop();
    }
  }

  stop() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}