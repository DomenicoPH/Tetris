// Utilidades de dibujo
export function clearCanvas(ctx, BG_COLOR, canvas){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
};

function drawCell(ctx, x, y, id, CELL, COLORS){
    ctx.fillStyle = COLORS[id] || "#FFF";
    ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
    //borde
    ctx.strokeStyle = "#3a3a3a";
    ctx.strokeRect(x * CELL, y * CELL, CELL, CELL);
};

export function drawBoard(ctx, board, CELL, COLORS){
    for(let y = 0; y < board.length; y++){
        for(let x = 0; x < board[0].length; x++){
            const id = board[y][x];
            drawCell(ctx, x, y, id, CELL, COLORS);
        }
    }
};

export function drawPiece(ctx, piece, CELL, COLORS){
    const {shape, x, y, id} = piece;
    for(let r = 0; r < shape.length; r++){
        for(let c = 0; c < shape[r].length; c++){
            if(shape[r][c]){
                drawCell(ctx, x + c, y + r, id, CELL, COLORS);
            }
        }
    }
};

// --- Mostrar score y level ---
export function drawHUD(ctx, TEXT_COLOR, NUMBER_COLOR, score, level, lines){
    ctx.font = "8px 'Press Start 2P'";
    
    ctx.fillStyle = TEXT_COLOR;
    ctx.fillText(`SCORE`, 310, 25);
    
    ctx.fillStyle = NUMBER_COLOR;
    ctx.fillText(score, 310, 45);
    
    ctx.fillStyle = TEXT_COLOR;
    ctx.fillText(`LEVEL`, 310, 65);
    
    ctx.fillStyle = NUMBER_COLOR;
    ctx.fillText(level, 310, 85);
    
    ctx.fillStyle = TEXT_COLOR;
    ctx.fillText(`LINES`, 310, 105);

    ctx.fillStyle = NUMBER_COLOR;
    ctx.fillText(lines, 310, 125);
};

// --- Dibujar próxima pieza ---
// --- Dibujar próxima pieza ---
export function drawNext(ctx, next, CELL, COLORS, TEXT_COLOR){
    const SCALE_FACTOR = 0.4; // 40% del tamaño original
    const SMALL_CELL = CELL * SCALE_FACTOR;
    
    const { shape, id } = next;
    
    // Calcular posición centrada en el área derecha (310-450px)
    const nextAreaWidth = 140; // 450-310
    const pieceWidth = shape[0].length * SMALL_CELL;
    
    //const offsetX = 310 + (nextAreaWidth - pieceWidth) / 2; // Centrado horizontal
    const offsetX = 305;
    const offsetY = 145; // Posición vertical fija
    
    // Dibujar cada celda escalada
    for(let r = 0; r < shape.length; r++){
        for(let c = 0; c < shape[r].length; c++){
            if(shape[r][c]){
                ctx.fillStyle = COLORS[id] || "#FFF";
                ctx.fillRect(
                    offsetX + c * SMALL_CELL, 
                    offsetY + r * SMALL_CELL, 
                    SMALL_CELL, 
                    SMALL_CELL
                );
                // Borde
                ctx.strokeStyle = "#222";
                ctx.strokeRect(
                    offsetX + c * SMALL_CELL, 
                    offsetY + r * SMALL_CELL, 
                    SMALL_CELL, 
                    SMALL_CELL
                );
            }
        }
    }
};

// --- Dibujar Game Over ---
export function drawGameOver(ctx, canvas){
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#FF0000";
    ctx.font = "24px 'Press Start 2P'";
    ctx.fillText("GAME OVER", 45, 250);
    
    ctx.font = "14px 'Press Start 2P'";
    ctx.fillText("Press R to Restart", 30, 290);
};

// --- Dibujar Pausa ---
export function drawPaused(ctx, canvas){
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#FFFF00";
    ctx.font = "24px 'Press Start 2P'";
    ctx.fillText("PAUSED", 85, 280);

    ctx.font = "14px 'Press Start 2P'";
    ctx.fillText("Press P to Resume", 40, 310);
}