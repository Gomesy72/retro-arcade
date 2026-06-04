// Retro Arcade - Game Engine
let currentGame = null;
let gameLoop = null;
let canvas, ctx;

function openGame(gameName) {
    const modal = document.getElementById('gameModal');
    const title = document.getElementById('gameTitle');
    const instructions = document.getElementById('gameInstructions');
    
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 600;
    canvas.height = 400;
    
    modal.style.display = 'flex';
    currentGame = gameName;
    
    switch(gameName) {
        case 'snake':
            title.textContent = '🐍 Snake';
            instructions.textContent = 'Use arrow keys to move. Eat food to grow!';
            initSnake();
            break;
        case 'tetris':
            title.textContent = '🧱 Tetris';
            instructions.textContent = 'Arrow keys to move, Up to rotate';
            initTetris();
            break;
        case 'pong':
            title.textContent = '🏓 Pong';
            instructions.textContent = 'Mouse or arrow keys to move paddle';
            initPong();
            break;
        case 'breakout':
            title.textContent = '🧱 Breakout';
            instructions.textContent = 'Mouse or arrow keys to move paddle';
            initBreakout();
            break;
        case 'dino':
            title.textContent = '🦕 Chrome Dino';
            instructions.textContent = 'Space or Up arrow to jump';
            initDino();
            break;
        case 'memory':
            title.textContent = '🃏 Memory Match';
            instructions.textContent = 'Click cards to flip them. Match pairs!';
            initMemory();
            break;
    }
}

function closeGame() {
    document.getElementById('gameModal').style.display = 'none';
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
        gameLoop = null;
    }
    currentGame = null;
}

function resetGame() {
    if (currentGame) {
        closeGame();
        openGame(currentGame);
    }
}

// ==================== SNAKE GAME ====================
let snake, food, direction, score;

function initSnake() {
    snake = [{x: 10, y: 10}];
    food = {x: 15, y: 15};
    direction = {x: 1, y: 0};
    score = 0;
    
    document.addEventListener('keydown', handleSnakeInput);
    snakeLoop();
}

function handleSnakeInput(e) {
    if (!currentGame || currentGame !== 'snake') return;
    
    switch(e.key) {
        case 'ArrowUp': if (direction.y === 0) direction = {x: 0, y: -1}; break;
        case 'ArrowDown': if (direction.y === 0) direction = {x: 0, y: 1}; break;
        case 'ArrowLeft': if (direction.x === 0) direction = {x: -1, y: 0}; break;
        case 'ArrowRight': if (direction.x === 0) direction = {x: 1, y: 0}; break;
    }
}

function snakeLoop() {
    if (currentGame !== 'snake') return;
    
    // Move snake
    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
    
    // Check walls
    if (head.x < 0 || head.x >= 30 || head.y < 0 || head.y >= 20) {
        gameOver('Game Over! Score: ' + score);
        return;
    }
    
    // Check self collision
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver('Game Over! Score: ' + score);
            return;
        }
    }
    
    snake.unshift(head);
    
    // Check food
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        food = {
            x: Math.floor(Math.random() * 30),
            y: Math.floor(Math.random() * 20)
        };
    } else {
        snake.pop();
    }
    
    // Draw
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake
    ctx.fillStyle = '#00ff00';
    for (let segment of snake) {
        ctx.fillRect(segment.x * 20, segment.y * 20, 18, 18);
    }
    
    // Draw food
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(food.x * 20, food.y * 20, 18, 18);
    
    // Draw score
    ctx.fillStyle = '#fff';
    ctx.font = '20px Courier';
    ctx.fillText('Score: ' + score, 10, 30);
    
    gameLoop = requestAnimationFrame(() => setTimeout(snakeLoop, 100));
}

// ==================== PONG GAME ====================
let pongBall, pongPaddle, pongAI, pongScore;

