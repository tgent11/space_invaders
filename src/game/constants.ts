// Game dimensions
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 640;

// Player constants
export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 30;
export const PLAYER_SPEED = 5;
export const PLAYER_FIRE_RATE = 200;

// Bullet constants
export const BULLET_WIDTH = 4;
export const BULLET_HEIGHT = 12;
export const BULLET_SPEED = 8;

// Enemy constants
export const ENEMY_WIDTH = 36;
export const ENEMY_HEIGHT = 28;
export const ENEMY_COLS = 8;
export const ENEMY_ROWS = 5;
export const ENEMY_PADDING = 12;
export const ENEMY_BASE_SPEED = 1;
export const ENEMY_DROP = 20;
export const ENEMY_MOVE_INTERVAL = 800;

// Power-up constants
export const POWERUP_SIZE = 24;
export const POWERUP_SPEED = 2;
export const POWERUP_DROP_CHANCE = 0.03; // ~3% chance to drop
export const POWERUP_DURATION = 10000;

// Game settings
export const INITIAL_LIVES = 3;
export const MAX_POWERUP_STACK = 1;

// Enemy types
export const EnemyType = {
  Scout: 1,
  Fighter: 2,
  Tank: 3,
} as const;

export type EnemyType = (typeof EnemyType)[keyof typeof EnemyType];

export const ENEMY_POINTS: Record<EnemyType, number> = {
  [EnemyType.Scout]: 10,
  [EnemyType.Fighter]: 25,
  [EnemyType.Tank]: 50,
};

export const ENEMY_HP: Record<EnemyType, number> = {
  [EnemyType.Scout]: 1,
  [EnemyType.Fighter]: 2,
  [EnemyType.Tank]: 3,
};