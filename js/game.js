/* T E T R I S */
/* Desarrollado por Gnomono */

import { TETROMINOS, randomTetromino, spawnPiece } from "./pieces.js";
import { collides, lockPiece, clearLines } from "./board.js";
import { clearCanvas, drawBoard, drawPiece, drawHUD, drawNext, drawGameOver, drawPaused } from "./render.js";

const COLS = 10;
const ROWS = 20;
const CELL = 30;
// 300 * 600 => 10 * 20 celdas de 30px

// Canvas y contexto
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Tablero 0 = vacío, >0 = color/ID de pieza
const board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

// Paleta de colores por ID de pieza
const COLORS = {
    0: "#1a1a1a",   // fondo oscuro
    1: "#4dd0e1",   // turquesa suave (I)
    2: "#f9a825",   // amarillo mostaza cálido (O)
    3: "#ab47bc",   // violeta pastel (T)
    4: "#66bb6a",   // verde fresco (S)
    5: "#ef5350",   // rojo coral (Z)
    6: "#5c6bc0",   // azul lavanda (J)
    7: "#ff7043",   // naranja suave (L)
};

// Color de fondo
const BG_COLOR = "#000"
const TEXT_COLOR = "#8d8d8d"

// Score
let score = 0;
let level = 1;
let lines = 0;

// Flags: estado del juego
let isGameOver = false;
let isPaused = false;
let isSoftDropping = false;



// Pieza activa (posición y forma)
let active = spawnPiece(COLS);
let next = spawnPiece(COLS);

// Gravedad
let dropInterval = 500 //ms
let lastDrop = 0;


// --- Controles --- // -------------------------------------------------

document.addEventListener("keydown", e => {

    const key = e.key.toLowerCase();

    // reset
    if(isGameOver && key === "r"){
        resetGame();
        requestAnimationFrame(update);
        return;
    };

    // pause
    if(key === "p"){
        isPaused = !isPaused;
        if(!isPaused){
            lastDrop = performance.now();
        }
        return;
    };

    if(isPaused || isGameOver) return;

    // controls
    switch(e.key){
        case "ArrowLeft":
            if(!collides(board, active, active.x - 1, active.y)){
                active.x--;
            }
            break;
        case "ArrowRight":
            if(!collides(board, active, active.x + 1, active.y)){
                active.x++;
            }
            break;
        case "ArrowDown":
            if(!collides(board, active, active.x, active.y + 1)){
                //active.y++;
                isSoftDropping = true;
            }
            break;
        case "ArrowUp":
            const rotated = rotateMatrix(active.shape);
            if(!collides(board, active, active.x, active.y, rotated)){
                active.shape = rotated;
            }
            break;
        case " ":
            hardDrop();
            break;
    }
});

document.addEventListener('keyup', e => {
    if(e.key === "ArrowDown"){
        isSoftDropping = false;
    }
});

// ----------------------------------------------------------------------

// Rotación de matriz (función de control)
function rotateMatrix(matrix){
    const N = matrix.length;
    const result = Array.from({ length: N }, () => Array(N).fill(0));
    for(let r = 0; r < N; r++){
        for(let c = 0; c < N; c++){
            result[c][N - 1 - r] = matrix[r][c];
        }
    }
    return result;
};

// Descenso rápido de la pieza (función de control)
function hardDrop(){
    let droppedCells = 0;
    while(!collides(board, active, active.x, active.y + 1)){
        active.y++;
        droppedCells++;
    }
    score += droppedCells * 2

    lockPiece(board, active);
    const cleared = clearLines(board);
    if(cleared > 0){
        updateScore(cleared);
    };
    active = next;
    next = spawnPiece(COLS);
    if(collides(board, active, active.x, active.y)){
        isGameOver = true;
    }
};


// --- Actualizar score ---
function updateScore(cleared){
    if(cleared > 0){
        const points = [0, 100, 300, 500, 800];
        score += points[cleared];
        lines += cleared;

        //subir nivel cada 10 líneas
        if(lines >= level * 10){
            level++;
            // aunmentar velocidad
            dropInterval = Math.max(100, dropInterval - 50);
        }
    }
}


// --- Game Over ---
function resetGame(){
    // limpiar tablero
    for(let y = 0; y < ROWS; y++) board[y].fill(0);
    
    // Reset de variables
    score = 0;
    level = 1;
    lines = 0;
    dropInterval = 500;
    lastDrop = 0;

    // Nueva pieza
    active = spawnPiece(COLS);
    next = spawnPiece(COLS);

    isGameOver = false;
}


// --- Bucle principal ---
function update(timestamp){
    if(!lastDrop) lastDrop = timestamp;
    const delta = timestamp - lastDrop;

    // render
    clearCanvas(ctx, BG_COLOR, canvas);
    drawBoard(ctx, board, CELL, COLORS);
    drawPiece(ctx, active, CELL, COLORS);
    drawHUD(ctx, TEXT_COLOR, score, level, lines);
    drawNext(ctx, next, CELL, COLORS, TEXT_COLOR);
    
    // Si Game Over...
    if(isGameOver){
        drawGameOver(ctx, canvas);
        return;
    };

    // Si Paused...
    if(isPaused){
        drawPaused(ctx, canvas);
        requestAnimationFrame(update);
        return;
    };

    // lógica de caída normal o acelerada
    const currentInterval = isSoftDropping ? 50 : dropInterval;
    if(delta >= currentInterval){
        // intentar bajar
        if(!collides(board, active, active.x, active.y + 1)){
            active.y++;
            if(isSoftDropping){
                score += 1
            }
        } else {
            // fijar y spawnear nueva
            lockPiece(board, active);
            const cleared = clearLines(board); // eliminar líneas
            if(cleared > 0){
                console.log(`Eliminaste ${cleared} línea(s)`);
                updateScore(cleared);
            }
            
            active = next;
            next = spawnPiece(COLS);
            // Game Over básico: si colisiona al aparecer
            if(collides(board, active, active.x, active.y)){
                // reset game
                isGameOver = true;             
            }
        }
        lastDrop = timestamp;
    }
    requestAnimationFrame(update);
};

requestAnimationFrame(update);