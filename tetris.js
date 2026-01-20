/* T E T R I S */
/* Desarrollado por Gnomono */

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
const COLORS_BASIC = {
    0: "#111",
    1: "#00FFFF",
    2: "#FFFF00",
    3: "#800080",
    4: "#00FF00",
    5: "#FF0000",
    6: "#0000FF",
    7: "#FFA500",
};

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

// Tetrominos (matrices). 1 = Celda ocupada / 0 = Celda vacía
const TETROMINOS = {
    I: {
        id: 1,
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ]
    },
    O: {
        id: 2,
        shape: [
            [1, 1],
            [1, 1],
        ]
    },
    T: {
        id: 3,
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ]
    },
    S: {
        id: 4,
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0],
        ]
    },
    Z: {
        id: 5,
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0],
        ]
    },
    J: {
        id: 6,
        shape: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0],
        ]
    },
    L: {
        id: 7,
        shape: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0],
        ]
    },
};

// Pieza activa (posición y forma)
let active = spawnPiece();
let next = spawnPiece();

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
            if(!collides(active, active.x - 1, active.y)){
                active.x--;
            }
            break;
        case "ArrowRight":
            if(!collides(active, active.x + 1, active.y)){
                active.x++;
            }
            break;
        case "ArrowDown":
            if(!collides(active, active.x, active.y + 1)){
                //active.y++;
                isSoftDropping = true;
            }
            break;
        case "ArrowUp":
            const rotated = rotateMatrix(active.shape);
            if(!collides(active, active.x, active.y, rotated)){
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
    while(!collides(active, active.x, active.y + 1)){
        active.y++;
    }
    lockPiece(active);
    const cleared = clearLines();
    if(cleared > 0){
        updateScore(cleared);
    };
    active = next;
    next = spawnPiece();
    if(collides(active, active.x, active.y)){
        isGameOver = true;
    }
};


// Utilidades de dibujo
function clearCanvas(){
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
};

function drawCell(x, y, id){
    ctx.fillStyle = COLORS[id] || "#FFF";
    ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
    //borde
    ctx.strokeStyle = "#222";
    ctx.strokeRect(x * CELL, y * CELL, CELL, CELL);
};

function drawBoard(){
    for(let y = 0; y < ROWS; y++){
        for(let x = 0; x < COLS; x++){
            const id = board[y][x];
            drawCell(x, y, id);
        }
    }
};

function drawPiece(piece){
    const {shape, x, y, id} = piece;
    for(let r = 0; r < shape.length; r++){
        for(let c = 0; c < shape[r].length; c++){
            if(shape[r][c]){
                drawCell(x + c, y + r, id);
            }
        }
    }
};


// --- Spawner de piezas ---
function randomTetromino(){
    const keys = Object.keys(TETROMINOS);
    const k = keys[Math.floor(Math.random() * keys.length)];
    return TETROMINOS[k];
};

function spawnPiece(){
    const { id, shape } = randomTetromino();
    // posición inicial: centrada horizontalmente
    const x = Math.floor((COLS - shape[0].length) / 2);
    const y = 0;
    return { id, shape, x, y }
};

// --- Colisión básica (borde y celdas ocupadas) ---
function collides(piece, nx, ny, nshape = piece.shape){
    for(let r = 0; r < nshape.length; r++){
        for(let c = 0; c < nshape[r].length; c++){
            if(!nshape[r][c]) continue;
            const x = nx + c;
            const y = ny + r;
            // fuera de límites
            if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return true;
            // choca con el tablero
            if (board[y][x] !== 0) return true;
        }
    }
    return false;
};

// --- Fijar pieza al tablero ---
function lockPiece(piece){
    const { shape, x, y, id } = piece;
    for(let r = 0; r < shape.length; r++){
        for(let c = 0; c < shape[r].length; c++){
            if(shape[r][c]){
                board[y + r][x + c] = id;
            }
        }
    }
};

// --- Eliminar líneas completas ---
function clearLines(){
    let linesCleared = 0;

    for(let y = ROWS - 1; y >= 0; y--){
        if(board[y].every(cell => cell !== 0)){
            board.splice(y, 1); // elimina la fila llena
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            y++; // revisar la misma fila otra vez
        }
    }
    return linesCleared;
}

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

// --- Mostrar score y level ---
function drawHUD(){
    ctx.fillStyle = TEXT_COLOR;
    ctx.font = "12px 'Press Start 2P'";
    ctx.fillText(`Score: ${score}`, 310, 25);
    ctx.fillText(`Level: ${level}`, 310, 50);
    ctx.fillText(`Lines: ${lines}`, 310, 75);
}

// --- Dibujar próxima pieza ---
function drawNext(){
    ctx.fillStyle = TEXT_COLOR;
    ctx.font = "12px 'Press Start 2P'";
    ctx.fillText("Next:", 310, 110);

    const { shape, id } = next;
    for(let r = 0; r < shape.length; r++){
        for(let c = 0; c < shape[r].length; c++){
            if(shape[r][c]){
                const offsetX = 315 / CELL;
                const offsetY = 5;
                drawCell(offsetX + c, offsetY + r, id);
            }
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
    active = spawnPiece();
    next = spawnPiece();

    isGameOver = false;
}

// --- Dibujar Game Over ---
function drawGameOver(){
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#FF0000";
    ctx.font = "24px 'Press Start 2P'";
    ctx.fillText("GAME OVER", 45, 250);
    
    ctx.font = "14px 'Press Start 2P'";
    ctx.fillText("Press R to Restart", 30, 290);
};

// --- Dibujar Pausa ---
function drawPaused(){
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#FFFF00";
    ctx.font = "24px 'Press Start 2P'";
    ctx.fillText("PAUSED", 85, 280);

    ctx.font = "14px 'Press Start 2P'";
    ctx.fillText("Press P to Resume", 40, 310);
}

// --- Bucle principal ---
function update(timestamp){
    if(!lastDrop) lastDrop = timestamp;
    const delta = timestamp - lastDrop;

    // render
    clearCanvas();
    drawBoard();
    drawPiece(active);
    drawHUD();
    drawNext();
    
    // Si Game Over...
    if(isGameOver){
        drawGameOver();
        return;
    };

    // Si Paused...
    if(isPaused){
        drawPaused();
        requestAnimationFrame(update);
        return;
    };

    // lógica de caída normal o acelerada
    const currentInterval = isSoftDropping ? 50 : dropInterval;
    if(delta >= currentInterval){
        // intentar bajar
        if(!collides(active, active.x, active.y + 1)){
            active.y++;
        } else {
            // fijar y spawnear nueva
            lockPiece(active);

            const cleared = clearLines(); // eliminar líneas
            if(cleared > 0){
                console.log(`Eliminaste ${cleared} línea(s)`);
                updateScore(cleared);
            }
            
            active = next;
            next = spawnPiece();
            // Game Over básico: si colisiona al aparecer
            if(collides(active, active.x, active.y)){
                // reset game
                isGameOver = true;             
            }
        }
        lastDrop = timestamp;
    }
    requestAnimationFrame(update);
};

requestAnimationFrame(update);