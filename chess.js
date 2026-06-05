// Chess Game for Retro Arcade
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
        this.ctx.fillText(`Current: ${this.currentPlayer}`, 20, this.canvas.height - 10);
        
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over!', this.canvas.width/2, this.canvas.height/2);
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
        if (this.gameOver) return;
        
        const col = Math.floor((x - 20) / this.squareSize);
        const row = Math.floor((y - 20) / this.squareSize);
        
        if (col < 0 || col > 7 || row < 0 || row > 7) return;
        
        const piece = this.board[row][col];
        
        if (this.selectedPiece) {
            // Try to move
            if (this.isValidMove(this.selectedPiece, row, col)) {
                this.movePiece(this.selectedPiece, row, col);
                this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
            }
            this.selectedPiece = null;
        } else if (piece && piece.color === this.currentPlayer) {
            this.selectedPiece = { row, col, piece };
        }
    }

    isValidMove(from, toRow, toCol) {
        const piece = from.piece;
        const rowDiff = Math.abs(toRow - from.row);
        const colDiff = Math.abs(toCol - from.col);
        
        // Basic validation (simplified chess rules)
        if (toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) return false;
        
        const targetPiece = this.board[toRow][toCol];
        if (targetPiece && targetPiece.color === piece.color) return false;
        
        switch(piece.type) {
            case 'pawn':
                const direction = piece.color === 'white' ? -1 : 1;
                if (colDiff === 0 && !targetPiece) {
                    if (toRow === from.row + direction) return true;
                    if ((from.row === 6 || from.row === 1) && toRow === from.row + 2 * direction) return true;
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

    movePiece(from, toRow, toCol) {
        this.board[toRow][toCol] = from.piece;
        this.board[from.row][from.col] = null;
        this.moveHistory.push({
            from: { row: from.row, col: from.col },
            to: { row: toRow, col: toCol },
            piece: from.piece
        });
    }
}

// Export for use in main games.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChessGame;
}
