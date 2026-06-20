export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 640;

export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 30;
export const PLAYER_SPEED = 5;

export const BULLET_WIDTH = 4;
export const BULLET_HEIGHT = 12;
export const BULLET_SPEED = 8;
export const PLAYER_FIRE_RATE = 200;

export const ENEMY_WIDTH = 36;
export const ENEMY_HEIGHT = 28;
export const ENEMY_COLS = 8;
export const ENEMY_ROWS = 5;
export const ENEMY_PADDING = 12;
export const ENEMY_SPEED = 1;
export const ENEMY_DROP = 20;

export const POWERUP_SIZE = 24;
export const POWERUP_SPEED = 2;
export const POWERUP_CHANCE = 0.15;
export const POWERUP_DURATION = 8000;

export const EnemyType = {
  Easy: 1,
  Medium: 2,
  Heavy: 3,
} as const;

export type EnemyType = (typeof EnemyType)[keyof typeof EnemyType];

export const ENEMY_POINTS: Record<EnemyType, number> = {
  [EnemyType.Easy]: 10,
  [EnemyType.Medium]: 25,
  [EnemyType.Heavy]: 50,
};

export const INITIAL_LIVES = 3;

export interface Point {
  x: number;
  y: number;
}

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
}