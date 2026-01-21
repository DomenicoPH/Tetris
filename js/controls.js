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
};

// --- Controles táctiles ---
export function setupTouchControls({
  canvas,
  board,
  getActive,
  setActive,
  getNext,
  setNext,
  spawnPiece,
  COLS,
  getIsGameOver,
  setGameOver,
  getIsPaused,
  setFlags,
  addScore,
  updateScore,
}){
  let startX = 0;
  let startY = 0;
  let lastTapTime = 0;
  let longPressTimer = null;
  let softDropActive = false;
  let gestureUsed = false;
  let doubleTapTriggered = false;
  const SWIPE_THRESHOLD = 30;
  const DOUBLE_TAP_MS = 250;
  const LONG_PRESS_MS = 500;

  function doHardDrop(){
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
  };

  function onPointerDown(e){
    if(getIsGameOver() || getIsPaused()) return;

    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;

    // doble toque
    const now = performance.now();
    if(now - lastTapTime <= DOUBLE_TAP_MS){
      doHardDrop();
      doubleTapTriggered = true;
      lastTapTime = 0;
      e.preventDefault();
      return;
    }
    lastTapTime = now;

    // toque largo: Pausa
    clearTimeout(longPressTimer);
    longPressTimer = setTimeout(() => {
      setFlags("pause");
    }, LONG_PRESS_MS);

    softDropActive = false;
    gestureUsed = false;
  };

  function onPointerMove(e){
    if(getIsGameOver() || getIsPaused()) return;

    const rect = canvas.getBoundingClientRect();
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - startX;
    const dy = y - startY;

    clearTimeout(longPressTimer);

    let active = getActive();

    // swipe horizontal
    if(Math.abs(dx) >= SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)){
      if(dx < 0){
        if(!collides(board, active, active.x - 1, active.y)){
          active.x--;
          setActive(active);
        }
      } else {
        if(!collides(board, active, active.x + 1, active.y)){
          active.x++;
          setActive(active);
        }
      }
      startX = x;
      startY = y;
      gestureUsed = true;
      e.preventDefault();
      return;
    }

    // swipe vertical
    if(dy >= SWIPE_THRESHOLD && Math.abs(dy) > Math.abs(dx)){
      if(!softDropActive){
        setFlags("softDropOn");
        softDropActive = true;
      }
      gestureUsed = true;
      e.preventDefault();
    } else {
      if(softDropActive){
        setFlags("softDropOff");
        softDropActive = false;
      }
    }
  }

  function onPointerUp(e){
    
    if(getIsGameOver()) return;
    clearTimeout(longPressTimer);

    if(doubleTapTriggered){
      doubleTapTriggered = false;
    } else {
      const rect = canvas.getBoundingClientRect();
      const endX = e.clientX - rect.left;
      const endY = e.clientY - rect.top;
      const dx = endX - startX;
      const dy = endY - startY;
      const wasSwipe = Math.abs(dx) >= SWIPE_THRESHOLD || Math.abs(dy) >= SWIPE_THRESHOLD;

      if(!gestureUsed && !wasSwipe && !getIsPaused()){
        let active = getActive();
        const rotated = rotateMatrix(active.shape);
        if(!collides(board, active, active.x, active.y, rotated)){
          active.shape = rotated;
          setActive(active);
        }
      };

      if(softDropActive){
        setFlags("softDropOff");
        softDropActive = false;
      };

    };

    // Al soltar se desactiva soft drop (si estaba activo)
    if(softDropActive){
      setFlags("softDropOff");
      softDropActive = false;
    }

    gestureUsed = false;
  }

  // Pointer Events: soporta mouse y tactil
  canvas.style.touchAction = "none";
  canvas.addEventListener("pointerdown", onPointerDown, {passive: false});
  canvas.addEventListener("pointermove", onPointerMove, {passive: false});
  canvas.addEventListener("pointerup", onPointerUp, {passive: false});
  canvas.addEventListener("pointercancel", onPointerUp, {passive: false});
}