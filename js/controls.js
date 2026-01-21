// controls.js
import { collides, lockPiece, clearLines } from "./board.js";

// --- Rotación de matriz ---
export function rotateMatrix(matrix){
  const N = matrix.length;
  const result = Array.from({ length: N }, () => Array(N).fill(0));
  for(let r = 0; r < N; r++){
    for(let c = 0; c < N; c++){
      result[c][N - 1 - r] = matrix[r][c];
    }
  }
  return result;
}

// --- Descenso rápido ---
function hardDrop({ board, getActive, setActive, getNext, setNext, spawnPiece, COLS, addScore, updateScore, setGameOver }){
  let active = getActive();
  let next = getNext();

  let droppedCells = 0;
  while(!collides(board, active, active.x, active.y + 1)){
    active.y++;
    droppedCells++;
  }
  addScore(droppedCells * 2);

  lockPiece(board, active);
  const cleared = clearLines(board);
  if(cleared > 0) updateScore(cleared);

  active = next;
  next = spawnPiece(COLS);
  setActive(active);
  setNext(next);

  if(collides(board, active, active.x, active.y)){
    setGameOver(true);
  }
}

// --- Setup de controles ---
export function setupControls({
  board,
  getActive, setActive,
  getNext, setNext,
  spawnPiece, COLS,
  getIsGameOver, setGameOver,
  getIsPaused, setFlags,
  addScore, updateScore,
  resetGame, update
}){
  document.addEventListener("keydown", e => {
    const key = e.key.toLowerCase();

    // reset
    if(getIsGameOver() && key === "r"){
      resetGame();
      requestAnimationFrame(update);
      return;
    }

    // pause
    if(key === "p"){
      setFlags("pause");
      return;
    }

    if(getIsPaused() || getIsGameOver()) return;

    let active = getActive();

    switch(e.key){
      case "ArrowLeft":
        if(!collides(board, active, active.x - 1, active.y)){
          active.x--;
          setActive(active);
        }
        break;
      case "ArrowRight":
        if(!collides(board, active, active.x + 1, active.y)){
          active.x++;
          setActive(active);
        }
        break;
      case "ArrowDown":
        if(!collides(board, active, active.x, active.y + 1)){
          setFlags("softDropOn");
        }
        break;
      case "ArrowUp":
        const rotated = rotateMatrix(active.shape);
        if(!collides(board, active, active.x, active.y, rotated)){
          active.shape = rotated;
          setActive(active);
        }
        break;
      case " ":
        hardDrop({
          board,
          getActive, setActive,
          getNext, setNext,
          spawnPiece, COLS,
          addScore, updateScore,
          setGameOver
        });
        break;
    }
  });

  document.addEventListener("keyup", e => {
    if(e.key === "ArrowDown"){
      setFlags("softDropOff");
    }
  });
}