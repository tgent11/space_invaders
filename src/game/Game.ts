import {
  GAME_WIDTH,
  GAME_HEIGHT,
  ENEMY_WIDTH,
  ENEMY_HEIGHT,
  ENEMY_COLS,
  ENEMY_ROWS,
  ENEMY_PADDING,
  ENEMY_BASE_SPEED,
  ENEMY_DROP,
  ENEMY_MOVE_INTERVAL,
  POWERUP_DROP_CHANCE,
  POWERUP_DURATION,
  EnemyType,
  ENEMY_POINTS,
  ENEMY_HP,
  INITIAL_LIVES,
} from './constants';
import { Player } from './Player';
import { Enemy } from './Enemy';
import { Bullet } from './Bullet';
import { PowerUp } from './PowerUp';
import { InputHandler } from './Input';
import { checkCollision } from './Collision';

export type GameState = 'start' | 'playing' | 'gameover';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private enemies: Enemy[] = [];
  private bullets: Bullet[] = [];
  private powerUps: PowerUp[] = [];
  private input: InputHandler;
  private score = 0;
  private lives = INITIAL_LIVES;
  private gameState: GameState = 'start';
  private enemyDirection = 1;
  private lastMoveTime = 0;
  private lastTime = 0;
  private animationId: number | null = null;
  private onStateChange: ((state: GameState, score: number, lives: number, powerUpRemaining: number) => void) | null = null;
  private lastFireTime = 0;
  private powerUpEndTime = 0;
  private stars: { x: number; y: number; brightness: number }[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.player = new Player();
    this.input = new InputHandler();
    this.generateStars();
    this.setupControls();
  }

  private generateStars(): void {
    this.stars = [];
    for (let i = 0; i < 80; i++) {
      this.stars.push({
        x: Math.random() * GAME_WIDTH,
        y: Math.random() * GAME_HEIGHT,
        brightness: 0.3 + Math.random() * 0.7,
      });
    }
  }

  private setupControls(): void {
    this.input.onKeyDown('Space', () => {
      if (this.gameState === 'start' || this.gameState === 'gameover') {
        this.startGame();
      }
    });
    
    this.input.onKeyDown('Enter', () => {
      if (this.gameState === 'start' || this.gameState === 'gameover') {
        this.startGame();
      }
    });
  }

  setStateChangeHandler(handler: (state: GameState, score: number, lives: number, powerUpRemaining: number) => void): void {
    this.onStateChange = handler;
  }

  private playerShoot(): void {
    const now = Date.now();
    if (now - this.lastFireTime < 200) return;
    
    this.lastFireTime = now;
    const centerX = this.player.x + this.player.width / 2;
    
    if (this.player.hasPowerUp) {
      this.bullets.push(new Bullet(centerX - 14, this.player.y - 10, true));
      this.bullets.push(new Bullet(centerX, this.player.y - 10, true));
      this.bullets.push(new Bullet(centerX + 14, this.player.y - 10, true));
      this.bullets.forEach(b => b.damage = 2);
    } else {
      this.bullets.push(new Bullet(centerX - 2, this.player.y - 10, true));
    }
  }

  private createEnemyFormation(): void {
    this.enemies = [];
    const totalWidth = ENEMY_COLS * (ENEMY_WIDTH + ENEMY_PADDING) - ENEMY_PADDING;
    const startX = (GAME_WIDTH - totalWidth) / 2;
    const startY = 80;

    for (let row = 0; row < ENEMY_ROWS; row++) {
      for (let col = 0; col < ENEMY_COLS; col++) {
        let type: EnemyType;
        if (row === 0) {
          type = EnemyType.Tank;
        } else if (row <= 2) {
          type = EnemyType.Fighter;
        } else {
          type = EnemyType.Scout;
        }

        const x = startX + col * (ENEMY_WIDTH + ENEMY_PADDING);
        const y = startY + row * (ENEMY_HEIGHT + ENEMY_PADDING);
        this.enemies.push(new Enemy(x, y, type, ENEMY_HP[type]));
      }
    }
  }

  private updatePlayer(deltaTime: number): void {
    if (this.input.isLeftPressed()) {
      this.player.x -= this.player.speed * (deltaTime / 16);
    }
    if (this.input.isRightPressed()) {
      this.player.x += this.player.speed * (deltaTime / 16);
    }
    this.player.x = Math.max(0, Math.min(GAME_WIDTH - this.player.width, this.player.x));
    
    if (this.input.isSpacePressed() && this.gameState === 'playing') {
      this.playerShoot();
    }

    if (this.player.hasPowerUp && Date.now() > this.powerUpEndTime) {
      this.player.hasPowerUp = false;
    }
  }

  private updateBullets(deltaTime: number): void {
    for (const bullet of this.bullets) {
      bullet.update(deltaTime);
    }
    this.bullets = this.bullets.filter(b => b.active);
  }

  private updateEnemies(currentTime: number): void {
    const aliveEnemies = this.enemies.filter(e => e.alive);
    
    if (aliveEnemies.length === 0) {
      this.createEnemyFormation();
      this.enemyDirection = 1;
      return;
    }

    const speedMultiplier = 1 + (1 - aliveEnemies.length / this.enemies.length) * 2;
    const moveInterval = Math.max(100, ENEMY_MOVE_INTERVAL / speedMultiplier);

    if (currentTime - this.lastMoveTime >= moveInterval) {
      this.lastMoveTime = currentTime;

      let hitEdge = false;
      for (const enemy of aliveEnemies) {
        if ((enemy.x <= 0 && this.enemyDirection < 0) || 
            (enemy.x + enemy.width >= GAME_WIDTH && this.enemyDirection > 0)) {
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
        const moveAmount = ENEMY_BASE_SPEED * this.enemyDirection * 10 * speedMultiplier;
        for (const enemy of aliveEnemies) {
          enemy.x += moveAmount;
        }
      }

      for (const enemy of aliveEnemies) {
        if (enemy.y + enemy.height >= this.player.y) {
          this.lives = 0;
          this.gameState = 'gameover';
          this.notifyStateChange();
          return;
        }
      }
    }

    for (const enemy of this.enemies) {
      enemy.update(16);
    }
  }

  private updatePowerUps(deltaTime: number): void {
    for (const powerUp of this.powerUps) {
      powerUp.update(deltaTime);

      if (powerUp.active && checkCollision(powerUp, this.player)) {
        this.player.hasPowerUp = true;
        this.powerUpEndTime = Date.now() + POWERUP_DURATION;
        powerUp.collect();
        this.notifyStateChange();
      }
    }
    this.powerUps = this.powerUps.filter(p => p.active);
  }

  private checkCollisions(): void {
    for (const bullet of this.bullets) {
      if (!bullet.isPlayerBullet || !bullet.active) continue;

      for (const enemy of this.enemies) {
        if (!enemy.alive) continue;

        if (checkCollision(bullet, enemy)) {
          const killed = enemy.takeDamage(bullet.damage);
          bullet.active = false;

          if (killed) {
            this.score += ENEMY_POINTS[enemy.type];
            
            if (Math.random() < POWERUP_DROP_CHANCE) {
              this.powerUps.push(new PowerUp(
                enemy.x + enemy.width / 2 - 12,
                enemy.y
              ));
            }
          }
          this.notifyStateChange();
          break;
        }
      }
    }
  }

  private startGame(): void {
    this.score = 0;
    this.lives = INITIAL_LIVES;
    this.gameState = 'playing';
    this.player = new Player();
    this.bullets = [];
    this.powerUps = [];
    this.enemyDirection = 1;
    this.lastMoveTime = 0;
    this.lastFireTime = 0;
    this.powerUpEndTime = 0;
    this.createEnemyFormation();
    this.notifyStateChange();

    if (this.animationId === null) {
      this.lastTime = performance.now();
      this.loop();
    }
  }

  restart(): void {
    this.startGame();
  }

  private notifyStateChange(): void {
    if (this.onStateChange) {
      const powerUpRemaining = this.player.hasPowerUp 
        ? Math.max(0, this.powerUpEndTime - Date.now()) 
        : 0;
      this.onStateChange(this.gameState, this.score, this.lives, powerUpRemaining);
    }
  }

  private loop = (): void => {
    const currentTime = performance.now();
    const deltaTime = Math.min(currentTime - this.lastTime, 50);
    this.lastTime = currentTime;

    if (this.gameState === 'playing') {
      this.update(deltaTime, currentTime);
    }
    this.render();

    this.animationId = requestAnimationFrame(this.loop);
  };

  private update(deltaTime: number, currentTime: number): void {
    this.updatePlayer(deltaTime);
    this.updateBullets(deltaTime);
    this.updateEnemies(currentTime);
    this.updatePowerUps(deltaTime);
    this.checkCollisions();
  }

  private render(): void {
    const { ctx, canvas } = this;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.renderStars();

    if (this.gameState === 'start') {
      this.renderStartScreen();
      return;
    }

    if (this.gameState === 'gameover') {
      this.renderGameElements();
      this.renderGameOver();
      return;
    }

    this.renderGameElements();
  }

  private renderStars(): void {
    const { ctx } = this;
    for (const star of this.stars) {
      ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
      ctx.fillRect(Math.floor(star.x), Math.floor(star.y), 1, 1);
    }
  }

  private renderGameElements(): void {
    this.player.render(this.ctx, this.player.hasPowerUp);
    
    for (const enemy of this.enemies) {
      enemy.render(this.ctx);
    }
    
    for (const bullet of this.bullets) {
      bullet.render(this.ctx);
    }
    
    for (const powerUp of this.powerUps) {
      powerUp.render(this.ctx);
    }

    if (this.player.hasPowerUp) {
      this.renderPowerUpIndicator();
    }
  }

  private renderPowerUpIndicator(): void {
    const { ctx } = this;
    const remaining = Math.max(0, this.powerUpEndTime - Date.now());
    const seconds = Math.ceil(remaining / 1000);
    
    ctx.fillStyle = '#ff0';
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ POWER UP ACTIVE ⚡', GAME_WIDTH / 2, 25);
    
    ctx.fillStyle = '#fff';
    ctx.font = '12px "Courier New", monospace';
    ctx.fillText(`${seconds}s`, GAME_WIDTH / 2, 42);
  }

  private renderStartScreen(): void {
    const { ctx, canvas } = this;

    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 28px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SPACE INVADERS', canvas.width / 2, 140);

    ctx.fillStyle = '#fff';
    ctx.font = '14px "Courier New", monospace';
    ctx.fillText('← → or A D to move', canvas.width / 2, 220);
    ctx.fillText('SPACE to shoot', canvas.width / 2, 245);

    ctx.fillStyle = '#ff0';
    ctx.font = '12px "Courier New", monospace';
    ctx.fillText('Press SPACE to start', canvas.width / 2, 310);

    ctx.fillStyle = '#888';
    ctx.font = '11px "Courier New", monospace';
    ctx.fillText('ENEMY TYPES:', canvas.width / 2, 380);

    ctx.fillStyle = '#0ff';
    ctx.fillRect(canvas.width / 2 - 70, 400, 20, 14);
    ctx.fillStyle = '#fff';
    ctx.fillText('Scout - 1 HP - 10 pts', canvas.width / 2 + 20, 410);

    ctx.fillStyle = '#f0f';
    ctx.fillRect(canvas.width / 2 - 70, 430, 24, 16);
    ctx.fillStyle = '#fff';
    ctx.fillText('Fighter - 2 HP - 25 pts', canvas.width / 2 + 20, 440);

    ctx.fillStyle = '#f00';
    ctx.fillRect(canvas.width / 2 - 70, 460, 28, 18);
    ctx.fillStyle = '#fff';
    ctx.fillText('Tank - 3 HP - 50 pts', canvas.width / 2 + 20, 470);

    ctx.fillStyle = '#ff0';
    ctx.fillText('⚡ = Double Shot (10s)', canvas.width / 2, 520);
  }

  private renderGameOver(): void {
    const { ctx, canvas } = this;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#f00';
    ctx.font = 'bold 36px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);

    ctx.fillStyle = '#fff';
    ctx.font = '20px "Courier New", monospace';
    ctx.fillText(`SCORE: ${this.score}`, canvas.width / 2, canvas.height / 2 + 20);

    ctx.fillStyle = '#ff0';
    ctx.font = '14px "Courier New", monospace';
    ctx.fillText('Press SPACE to restart', canvas.width / 2, canvas.height / 2 + 70);
  }

  start(): void {
    if (this.animationId === null) {
      this.lastTime = performance.now();
      this.loop();
    }
  }

  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.input.destroy();
  }
}