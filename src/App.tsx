import { useEffect, useRef, useState } from 'react';
import { Game, GAME_WIDTH, GAME_HEIGHT, INITIAL_LIVES } from './game';
import type { GameState } from './game';
import './App.css';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [gameState, setGameState] = useState<GameState>('start');
  const [powerUpRemaining, setPowerUpRemaining] = useState(0);

  useEffect(() => {
    if (canvasRef.current && !gameRef.current) {
      const canvas = canvasRef.current;
      canvas.width = GAME_WIDTH;
      canvas.height = GAME_HEIGHT;
      
      const game = new Game(canvas);
      gameRef.current = game;
      
      game.setStateChangeHandler((state, s, l, powerUp) => {
        setGameState(state);
        setScore(s);
        setLives(l);
        setPowerUpRemaining(powerUp);
      });
      
      game.start();
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.stop();
        gameRef.current = null;
      }
    };
  }, []);

  const handleRestart = () => {
    if (gameRef.current) {
      gameRef.current.restart();
    }
  };

  return (
    <div className="game-container">
      <div className="hud">
        <div className="hud-left">
          <span className="score">SCORE: {score}</span>
        </div>
        <div className="hud-right">
          <span className="lives">LIVES: {lives}</span>
        </div>
      </div>
      <canvas ref={canvasRef} className="game-canvas" />
      {powerUpRemaining > 0 && (
        <div className="powerup-timer">POWER: {Math.ceil(powerUpRemaining / 1000)}s</div>
      )}
      {gameState === 'gameover' && (
        <button className="restart-btn" onClick={handleRestart}>
          RESTART
        </button>
      )}
    </div>
  );
}

export default App;
