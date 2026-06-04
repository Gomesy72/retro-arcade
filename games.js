// Retro Arcade - Game Engine
let currentGame = null;
let gameLoop = null;
let canvas, ctx;
let isMobile = false;

// Detect mobile
function checkMobile() {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0));
}

function openGame(gameName) {
    const modal = document.getElementById('gameModal');
    const title = document.getElementById('gameTitle');
    const instructions = document.getElementById('gameInstructions');
    
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    isMobile = checkMobile();
    
    // Set canvas size based on device
    if (isMobile) {
        canvas.width = Math.min(window.innerWidth - 40, 400);
        canvas.height = Math.min(window.innerHeight - 300, 300);
    } else {
        canvas.width = 600;
        canvas.height = 400;
    }
    
    modal.style.display = 'flex';
    currentGame = gameName;
    
    // Show/hide mobile controls
    const dpad = document.getElementById('dpad');
    const actionBtn = document.getElementById('actionButtons');
    const memoryTouch = document.getElementById('memoryTouch');
    
    if (isMobile) {
        document.querySelector('.mobile-controls').style.display = 'block';
        
        // Show appropriate controls for each game
        switch(gameName) {
            case 'snake':
            case 'tetris':
                dpad.style.display = 'flex';
                actionBtn.style.display = 'none';
                memoryTouch.style.display = 'none';
                break;
            case 'dino':
                dpad.style.display = 'none';
                actionBtn.style.display = 'flex';
                memoryTouch.style.display = 'none';
                document.getElementById('btnAction').textContent = 'JUMP';
                break;
            case 'memory':
                dpad.style.display = 'none';
                actionBtn.style.display = 'none';
                memoryTouch.style.display = 'block';
                break;
            default:
                dpad.style.display = 'none';
                actionBtn.style.display = 'none';
                memoryTouch.style.display = 'none';
        }
    }
    
    switch(gameName) {
        case 'snake':
            title.textContent = '🐍 Snake';
            instructions.textContent = isMobile ? 'Use D-Pad to move. Eat food!' : 'Use arrow keys to move. Eat food to grow!';
            initSnake();
            break;
        case 'tetris':
            title.textContent = '🧱 Tetris';
            instructions.textContent = isMobile ? 'D-Pad: Left/Right/Down, Up to rotate' : 'Arrow keys to move, Up to rotate';
            initTetris();
            break;
        case 'pong':
            title.textContent = '🏓 Pong';
            instructions.textContent = isMobile ? 'Touch paddle to move' : 'Mouse or arrow keys to move paddle';
            initPong();
            break;
        case 'breakout':
            title.textContent = '🧱 Breakout';
            instructions.textContent = isMobile ? 'Touch to move paddle' : 'Mouse or arrow keys to move paddle';
            initBreakout();
            break;
        case 'dino':
            title.textContent = '🦕 Chrome Dino';
            instructions.textContent = isMobile ? 'Tap JUMP button or tap screen' : 'Space or Up arrow to jump';
            initDino();
            break;
        case 'memory':
            title.textContent = '🃏 Memory Match';
            instructions.textContent = 'Tap cards to flip them';
            initMemory();
            break;
    }
    
    // Setup mobile controls
    if (isMobile) {
        setupMobileControls(gameName);
    }
}

function closeGame() {
    // Stop any active game loops
    if (gameLoop) {
        if (currentGame === 'tetris') {
            clearTimeout(gameLoop);
        } else {
            cancelAnimationFrame(gameLoop);
        }
        gameLoop = null;
    }
    
    // Remove all event listeners
    document.removeEventListener('keydown', handleSnakeInput);
    document.removeEventListener('keydown', handleTetrisInput);
    
    // Remove canvas event listeners by cloning
    const newCanvas = canvas.cloneNode(true);
    canvas.parentNode.replaceChild(newCanvas, canvas);
    canvas = newCanvas;
    ctx = canvas.getContext('2d');
    
    // Hide modal
    document.getElementById('gameModal').style.display = 'none';
    currentGame = null;
}

