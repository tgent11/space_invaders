import { GAME_WIDTH, GAME_HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_SPEED } from './constants';

export class Player {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  hasPowerUp = false;

  constructor() {
    this.width = PLAYER_WIDTH;
    this.height = PLAYER_HEIGHT;
    this.x = (GAME_WIDTH - this.width) / 2;
    this.y = GAME_HEIGHT - this.height - 20;
    this.speed = PLAYER_SPEED;
  }

  render(ctx: CanvasRenderingContext2D, powered: boolean): void {
    const { x, y, width, height } = this;
    const color = powered ? '#ff0' : '#0f0';

    ctx.fillStyle = color;
    ctx.fillRect(x + width / 4, y, width / 2, height * 0.35);
    ctx.fillRect(x, y + height * 0.3, width, height * 0.35);
    ctx.fillRect(x, y + height * 0.55, width * 0.2, height * 0.45);
    ctx.fillRect(x + width * 0.8, y + height * 0.55, width * 0.2, height * 0.45);

    ctx.fillStyle = '#fff';
    ctx.fillRect(x + width / 2 - 3, y + 3, 6, 5);

    if (powered) {
      ctx.strokeStyle = '#ff0';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
    }
  }
}