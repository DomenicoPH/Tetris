// --- Colisión básica (borde y celdas ocupadas) ---
export function collides(board, piece, nx, ny, nshape = piece.shape){
    const ROWS = board.length;
    const COLS = board[0].length;
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
export function lockPiece(board, piece){
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
export function clearLines(board){
    let linesCleared = 0;
    for(let y = board.length - 1; y >= 0; y--){
        if(board[y].every(cell => cell !== 0)){
            board.splice(y, 1); // elimina la fila llena
            board.unshift(Array(board[0].length).fill(0));
            linesCleared++;
            y++; // revisar la misma fila otra vez
        }
    }
    return linesCleared;
};