function resetGame() {
    if (currentGame) {
        // Store the current game name before closing
        const gameToRestart = currentGame;
        closeGame();
        // Small delay to ensure cleanup completes
        setTimeout(() => openGame(gameToRestart), 100);
    }
}

// ==================== SNAKE GAME ====================
let snake, food, direction, score;

function initSnake() {
    // Reset game state
    snake = [{x: 10, y: 10}];
    food = {x: 15, y: 15};
    direction = {x: 1, y: 0};
    score = 0;
    
    // Clear previous loop if any
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
        gameLoop = null;
    }
    
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
    
    // Prevent default scrolling
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
        e.preventDefault();
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
    pongBall = {x: canvas.width/2, y: canvas.height/2, dx: 4, dy: 4, radius: 8};
    pongPaddle = {y: canvas.height/2 - 40, height: 80, width: 10};
    pongAI = {y: canvas.height/2 - 40, height: 80, width: 10};
    pongScore = {player: 0, ai: 0};
    
    // Clear previous loop if any
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
        gameLoop = null;
    }
    
    // Mouse control
    canvas.addEventListener('mousemove', (e) => {
        if (currentGame !== 'pong') return;
        const rect = canvas.getBoundingClientRect();
        pongPaddle.y = e.clientY - rect.top - pongPaddle.height / 2;
    });
    
    // Touch control for mobile
    canvas.addEventListener('touchmove', (e) => {
        if (currentGame !== 'pong') return;
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        pongPaddle.y = touch.clientY - rect.top - pongPaddle.height / 2;
    }, {passive: false});
    
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
    breakoutBall = {x: canvas.width/2, y: canvas.height/2, dx: 3, dy: -3, radius: 6};
    breakoutPaddle = {x: canvas.width/2 - 50, y: canvas.height - 30, width: 100, height: 10};
    breakoutScore = 0;
    
    // Create bricks - responsive to canvas size
    const brickCols = Math.floor(canvas.width / 60);
    const brickWidth = (canvas.width - (brickCols + 1) * 5) / brickCols;
    breakoutBricks = [];
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < brickCols; col++) {
            breakoutBricks.push({
                x: col * (brickWidth + 5) + 5,
                y: row * 25 + 30,
                width: brickWidth,
                height: 20,
                color: `hsl(${row * 60}, 100%, 50%)`,
                alive: true
            });
        }
    }
    
    // Clear previous loop if any
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
        gameLoop = null;
    }
    
    // Mouse control
    canvas.addEventListener('mousemove', (e) => {
        if (currentGame !== 'breakout') return;
        const rect = canvas.getBoundingClientRect();
        breakoutPaddle.x = e.clientX - rect.left - breakoutPaddle.width / 2;
    });
    
    // Touch control for mobile
    canvas.addEventListener('touchmove', (e) => {
        if (currentGame !== 'breakout') return;
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        breakoutPaddle.x = touch.clientX - rect.left - breakoutPaddle.width / 2;
    }, {passive: false});
    
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
    
    // Responsive canvas for mobile
    const cols = 4;
    const rows = 4;
    const cardSize = Math.min(80, (canvas.width - 50) / cols);
    const padding = 10;
    
    canvas.width = cols * (cardSize + padding) + padding;
    canvas.height = rows * (cardSize + padding) + padding + 40;
    
    // Clear previous event listeners by cloning
    const newCanvas = canvas.cloneNode(true);
    canvas.parentNode.replaceChild(newCanvas, canvas);
    canvas = newCanvas;
    ctx = canvas.getContext('2d');
    
    canvas.addEventListener('click', handleMemoryClick);
    
    // Touch support
    canvas.addEventListener('touchstart', handleMemoryTouch, {passive: false});
    
    drawMemory();
}

function handleMemoryClick(e) {
    if (!memoryCanFlip || currentGame !== 'memory') return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    processMemoryFlip(x, y);
}