function initPong() {
    pongBall = {x: 300, y: 200, dx: 4, dy: 4, radius: 8};
    pongPaddle = {y: 150, height: 80, width: 10};
    pongAI = {y: 150, height: 80, width: 10};
    pongScore = {player: 0, ai: 0};
    
    canvas.addEventListener('mousemove', (e) => {
        if (currentGame !== 'pong') return;
        const rect = canvas.getBoundingClientRect();
        pongPaddle.y = e.clientY - rect.top - pongPaddle.height / 2;
    });
    
    pongLoop();
}

function pongLoop() {
    if (currentGame !== 'pong') return;
    
    // Move ball
    pongBall.x += pongBall.dx;
    pongBall.y += pongBall.dy;
    
    // Bounce off top/bottom
    if (pongBall.y - pongBall.radius < 0 || pongBall.y + pongBall.radius > canvas.height) {
        pongBall.dy = -pongBall.dy;
    }
    
    // AI paddle movement
    const aiCenter = pongAI.y + pongAI.height / 2;
    if (aiCenter < pongBall.y - 10) pongAI.y += 3;
    if (aiCenter > pongBall.y + 10) pongAI.y -= 3;
    
    // Player collision
    if (pongBall.x - pongBall.radius < pongPaddle.width &&
        pongBall.y > pongPaddle.y && pongBall.y < pongPaddle.y + pongPaddle.height) {
        pongBall.dx = -pongBall.dx * 1.1;
    }
    
    // AI collision
    if (pongBall.x + pongBall.radius > canvas.width - pongAI.width &&
        pongBall.y > pongAI.y && pongBall.y < pongAI.y + pongAI.height) {
        pongBall.dx = -pongBall.dx * 1.1;
    }
    
    // Scoring
    if (pongBall.x < 0) {
        pongScore.ai++;
        resetPongBall();
    }
    if (pongBall.x > canvas.width) {
        pongScore.player++;
        resetPongBall();
    }
    
    // Draw
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw paddles
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(0, pongPaddle.y, pongPaddle.width, pongPaddle.height);
    ctx.fillRect(canvas.width - pongAI.width, pongAI.y, pongAI.width, pongAI.height);
    
    // Draw ball
    ctx.beginPath();
    ctx.arc(pongBall.x, pongBall.y, pongBall.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    
    // Draw score
    ctx.fillStyle = '#fff';
    ctx.font = '30px Courier';
    ctx.fillText(pongScore.player, canvas.width / 4, 50);
    ctx.fillText(pongScore.ai, 3 * canvas.width / 4, 50);
    
    gameLoop = requestAnimationFrame(pongLoop);
}

function resetPongBall() {
    pongBall.x = canvas.width / 2;
    pongBall.y = canvas.height / 2;
    pongBall.dx = (Math.random() > 0.5 ? 4 : -4);
    pongBall.dy = (Math.random() * 4 - 2);
}

// ==================== BREAKOUT GAME ====================
let breakoutBall, breakoutPaddle, breakoutBricks, breakoutScore;

function initBreakout() {
    breakoutBall = {x: 300, y: 200, dx: 3, dy: -3, radius: 6};
    breakoutPaddle = {x: 250, y: 380, width: 100, height: 10};
    breakoutScore = 0;
    
    // Create bricks
    breakoutBricks = [];
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 10; col++) {
            breakoutBricks.push({
                x: col * 60 + 5,
                y: row * 25 + 30,
                width: 55,
                height: 20,
                color: `hsl(${row * 60}, 100%, 50%)`,
                alive: true
            });
        }
    }
    
    canvas.addEventListener('mousemove', (e) => {
        if (currentGame !== 'breakout') return;
        const rect = canvas.getBoundingClientRect();
        breakoutPaddle.x = e.clientX - rect.left - breakoutPaddle.width / 2;
    });
    
    breakoutLoop();
}

