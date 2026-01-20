// Tetrominos (matrices). 1 = Celda ocupada / 0 = Celda vacía
export const TETROMINOS = {
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

// --- Devuelve un tetromino aleatorio ---
export function randomTetromino(){
    const keys = Object.keys(TETROMINOS);
    const k = keys[Math.floor(Math.random() * keys.length)];
    return TETROMINOS[k];
};

// --- Crea una nueva pieza en la parte superior ---
export function spawnPiece(COLS){
    const { id, shape } = randomTetromino();
    // posición inicial: centrada horizontalmente
    const x = Math.floor((COLS - shape[0].length) / 2);
    const y = 0;
    return { id, shape, x, y }
};