function handleMemoryTouch(e) {
    if (!memoryCanFlip || currentGame !== 'memory') return;
    e.preventDefault();
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    processMemoryFlip(x, y);
}

function processMemoryFlip(x, y) {
    const cols = 4;
    const cardSize = Math.min(80, (canvas.width - 50) / cols);
    const padding = 10;
    
    const col = Math.floor((x - padding) / (cardSize + padding));
    const row = Math.floor((y - padding) / (cardSize + padding));
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
    const cols = 4;
    const cardSize = Math.min(80, (canvas.width - 50) / cols);
    const padding = 10;
    
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < 16; i++) {
        const row = Math.floor(i / 4);
        const col = i % 4;
        const x = col * (cardSize + padding) + padding;
        const y = row * (cardSize + padding) + padding;
        
        if (memoryCards[i] === null) {
            ctx.fillStyle = '#27ae60';
            ctx.fillRect(x, y, cardSize, cardSize);
        } else if (memoryFlipped.includes(i)) {
            ctx.fillStyle = '#ecf0f1';
            ctx.fillRect(x, y, cardSize, cardSize);
            ctx.fillStyle = '#2c3e50';
            ctx.font = `${cardSize * 0.6}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(memoryCards[i], x + cardSize/2, y + cardSize/2);
        } else {
            ctx.fillStyle = '#3498db';
            ctx.fillRect(x, y, cardSize, cardSize);
            ctx.fillStyle = '#2980b9';
            ctx.fillRect(x + 5, y + 5, cardSize - 10, cardSize - 10);
        }
    }
    
    // Draw score
    ctx.fillStyle = '#ecf0f1';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Matched: ${memoryMatched/2}/8`, 10, canvas.height - 10);
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
    
    // Clear previous loop if any
    if (gameLoop) {
        clearTimeout(gameLoop);
        gameLoop = null;
    }
    
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
    
    // Prevent default scrolling
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
        e.preventDefault();
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
    dino = {x: 50, y: canvas.height - 50, width: 30, height: 40, jumpVelocity: 0};
    dinoObstacles = [];
    dinoScore = 0;
    dinoJumping = false;
    dinoGravity = 0.8;
    groundY = canvas.height - 10;
    
    // Clear previous loop if any
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
        gameLoop = null;
    }
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (currentGame !== 'dino') return;
        if ((e.code === 'Space' || e.code === 'ArrowUp') && !dinoJumping) {
            dinoJumping = true;
            dino.jumpVelocity = -15;
            e.preventDefault();
        }
    });
    
    // Touch controls for mobile
    canvas.addEventListener('touchstart', (e) => {
        if (currentGame !== 'dino') return;
        e.preventDefault();
        if (!dinoJumping) {
            dinoJumping = true;
            dino.jumpVelocity = -15;
        }
    }, {passive: false});
    
    dinoLoop();
}

