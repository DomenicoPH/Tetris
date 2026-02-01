/* T E T R I S */
/* Desarrollado por Gnomono */

import { TETROMINOS, randomTetromino, spawnPiece } from "./pieces.js";
import { collides, lockPiece, clearLines } from "./board.js";
import { clearCanvas, drawBoard, drawPiece, drawHUD, drawNext, drawGameOver, drawPaused } from "./render.js";
import { setupControls, setupTouchControls } from "./controls.js";

const COLS = 10;
const ROWS = 20;
const CELL = 30;
// 300 * 600 => 10 * 20 celdas de 30px

// Canvas y contexto
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Nuevo: Tamaño base interno (igual que en HTML)
const BASE_WIDTH = 360;
const BASE_HEIGHT = 600;

// Nuevo: Función para escalar canvas
function resizeCanvas() {
    // Usar el contenedor body o calcular según viewport
    const maxWidth = window.innerWidth * 0.95; // 95% del ancho disponible
    const maxHeight = window.innerHeight * 0.75; // 75% del alto disponible
    
    // Calcular escala manteniendo proporción 360:600 = 3:5
    const scaleWidth = maxWidth / BASE_WIDTH;
    const scaleHeight = maxHeight / BASE_HEIGHT;
    const scale = Math.min(scaleWidth, scaleHeight);
    
    // Aplicar escala visual manteniendo el buffer interno
    canvas.style.width = `${BASE_WIDTH * scale}px`;
    canvas.style.height = `${BASE_HEIGHT * scale}px`;
    
    // Centrar canvas
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    
    // Para pantallas muy pequeñas, ajustar tamaño de fuente en HUD
    const hudScale = scale < 0.8 ? scale : 1;
    document.documentElement.style.setProperty('--hud-scale', hudScale);
}

// Llamar al cargar y cuando cambie tamaño/orientación
resizeCanvas();
window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => {
    setTimeout(resizeCanvas, 100); // Pequeño delay para que termine la rotación
});

// Tablero 0 = vacío, >0 = color/ID de pieza
const board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

// Paleta de colores por ID de pieza
const COLORS = {
    0: "rgba(26, 26, 26, 0.75)",   // fondo oscuro
    1: "#4dd0e1",   // turquesa suave (I)
    2: "#f9a825",   // amarillo mostaza cálido (O)
    3: "#ab47bc",   // violeta pastel (T)
    4: "#66bb6a",   // verde fresco (S)
    5: "#ef5350",   // rojo coral (Z)
    6: "#5c6bc0",   // azul lavanda (J)
    7: "#ff7043",   // naranja suave (L)
};

// Color de fondo
const BG_COLOR = "rgba(26, 26, 26, 0.75)"
const TEXT_COLOR = "rgb(170, 170, 170)";
const NUMBER_COLOR = "rgb(255, 255, 255)";

// Score
let score = 0;
let level = 1;
let lines = 0;

// Pieza activa (posición y forma)
let active = spawnPiece(COLS);
let next = spawnPiece(COLS);

// Gravedad
let dropInterval = 500 //ms
let lastDrop = 0;

// Flags: estado del juego
let isGameOver = false;
let isPaused = false;
let isSoftDropping = false;

function setFlags(action){
    switch(action){
        case "pause":
            isPaused = !isPaused;
            if(!isPaused) lastDrop = performance.now();
            break;
        case "softDropOn":
            isSoftDropping = true;
            break;
        case "softDropOff":
            isSoftDropping = false;
            break;
    }
};

// Controls
setupControls({
    board,
    getActive: () => active,
    setActive: (val) => { active = val; },
    getNext: () => next,
    setNext: (val) => { next = val; },
    spawnPiece,
    COLS,
    getIsGameOver: () => isGameOver,
    setGameOver: (val) => { isGameOver = val; },
    getIsPaused: () => isPaused,
    setFlags,
    addScore: (val) => { score += val; },
    updateScore,
    resetGame,
    update
});

setupTouchControls({
    canvas,
    board,
    getActive: () => active,
    setActive: (val) => { active = val; },
    getNext: () => next,
    setNext: (val) => { next = val; },
    spawnPiece,
    COLS,
    getIsGameOver: () => isGameOver,
    setGameOver: (val) => { isGameOver = val; },
    getIsPaused: () => isPaused,
    setFlags,
    addScore: (val) => { score += val; },
    updateScore
});


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
    drawHUD(ctx, TEXT_COLOR, NUMBER_COLOR, score, level, lines);
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