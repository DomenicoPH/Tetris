// Utilidades de dibujo
export function clearCanvas(ctx, BG_COLOR, canvas){
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
};

function drawCell(ctx, x, y, id, CELL, COLORS){
    ctx.fillStyle = COLORS[id] || "#FFF";
    ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
    //borde
    ctx.strokeStyle = "#222";
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
export function drawHUD(ctx, TEXT_COLOR, score, level, lines){
    ctx.fillStyle = TEXT_COLOR;
    ctx.font = "12px 'Press Start 2P'";
    ctx.fillText(`Score: ${score}`, 310, 25);
    ctx.fillText(`Level: ${level}`, 310, 50);
    ctx.fillText(`Lines: ${lines}`, 310, 75);
};

// --- Dibujar próxima pieza ---
export function drawNext(ctx, next, CELL, COLORS, TEXT_COLOR){
    ctx.fillStyle = TEXT_COLOR;
    ctx.font = "12px 'Press Start 2P'";
    ctx.fillText("Next:", 310, 110);

    const { shape, id } = next;
    const offsetX = Math.floor(315 / CELL);
    const offsetY = 5;
    for(let r = 0; r < shape.length; r++){
        for(let c = 0; c < shape[r].length; c++){
            if(shape[r][c]){
                drawCell(ctx, offsetX + c, offsetY + r, id, CELL, COLORS);
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