function dinoLoop() {
    if (currentGame !== 'dino') return;
    
    // Update dino
    if (dinoJumping) {
        dino.y += dino.jumpVelocity;
        dino.jumpVelocity += dinoGravity;
        
        if (dino.y >= groundY - dino.height) {
            dino.y = groundY - dino.height;
            dinoJumping = false;
            dino.jumpVelocity = 0;
        }
    }
    
    // Spawn obstacles
    if (Math.random() < 0.02) {
        dinoObstacles.push({
            x: canvas.width,
            y: groundY - 30 - Math.random() * 30,
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
    ctx.fillRect(0, groundY, canvas.width, 10);
    
    // Draw dino
    ctx.fillStyle = '#535353';
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
    
    // Draw obstacles
    for (let obs of dinoObstacles) {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    }
    
    // Draw score
    ctx.fillStyle = '#535353';
    ctx.font = '20px Courier';
    ctx.fillText('Score: ' + Math.floor(dinoScore), 10, 30);
    
    gameLoop = requestAnimationFrame(dinoLoop);
}

// ==================== GAME OVER ====================
function gameOver(message) {
    // Stop game loop but keep currentGame active for restart
    if (gameLoop) {
        if (currentGame === 'tetris') {
            clearTimeout(gameLoop);
        } else {
            cancelAnimationFrame(gameLoop);
        }
        gameLoop = null;
    }
    
    // Draw game over screen
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#fff';
    ctx.font = '24px Courier';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2 - 20);
    
    ctx.font = '16px Courier';
    ctx.fillText('Tap Restart button below', canvas.width / 2, canvas.height / 2 + 20);
    
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
}

// Mobile control handlers
function setupMobileControls(gameName) {
    // D-Pad buttons
    const btnUp = document.getElementById('btnUp');
    const btnDown = document.getElementById('btnDown');
    const btnLeft = document.getElementById('btnLeft');
    const btnRight = document.getElementById('btnRight');
    const btnAction = document.getElementById('btnAction');
    
    // Remove old listeners
    const newBtnUp = btnUp.cloneNode(true);
    const newBtnDown = btnDown.cloneNode(true);
    const newBtnLeft = btnLeft.cloneNode(true);
    const newBtnRight = btnRight.cloneNode(true);
    const newBtnAction = btnAction.cloneNode(true);
    
    btnUp.parentNode.replaceChild(newBtnUp, btnUp);
    btnDown.parentNode.replaceChild(newBtnDown, btnDown);
    btnLeft.parentNode.replaceChild(newBtnLeft, btnLeft);
    btnRight.parentNode.replaceChild(newBtnRight, btnRight);
    btnAction.parentNode.replaceChild(newBtnAction, btnAction);
    
    // Add touch handlers
    if (gameName === 'snake') {
        newBtnUp.addEventListener('touchstart', (e) => { e.preventDefault(); if (direction.y === 0) direction = {x: 0, y: -1}; });
        newBtnDown.addEventListener('touchstart', (e) => { e.preventDefault(); if (direction.y === 0) direction = {x: 0, y: 1}; });
        newBtnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); if (direction.x === 0) direction = {x: -1, y: 0}; });
        newBtnRight.addEventListener('touchstart', (e) => { e.preventDefault(); if (direction.x === 0) direction = {x: 1, y: 0}; });
    } else if (gameName === 'tetris') {
        newBtnUp.addEventListener('touchstart', (e) => { e.preventDefault(); rotateTetris(); });
        newBtnDown.addEventListener('touchstart', (e) => { e.preventDefault(); moveTetris(0, 1); });
        newBtnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); moveTetris(-1, 0); });
        newBtnRight.addEventListener('touchstart', (e) => { e.preventDefault(); moveTetris(1, 0); });
        
        // Hold down for repeated movement
        let moveInterval;
        newBtnDown.addEventListener('touchstart', (e) => { 
            e.preventDefault(); 
            moveInterval = setInterval(() => moveTetris(0, 1), 100); 
        });
        newBtnDown.addEventListener('touchend', () => clearInterval(moveInterval));
    } else if (gameName === 'dino') {
        newBtnAction.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!dinoJumping) {
                dinoJumping = true;
                dino.jumpVelocity = -15;
            }
        });
        
        // Also allow tap on canvas to jump
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!dinoJumping) {
                dinoJumping = true;
                dino.jumpVelocity = -15;
            }
        });
    }
}

// Global keyboard event listener
document.addEventListener('keydown', (e) => {
    if (!currentGame) return;
    
    switch(currentGame) {
        case 'snake':
            handleSnakeInput(e);
            break;
        case 'tetris':
            handleTetrisInput(e);
            break;
        case 'dino':
            if ((e.code === 'Space' || e.code === 'ArrowUp') && !dinoJumping) {
                dinoJumping = true;
                dino.jumpVelocity = -15;
                e.preventDefault();
            }
            break;
    }
});

// Prevent context menu on long press
document.addEventListener('contextmenu', function(event) {
    if (event.target.tagName === 'CANVAS' || event.target.tagName === 'BUTTON') {
        event.preventDefault();
    }
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('gameModal');
    if (event.target === modal) {
        closeGame();
    }
}
