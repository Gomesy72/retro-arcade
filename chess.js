// Chess Game for Retro Arcade - with AI Opponent
class ChessGame {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.boardSize = Math.min(canvas.width, canvas.height) - 40;
        this.squareSize = this.boardSize / 8;
        this.board = this.initializeBoard();
        this.selectedPiece = null;
        this.currentPlayer = 'white';
        this.gameOver = false;
        this.moveHistory = [];
        this.aiPlayer = 'black';
        this.aiThinking = false;
        this.validMoves = [];
    }

    initializeBoard() {
        const board = [];
        for (let row = 0; row < 8; row++) {
            board[row] = [];
            for (let col = 0; col < 8; col++) {
                board[row][col] = this.getInitialPiece(row, col);
            }
        }
        return board;
    }

    getInitialPiece(row, col) {
        if (row === 1) return { type: 'pawn', color: 'black' };
        if (row === 6) return { type: 'pawn', color: 'white' };
        
        if (row === 0 || row === 7) {
            const color = row === 0 ? 'black' : 'white';
            const pieces = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
            return { type: pieces[col], color: color };
        }
        
        return null;
    }

    draw() {
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const x = col * this.squareSize + 20;
                const y = row * this.squareSize + 20;
                
                // Square color
                this.ctx.fillStyle = (row + col) % 2 === 0 ? '#D2B48C' : '#8B4513';
                this.ctx.fillRect(x, y, this.squareSize, this.squareSize);
                
                // Highlight valid moves
                if (this.validMoves.some(m => m.row === row && m.col === col)) {
                    this.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
                    this.ctx.fillRect(x, y, this.squareSize, this.squareSize);
                }
                
                // Highlight selected piece
                if (this.selectedPiece && this.selectedPiece.row === row && this.selectedPiece.col === col) {
                    this.ctx.strokeStyle = '#FFD700';
                    this.ctx.lineWidth = 3;
                    this.ctx.strokeRect(x, y, this.squareSize, this.squareSize);
                }
                
                // Draw piece
                const piece = this.board[row][col];
                if (piece) {
                    this.drawPiece(piece, x, y);
                }
            }
        }
        
        // Draw game info
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        let statusText = `Current: ${this.currentPlayer}`;
        if (this.aiThinking) statusText += ' (AI thinking...)';
        if (this.gameOver) statusText = 'Game Over!';
        this.ctx.fillText(statusText, 20, this.canvas.height - 10);
        
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            const winner = this.currentPlayer === 'white' ? 'Black' : 'White';
            this.ctx.fillText(`${winner} Wins!`, this.canvas.width/2, this.canvas.height/2 - 20);
            this.ctx.font = '16px Arial';
            this.ctx.fillText('Click Restart to play again', this.canvas.width/2, this.canvas.height/2 + 20);
        }
    }

    drawPiece(piece, x, y) {
        this.ctx.font = `${this.squareSize * 0.7}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const pieces = {
            'king': '♔', 'queen': '♕', 'rook': '♖',
            'bishop': '♗', 'knight': '♘', 'pawn': '♙'
        };
        
        this.ctx.fillStyle = piece.color === 'white' ? '#FFF' : '#000';
        this.ctx.fillText(
            pieces[piece.type],
            x + this.squareSize/2,
            y + this.squareSize/2
        );
    }

    handleClick(x, y) {
        if (this.gameOver || this.aiThinking || this.currentPlayer === this.aiPlayer) return;
        
        const col = Math.floor((x - 20) / this.squareSize);
        const row = Math.floor((y - 20) / this.squareSize);
        
        if (col < 0 || col > 7 || row < 0 || row > 7) return;
        
        const piece = this.board[row][col];
        
        if (this.selectedPiece) {
            // Try to move
            if (this.isValidMove(this.selectedPiece, row, col)) {
                this.movePiece(this.selectedPiece.row, this.selectedPiece.col, row, col);
                this.selectedPiece = null;
                this.validMoves = [];
                
                if (!this.gameOver) {
                    this.currentPlayer = this.aiPlayer;
                    this.draw();
                    // Trigger AI after a short delay
                    setTimeout(() => this.makeAIMove(), 500);
                }
            } else {
                // If clicking on another own piece, select it instead
                if (piece && piece.color === this.currentPlayer) {
                    this.selectedPiece = { row, col, piece };
                    this.validMoves = this.getValidMovesForPiece(row, col);
                } else {
                    this.selectedPiece = null;
                    this.validMoves = [];
                }
            }
        } else if (piece && piece.color === this.currentPlayer) {
            this.selectedPiece = { row, col, piece };
            this.validMoves = this.getValidMovesForPiece(row, col);
        }
    }

    getValidMovesForPiece(row, col) {
        const moves = [];
        const piece = this.board[row][col];
        if (!piece) return moves;
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.isValidMove({row, col, piece}, r, c)) {
                    moves.push({row: r, col: c});
                }
            }
        }
        return moves;
    }

    isValidMove(from, toRow, toCol) {
        const piece = from.piece;
        const rowDiff = Math.abs(toRow - from.row);
        const colDiff = Math.abs(toCol - from.col);
        
        if (toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) return false;
        if (from.row === toRow && from.col === toCol) return false;
        
        const targetPiece = this.board[toRow][toCol];
        if (targetPiece && targetPiece.color === piece.color) return false;
        
        // Check path for sliding pieces
        if (['rook', 'bishop', 'queen'].includes(piece.type)) {
            if (!this.isPathClear(from.row, from.col, toRow, toCol)) return false;
        }
        
        switch(piece.type) {
            case 'pawn':
                const direction = piece.color === 'white' ? -1 : 1;
                if (colDiff === 0 && !targetPiece) {
                    if (toRow === from.row + direction) return true;
                    if ((from.row === 6 || from.row === 1) && toRow === from.row + 2 * direction) {
                        return this.isPathClear(from.row, from.col, toRow, toCol);
                    }
                }
                if (colDiff === 1 && toRow === from.row + direction && targetPiece) return true;
                return false;
                
            case 'rook':
                return (rowDiff === 0 || colDiff === 0);
                
            case 'bishop':
                return rowDiff === colDiff;
                
            case 'queen':
                return (rowDiff === 0 || colDiff === 0 || rowDiff === colDiff);
                
            case 'king':
                return rowDiff <= 1 && colDiff <= 1;
                
            case 'knight':
                return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
                
            default:
                return false;
        }
    }

    isPathClear(fromRow, fromCol, toRow, toCol) {
        const rowStep = Math.sign(toRow - fromRow);
        const colStep = Math.sign(toCol - fromCol);
        let r = fromRow + rowStep;
        let c = fromCol + colStep;
        
        while (r !== toRow || c !== toCol) {
            if (this.board[r][c] !== null) return false;
            r += rowStep;
            c += colStep;
        }
        return true;
    }

    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const captured = this.board[toRow][toCol];
        
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        this.moveHistory.push({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: piece,
            captured: captured
        });
        
        // Check for pawn promotion
        if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
            this.board[toRow][toCol] = { type: 'queen', color: piece.color };
        }
        
        // Check for king capture (win condition)
        if (this.isKingCaptured()) {
            this.gameOver = true;
        }
    }

    undoMove() {
        if (this.moveHistory.length === 0) return;
        
        const lastMove = this.moveHistory.pop();
        this.board[lastMove.from.row][lastMove.from.col] = lastMove.piece;
        this.board[lastMove.to.row][lastMove.to.col] = lastMove.captured;
    }

    isKingCaptured() {
        let whiteKing = false;
        let blackKing = false;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = this.board[r][c];
                if (p && p.type === 'king') {
                    if (p.color === 'white') whiteKing = true;
                    else blackKing = true;
                }
            }
        }
        return !whiteKing || !blackKing;
    }

    // ========== AI OPPONENT ==========
    makeAIMove() {
        if (this.gameOver) return;
        this.aiThinking = true;
        this.draw();
        
        // Use setTimeout to allow UI update before AI calculates
        setTimeout(() => {
            const move = this.findBestMove(2); // Reduced depth for speed
            if (move) {
                this.movePiece(move.from.row, move.from.col, move.to.row, move.to.col);
                this.currentPlayer = 'white';
            } else {
                // No valid moves - stalemate or checkmate
                this.gameOver = true;
            }
            this.aiThinking = false;
            this.draw();
        }, 100);
    }

    findBestMove(depth) {
        let bestMove = null;
        let bestValue = -Infinity;
        
        const moves = this.getAllPossibleMoves(this.aiPlayer);
        
        // If no moves available, return null (stalemate/checkmate)
        if (moves.length === 0) return null;
        
        for (const move of moves) {
            // Make move
            const piece = this.board[move.from.row][move.from.col];
            const captured = this.board[move.to.row][move.to.col];
            this.board[move.to.row][move.to.col] = piece;
            this.board[move.from.row][move.from.col] = null;
            
            // Handle promotion in simulation
            let promoted = false;
            if (piece.type === 'pawn' && (move.to.row === 0 || move.to.row === 7)) {
                this.board[move.to.row][move.to.col] = { type: 'queen', color: piece.color };
                promoted = true;
            }
            
            // Evaluate
            const value = this.minimax(depth - 1, -Infinity, Infinity, false);
            
            // Undo move
            this.board[move.from.row][move.from.col] = piece;
            this.board[move.to.row][move.to.col] = captured;
            
            if (value > bestValue) {
                bestValue = value;
                bestMove = move;
            }
        }
        
        return bestMove;
    }

    minimax(depth, alpha, beta, isMaximizing) {
        // Check terminal conditions
        if (this.isKingCaptured()) {
            // If maximizing (AI) just moved and king is captured, that's good for AI
            return isMaximizing ? -10000 : 10000;
        }
        
        if (depth === 0) {
            return this.evaluateBoard();
        }
        
        const player = isMaximizing ? this.aiPlayer : 'white';
        const moves = this.getAllPossibleMoves(player);
        
        if (moves.length === 0) {
            // No moves - if king is still there, it's stalemate (0), else checkmate
            return this.isKingCaptured() ? (isMaximizing ? -10000 : 10000) : 0;
        }
        
        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const move of moves) {
                const piece = this.board[move.from.row][move.from.col];
                const captured = this.board[move.to.row][move.to.col];
                this.board[move.to.row][move.to.col] = piece;
                this.board[move.from.row][move.from.col] = null;
                
                // Handle promotion
                const wasPromoted = piece.type === 'pawn' && (move.to.row === 0 || move.to.row === 7);
                if (wasPromoted) {
                    this.board[move.to.row][move.to.col] = { type: 'queen', color: piece.color };
                }
                
                const eval_ = this.minimax(depth - 1, alpha, beta, false);
                
                // Undo
                this.board[move.from.row][move.from.col] = piece;
                this.board[move.to.row][move.to.col] = captured;
                
                maxEval = Math.max(maxEval, eval_);
                alpha = Math.max(alpha, eval_);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of moves) {
                const piece = this.board[move.from.row][move.from.col];
                const captured = this.board[move.to.row][move.to.col];
                this.board[move.to.row][move.to.col] = piece;
                this.board[move.from.row][move.from.col] = null;
                
                // Handle promotion
                const wasPromoted = piece.type === 'pawn' && (move.to.row === 0 || move.to.row === 7);
                if (wasPromoted) {
                    this.board[move.to.row][move.to.col] = { type: 'queen', color: piece.color };
                }
                
                const eval_ = this.minimax(depth - 1, alpha, beta, true);
                
                // Undo
                this.board[move.from.row][move.from.col] = piece;
                this.board[move.to.row][move.to.col] = captured;
                
                minEval = Math.min(minEval, eval_);
                beta = Math.min(beta, eval_);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    getAllPossibleMoves(color) {
        const moves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && piece.color === color) {
                    for (let tr = 0; tr < 8; tr++) {
                        for (let tc = 0; tc < 8; tc++) {
                            if (this.isValidMove({row: r, col: c, piece}, tr, tc)) {
                                moves.push({
                                    from: {row: r, col: c},
                                    to: {row: tr, col: tc}
                                });
                            }
                        }
                    }
                }
            }
        }
        return moves;
    }

    evaluateBoard() {
        const pieceValues = {
            'pawn': 100,
            'knight': 320,
            'bishop': 330,
            'rook': 500,
            'queen': 900,
            'king': 20000
        };
        
        let score = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece) {
                    const value = pieceValues[piece.type] || 0;
                    if (piece.color === this.aiPlayer) {
                        score += value;
                        // Bonus for advanced pawns
                        if (piece.type === 'pawn') {
                            score += (piece.color === 'black' ? r : (7 - r)) * 10;
                        }
                        // Center control bonus
                        if (piece.type === 'knight' || piece.type === 'bishop') {
                            const centerDist = Math.abs(3.5 - r) + Math.abs(3.5 - c);
                            score += (7 - centerDist) * 5;
                        }
                    } else {
                        score -= value;
                        if (piece.type === 'pawn') {
                            score -= (piece.color === 'black' ? r : (7 - r)) * 10;
                        }
                        if (piece.type === 'knight' || piece.type === 'bishop') {
                            const centerDist = Math.abs(3.5 - r) + Math.abs(3.5 - c);
                            score -= (7 - centerDist) * 5;
                        }
                    }
                }
            }
        }
        return score;
    }
}

// Export for use in main games.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChessGame;
}