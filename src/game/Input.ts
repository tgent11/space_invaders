export class InputHandler {
  private keys: Set<string> = new Set();
  private onKeyDownCallbacks: Map<string, () => void> = new Map();
  private onKeyUpCallbacks: Map<string, () => void> = new Map();

  constructor() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    this.keys.add(e.code);
    
    const callback = this.onKeyDownCallbacks.get(e.code);
    if (callback) callback();
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
    
    const callback = this.onKeyUpCallbacks.get(e.code);
    if (callback) callback();
  };

  isPressed(key: string): boolean {
    return this.keys.has(key);
  }

  isLeftPressed(): boolean {
    return this.isPressed('ArrowLeft') || this.isPressed('KeyA');
  }

  isRightPressed(): boolean {
    return this.isPressed('ArrowRight') || this.isPressed('KeyD');
  }

  isSpacePressed(): boolean {
    return this.isPressed('Space');
  }

  onKeyDown(key: string, callback: () => void): void {
    this.onKeyDownCallbacks.set(key, callback);
  }

  onKeyUp(key: string, callback: () => void): void {
    this.onKeyUpCallbacks.set(key, callback);
  }

  destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.onKeyDownCallbacks.clear();
    this.onKeyUpCallbacks.clear();
  }
}