function breakoutLoop() {
    if (currentGame !== 'breakout') return;
    
    // Move ball
    breakoutBall.x += breakoutBall.dx;
    breakoutBall.y += breakoutBall.dy;
    
    // Wall collision
    if (breakoutBall.x - breakoutBall.radius < 0 || breakoutBall.x + breakoutBall.radius > canvas.width) {
        breakoutBall.dx = -breakoutBall.dx;
    }
    if (breakoutBall.y - breakoutBall.radius < 0) {
        breakoutBall.dy = -breakoutBall.dy;
    }
    
    // Paddle collision
    if (breakoutBall.y + breakoutBall.radius > breakoutPaddle.y &&
        breakoutBall.x > breakoutPaddle.x && breakoutBall.x < breakoutPaddle.x + breakoutPaddle.width) {
        breakoutBall.dy = -breakoutBall.dy;
    }
    
    // Brick collision
    for (let brick of breakoutBricks) {
        if (brick.alive &&
            breakoutBall.x > brick.x && breakoutBall.x < brick.x + brick.width &&
            breakoutBall.y > brick.y && breakoutBall.y < brick.y + brick.height) {
            brick.alive = false;
            breakoutBall.dy = -breakoutBall.dy;
            breakoutScore += 10;
        }
    }
    
    // Game over
    if (breakoutBall.y > canvas.height) {
        gameOver('Game Over! Score: ' + breakoutScore);
        return;
    }
    
    // Win condition
    if (breakoutBricks.every(b => !b.alive)) {
        gameOver('You Win! Score: ' + breakoutScore);
        return;
    }
    
    // Draw
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw bricks
    for (let brick of breakoutBricks) {
        if (brick.alive) {
            ctx.fillStyle = brick.color;
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        }
    }
    
    // Draw paddle
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(breakoutPaddle.x, breakoutPaddle.y, breakoutPaddle.width, breakoutPaddle.height);
    
    // Draw ball
    ctx.beginPath();
    ctx.arc(breakoutBall.x, breakoutBall.y, breakoutBall.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    
    // Draw score
    ctx.fillStyle = '#fff';
    ctx.font = '20px Courier';
    ctx.fillText('Score: ' + breakoutScore, 10, 25);
    
    gameLoop = requestAnimationFrame(breakoutLoop);
}

// ==================== MEMORY GAME ====================
let memoryCards, memoryFlipped, memoryMatched, memoryCanFlip;

function initMemory() {
    const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
    memoryCards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    memoryFlipped = [];
    memoryMatched = 0;
    memoryCanFlip = true;
    
    canvas.width = 400;
    canvas.height = 400;
    
    canvas.addEventListener('click', handleMemoryClick);
    drawMemory();
}

function handleMemoryClick(e) {
    if (!memoryCanFlip || currentGame !== 'memory') return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const col = Math.floor(x / 100);
    const row = Math.floor(y / 100);
    const index = row * 4 + col;
    
    if (index < 0 || index >= 16) return;
    if (memoryFlipped.includes(index) || memoryCards[index] === null) return;
    
    memoryFlipped.push(index);
    drawMemory();
    
    if (memoryFlipped.length === 2) {
        memoryCanFlip = false;
        const [first, second] = memoryFlipped;
        
        if (memoryCards[first] === memoryCards[second]) {
            memoryCards[first] = null;
            memoryCards[second] = null;
            memoryMatched += 2;
            memoryFlipped = [];
            memoryCanFlip = true;
            
            if (memoryMatched === 16) {
                setTimeout(() => gameOver('You Win! All pairs matched!'), 500);
            }
        } else {
            setTimeout(() => {
                memoryFlipped = [];
                memoryCanFlip = true;
                drawMemory();
            }, 1000);
        }
    }
}

function drawMemory() {
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < 16; i++) {
        const row = Math.floor(i / 4);
        const col = i % 4;
        const x = col * 100 + 5;
        const y = row * 100 + 5;
        
        if (memoryCards[i] === null) {
            ctx.fillStyle = '#27ae60';
            ctx.fillRect(x, y, 90, 90);
        } else if (memoryFlipped.includes(i)) {
            ctx.fillStyle = '#ecf0f1';
            ctx.fillRect(x, y, 90, 90);
            ctx.fillStyle = '#2c3e50';
            ctx.font = '40px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(memoryCards[i], x + 45, y + 60);
        } else {
            ctx.fillStyle = '#3498db';
            ctx.fillRect(x, y, 90, 90);
            ctx.fillStyle = '#2980b9';
            ctx.fillRect(x + 5, y + 5, 80, 80);
        }
    }
}

