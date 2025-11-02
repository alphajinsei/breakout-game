// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameState = 'ready'; // ready, playing, paused, win, lose
let score = 0;
let lives = 3;

// Paddle
const paddle = {
    width: 100,
    height: 15,
    x: canvas.width / 2 - 50,
    y: canvas.height - 30,
    speed: 8,
    dx: 0
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    speed: 4,
    dx: 4,
    dy: -4
};

// Bricks
const brickInfo = {
    rows: 5,
    cols: 9,
    width: 75,
    height: 20,
    padding: 10,
    offsetX: 45,
    offsetY: 60,
    visible: true
};

// Create bricks array
const bricks = [];
for (let row = 0; row < brickInfo.rows; row++) {
    bricks[row] = [];
    for (let col = 0; col < brickInfo.cols; col++) {
        bricks[row][col] = {
            x: col * (brickInfo.width + brickInfo.padding) + brickInfo.offsetX,
            y: row * (brickInfo.height + brickInfo.padding) + brickInfo.offsetY,
            width: brickInfo.width,
            height: brickInfo.height,
            visible: true,
            color: getRowColor(row)
        };
    }
}

// Get brick color based on row
function getRowColor(row) {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
    return colors[row % colors.length];
}

// Draw paddle
function drawPaddle() {
    ctx.fillStyle = '#fff';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

    // Add gradient effect
    const gradient = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + paddle.height);
    gradient.addColorStop(0, '#fff');
    gradient.addColorStop(1, '#ddd');
    ctx.fillStyle = gradient;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// Draw ball
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.closePath();

    // Add glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#fff';
    ctx.fill();
    ctx.shadowBlur = 0;
}

// Draw bricks
function drawBricks() {
    bricks.forEach(row => {
        row.forEach(brick => {
            if (brick.visible) {
                ctx.fillStyle = brick.color;
                ctx.fillRect(brick.x, brick.y, brick.width, brick.height);

                // Add border
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 2;
                ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
            }
        });
    });
}

// Move paddle
function movePaddle() {
    paddle.x += paddle.dx;

    // Wall collision detection
    if (paddle.x < 0) {
        paddle.x = 0;
    }
    if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
    }
}

// Move ball
function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision (left and right)
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx *= -1;
    }

    // Wall collision (top)
    if (ball.y - ball.radius < 0) {
        ball.dy *= -1;
    }

    // Paddle collision
    if (
        ball.y + ball.radius > paddle.y &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width
    ) {
        // Calculate hit position on paddle (-1 to 1)
        const hitPos = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);

        // Change ball direction based on hit position
        ball.dx = hitPos * ball.speed;
        ball.dy = -Math.abs(ball.dy);

        // Increase speed slightly
        const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        if (currentSpeed < 8) {
            ball.dx *= 1.05;
            ball.dy *= 1.05;
        }
    }

    // Bottom wall (lose life)
    if (ball.y + ball.radius > canvas.height) {
        lives--;
        updateLives();

        if (lives === 0) {
            gameState = 'lose';
            showGameMessage('ゲームオーバー！', 'lose');
        } else {
            resetBall();
        }
    }
}

// Brick collision detection
function brickCollision() {
    bricks.forEach(row => {
        row.forEach(brick => {
            if (brick.visible) {
                if (
                    ball.x + ball.radius > brick.x &&
                    ball.x - ball.radius < brick.x + brick.width &&
                    ball.y + ball.radius > brick.y &&
                    ball.y - ball.radius < brick.y + brick.height
                ) {
                    ball.dy *= -1;
                    brick.visible = false;
                    score += 10;
                    updateScore();

                    // Check win condition
                    if (score === brickInfo.rows * brickInfo.cols * 10) {
                        gameState = 'win';
                        showGameMessage('おめでとう！クリア！', 'win');
                    }
                }
            }
        });
    });
}

// Reset ball position
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = -4;
    gameState = 'ready';
}

// Update score display
function updateScore() {
    document.getElementById('score').textContent = score;
}

// Update lives display
function updateLives() {
    document.getElementById('lives').textContent = lives;
}

// Show game message
function showGameMessage(message, type) {
    const messageEl = document.getElementById('gameMessage');
    const restartBtn = document.getElementById('restartBtn');

    messageEl.textContent = message;
    messageEl.className = `game-message ${type}`;
    restartBtn.classList.remove('hidden');
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBricks();
    drawPaddle();
    drawBall();
}

// Update game logic
function update() {
    if (gameState === 'playing') {
        movePaddle();
        moveBall();
        brickCollision();
    }

    draw();
    requestAnimationFrame(update);
}

// Keyboard controls
function keyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right') {
        paddle.dx = paddle.speed;
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        paddle.dx = -paddle.speed;
    } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (gameState === 'ready') {
            gameState = 'playing';
        } else if (gameState === 'playing') {
            gameState = 'paused';
        } else if (gameState === 'paused') {
            gameState = 'playing';
        }
    }
}

function keyUp(e) {
    if (
        e.key === 'ArrowRight' || e.key === 'Right' ||
        e.key === 'ArrowLeft' || e.key === 'Left'
    ) {
        paddle.dx = 0;
    }
}

// Mouse controls
function mouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    paddle.x = mouseX - paddle.width / 2;

    // Keep paddle in bounds
    if (paddle.x < 0) {
        paddle.x = 0;
    }
    if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
    }
}

// Restart game
function restartGame() {
    // Reset game state
    gameState = 'ready';
    score = 0;
    lives = 3;

    // Reset paddle
    paddle.x = canvas.width / 2 - paddle.width / 2;
    paddle.dx = 0;

    // Reset ball
    resetBall();

    // Reset bricks
    bricks.forEach(row => {
        row.forEach(brick => {
            brick.visible = true;
        });
    });

    // Update display
    updateScore();
    updateLives();

    // Hide message and button
    document.getElementById('gameMessage').classList.add('hidden');
    document.getElementById('restartBtn').classList.add('hidden');
}

// Event listeners
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);
canvas.addEventListener('mousemove', mouseMove);
document.getElementById('restartBtn').addEventListener('click', restartGame);

// Start game loop
update();
