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
const COLORS = {
    0: "#111",
    1: "#00FFFF",
    2: "#FFFF00",
    3: "#800080",
    4: "#00FF00",
    5: "#FF0000",
    6: "#0000FF",
    7: "#FFA500",
};

// Color de fondo
const BG_COLOR = "#000"

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

// Gravedad
let dropInterval = 500 //ms
let lastDrop = 0;


// --- Controles --- // -------------------------------------------------

document.addEventListener("keydown", e => {
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
                active.y++;
            }
            break;
        case "ArrowUp":
            const rotated = rotateMatrix(active.shape);
            if(!collides(active, active.x, active.y, rotated)){
                active.shape = rotated;
            }
            break;
    }
})

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

// --- Bucle principal ---
function update(timestamp){
    if(!lastDrop) lastDrop = timestamp;
    const delta = timestamp - lastDrop;

    if(delta >= dropInterval){
        // intentar bajar
        if(!collides(active, active.x, active.y + 1)){
            active.y++;
        } else {
            // fijar y spawnear nueva
            lockPiece(active);

            const cleared = clearLines(); // eliminar líneas
            if(cleared > 0){
                console.log(`Eliminaste ${cleared} línea(s)`);
                // Puntaje aquí
            }
            
            active = spawnPiece();
            // Game Over básico: si colisiona al aparecer
            if(collides(active, active.x, active.y)){
                // reinicio simple
                for(let y = 0; y < ROWS; y++) board[y].fill(0);
                active = spawnPiece();
            }
        }
        lastDrop = timestamp;
    }

    // render
    clearCanvas();
    drawBoard();
    drawPiece(active);
    requestAnimationFrame(update);

};

requestAnimationFrame(update);