// ==================== TETRIS GAME ====================
let tetrisBoard, tetrisPiece, tetrisScore;

const TETRIS_SHAPES = [
    [[1,1,1,1]], // I
    [[1,1],[1,1]], // O
    [[1,1,1],[0,1,0]], // T
    [[1,1,1],[1,0,0]], // L
    [[1,1,1],[0,0,1]], // J
    [[0,1,1],[1,1,0]], // S
    [[1,1,0],[0,1,1]] // Z
];

function initTetris() {
    tetrisBoard = Array(20).fill().map(() => Array(10).fill(0));
    tetrisScore = 0;
    newTetrisPiece();
    
    document.addEventListener('keydown', handleTetrisInput);
    tetrisLoop();
}

function newTetrisPiece() {
    const shape = TETRIS_SHAPES[Math.floor(Math.random() * TETRIS_SHAPES.length)];
    tetrisPiece = {
        shape: shape,
        x: 4,
        y: 0,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`
    };
}

function handleTetrisInput(e) {
    if (!currentGame || currentGame !== 'tetris') return;
    
    switch(e.key) {
        case 'ArrowLeft': moveTetris(-1, 0); break;
        case 'ArrowRight': moveTetris(1, 0); break;
        case 'ArrowDown': moveTetris(0, 1); break;
        case 'ArrowUp': rotateTetris(); break;
    }
}

function moveTetris(dx, dy) {
    tetrisPiece.x += dx;
    tetrisPiece.y += dy;
    
    if (collision()) {
        tetrisPiece.x -= dx;
        tetrisPiece.y -= dy;
        
        if (dy > 0) {
            mergePiece();
            clearLines();
            newTetrisPiece();
            if (collision()) {
                gameOver('Game Over! Score: ' + tetrisScore);
            }
        }
    }
}

function rotateTetris() {
    const rotated = tetrisPiece.shape[0].map((_, i) => 
        tetrisPiece.shape.map(row => row[i]).reverse()
    );
    const oldShape = tetrisPiece.shape;
    tetrisPiece.shape = rotated;
    
    if (collision()) {
        tetrisPiece.shape = oldShape;
    }
}

function collision() {
    for (let y = 0; y < tetrisPiece.shape.length; y++) {
        for (let x = 0; x < tetrisPiece.shape[y].length; x++) {
            if (tetrisPiece.shape[y][x]) {
                const boardX = tetrisPiece.x + x;
                const boardY = tetrisPiece.y + y;
                
                if (boardX < 0 || boardX >= 10 || boardY >= 20) return true;
                if (boardY >= 0 && tetrisBoard[boardY][boardX]) return true;
            }
        }
    }
    return false;
}

function mergePiece() {
    for (let y = 0; y < tetrisPiece.shape.length; y++) {
        for (let x = 0; x < tetrisPiece.shape[y].length; x++) {
            if (tetrisPiece.shape[y][x]) {
                const boardY = tetrisPiece.y + y;
                if (boardY >= 0) {
                    tetrisBoard[boardY][tetrisPiece.x + x] = tetrisPiece.color;
                }
            }
        }
    }
}

function clearLines() {
    for (let y = tetrisBoard.length - 1; y >= 0; y--) {
        if (tetrisBoard[y].every(cell => cell !== 0)) {
            tetrisBoard.splice(y, 1);
            tetrisBoard.unshift(Array(10).fill(0));
            tetrisScore += 100;
        }
    }
}

function tetrisLoop() {
    if (currentGame !== 'tetris') return;
    
    // Auto-move down
    if (!tetrisPiece) newTetrisPiece();
    moveTetris(0, 1);
    
    // Draw
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw board
    for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 10; x++) {
            if (tetrisBoard[y][x]) {
                ctx.fillStyle = tetrisBoard[y][x];
                ctx.fillRect(x * 30, y * 20, 29, 19);
            }
        }
    }
    
    // Draw piece
    ctx.fillStyle = tetrisPiece.color;
    for (let y = 0; y < tetrisPiece.shape.length; y++) {
        for (let x = 0; x < tetrisPiece.shape[y].length; x++) {
            if (tetrisPiece.shape[y][x]) {
                ctx.fillRect((tetrisPiece.x + x) * 30, (tetrisPiece.y + y) * 20, 29, 19);
            }
        }
    }
    
    // Draw score
    ctx.fillStyle = '#fff';
    ctx.font = '20px Courier';
    ctx.fillText('Score: ' + tetrisScore, 10, 30);
    
    gameLoop = setTimeout(() => requestAnimationFrame(tetrisLoop), 500);
}

// ==================== CHROME DINO GAME ====================
let dino, dinoObstacles, dinoScore, dinoJumping, dinoGravity;

function initDino() {
    dino = {x: 50, y: 350, width: 30, height: 40, jumpVelocity: 0};
    dinoObstacles = [];
    dinoScore = 0;
    dinoJumping = false;
    dinoGravity = 0.8;
    
    document.addEventListener('keydown', (e) => {
        if (currentGame !== 'dino') return;
        if ((e.code === 'Space' || e.code === 'ArrowUp') && !dinoJumping) {
            dinoJumping = true;
            dino.jumpVelocity = -15;
        }
    });
    
    dinoLoop();
}

function dinoLoop() {
    if (currentGame !== 'dino') return;
    
    // Update dino
    if (dinoJumping) {
        dino.y += dino.jumpVelocity;
        dino.jumpVelocity += dinoGravity;
        
        if (dino.y >= 350) {
            dino.y = 350;
            dinoJumping = false;
            dino.jumpVelocity = 0;
        }
    }
    
    // Spawn obstacles
    if (Math.random() < 0.02) {
        dinoObstacles.push({
            x: canvas.width,
            y: 350,
            width: 20 + Math.random() * 20,
            height: 30 + Math.random() * 30
        });
    }
    
    // Move obstacles
    for (let obs of dinoObstacles) {
        obs.x -= 6;
    }
    
    // Remove off-screen
    dinoObstacles = dinoObstacles.filter(obs => obs.x + obs.width > 0);
    
    // Check collision
    for (let obs of dinoObstacles) {
        if (dino.x < obs.x + obs.width &&
            dino.x + dino.width > obs.x &&
            dino.y < obs.y + obs.height &&
            dino.y + dino.height > obs.y) {
            gameOver('Game Over! Score: ' + Math.floor(dinoScore));
            return;
        }
    }
    
    dinoScore += 0.1;
    
    // Draw
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground
    ctx.fillStyle = '#535353';
    ctx.fillRect(0, 390, canvas.width, 10);
    
    // Draw dino
    ctx.fillStyle = '#535353';
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
    
    // Draw obstacles
    for (let obs of dinoObstacles) {
        ctx.fillRect(obs.x, obs.y - obs.height + 40, obs.width, obs.height);
    }
    
    // Draw score
    ctx.fillStyle = '#535353';
    ctx.font = '20px Courier';
    ctx.fillText('Score: ' + Math.floor(dinoScore), 10, 30);
    
    gameLoop = requestAnimationFrame(dinoLoop);
}

// ==================== GAME OVER ====================
function gameOver(message) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = '30px Courier';
    ctx.textAlign = 'center';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    
    ctx.font = '20px Courier';
    ctx.fillText('Press Restart to play again', canvas.width / 2, canvas.height / 2 + 40);
    
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
        gameLoop = null;
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('gameModal');
    if (event.target === modal) {
        closeGame();
    }
}
