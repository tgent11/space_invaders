import { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game';
import type { GameState } from './game';
import { GAME_WIDTH, GAME_HEIGHT, INITIAL_LIVES } from './game';
import './App.css';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameEngine | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [gameState, setGameState] = useState<GameState>('start');

  useEffect(() => {
    if (canvasRef.current && !gameRef.current) {
      const canvas = canvasRef.current;
      canvas.width = GAME_WIDTH;
      canvas.height = GAME_HEIGHT;
      
      const game = new GameEngine(canvas);
      gameRef.current = game;
      
      game.setStateChangeHandler((state, s, l) => {
        setGameState(state);
        setScore(s);
        setLives(l);
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
      {gameState === 'gameover' && (
        <button className="restart-btn" onClick={handleRestart}>
          RESTART
        </button>
      )}
    </div>
  );
}

export default App;
