const rulesBtn = document.getElementById('rules-btn');
const closeBtn = document.getElementById('close-btn');
const rules = document.getElementById('rules');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let score = 0;

// Game constants
const V_WIDTH = 800;
const V_HEIGHT = 600;
const brickRowCount = 9;
const brickColumnCount = 5;
const delay = 500;

// Paddle
const paddle = { w: 80, h: 10, speed: 8, dx: 0, x: 0, y: 0, visible: true };

// Ball
const ball = { size: 10, speed: 4, dx: 4, dy: -4, x: 0, y: 0, visible: true };

// Brick
const brickInfo = { w: 70, h: 20, padding: 10, offsetX: 45, offsetY: 60, visible: true };
const bricks = [];
for (let i = 0; i < brickRowCount; i++) {
  bricks[i] = [];
  for (let j = 0; j < brickColumnCount; j++) {
    const x = i * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX;
    const y = j * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY;
    bricks[i][j] = { x, y, ...brickInfo };
  }
}

// Paddle target for smooth touch
let targetPaddleX = 0;

// Initialize positions
function resetPositions() {
  paddle.x = V_WIDTH / 2 - paddle.w / 2;
  paddle.y = V_HEIGHT - 20;
  targetPaddleX = paddle.x;

  ball.x = V_WIDTH / 2;
  ball.y = V_HEIGHT / 2;

  // Mobile speed boost
  if (window.innerWidth <= 768) {
    ball.speed = 5;
  } else {
    ball.speed = 4;
  }
  ball.dx = ball.speed;
  ball.dy = -ball.speed;
}
resetPositions();

// Draw functions
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI*2);
  ctx.fillStyle = ball.visible ? '#0095dd' : 'transparent';
  ctx.fill();
  ctx.closePath();
}
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h);
  ctx.fillStyle = paddle.visible ? '#0095dd' : 'transparent';
  ctx.fill();
  ctx.closePath();
}
function drawScore() {
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, V_WIDTH-100, 30);
}
function drawBricks() {
  bricks.forEach(col => col.forEach(brick => {
    ctx.beginPath();
    ctx.rect(brick.x, brick.y, brick.w, brick.h);
    ctx.fillStyle = brick.visible ? '#0095dd' : 'transparent';
    ctx.fill();
    ctx.closePath();
  }));
}
function showAllBricks() {
  bricks.forEach(col => col.forEach(brick => brick.visible = true));
}

// Move paddle (smooth + keyboard)
function movePaddle() {
  paddle.x += (targetPaddleX - paddle.x) * 0.2; // smooth touch
  paddle.x += paddle.dx; // keyboard

  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.w > V_WIDTH) paddle.x = V_WIDTH - paddle.w;
}

// Ball movement
function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.x + ball.size > V_WIDTH || ball.x - ball.size < 0) ball.dx *= -1;
  if (ball.y - ball.size < 0) ball.dy *= -1;

  // Paddle collision with angle
  if (ball.x + ball.size > paddle.x &&
      ball.x - ball.size < paddle.x + paddle.w &&
      ball.y + ball.size > paddle.y &&
      ball.y - ball.size < paddle.y + paddle.h) {
    const collidePoint = ball.x - (paddle.x + paddle.w/2);
    const normalized = collidePoint / (paddle.w/2);
    const angle = normalized * Math.PI/3;
    ball.dx = ball.speed * Math.sin(angle);
    ball.dy = -ball.speed * Math.cos(angle);
  }

  // Brick collision
  bricks.forEach(col => col.forEach(brick => {
    if (brick.visible &&
        ball.x + ball.size > brick.x &&
        ball.x - ball.size < brick.x + brick.w &&
        ball.y + ball.size > brick.y &&
        ball.y - ball.size < brick.y + brick.h) {
      ball.dy *= -1;
      brick.visible = false;
      score++;
      if (score % (brickRowCount*brickColumnCount) === 0) {
        ball.visible = false;
        paddle.visible = false;
        setTimeout(() => {
          showAllBricks();
          score = 0;
          resetPositions();
          ball.visible = true;
          paddle.visible = true;
        }, delay);
      }
    }
  }));

  // Bottom hit
  if (ball.y + ball.size > V_HEIGHT) {
    showAllBricks();
    score = 0;
    resetPositions();
  }
}

// Draw
function draw() {
  ctx.clearRect(0,0,V_WIDTH,V_HEIGHT);
  drawBall();
  drawPaddle();
  drawScore();
  drawBricks();
}

// Game loop
function update() {
  movePaddle();
  moveBall();
  draw();
  requestAnimationFrame(update);
}
update();

// Keyboard
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') paddle.dx = paddle.speed;
  if (e.key === 'ArrowLeft') paddle.dx = -paddle.speed;
});
document.addEventListener('keyup', e => {
  if (['ArrowRight','ArrowLeft'].includes(e.key)) paddle.dx = 0;
});

// Mouse
document.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  targetPaddleX = mouseX - paddle.w/2;
});

// Touch
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touchX = e.touches[0].clientX - rect.left;
  targetPaddleX = touchX - paddle.w/2;
}, { passive: false });

// Rules popup
rulesBtn.addEventListener('click', () => rules.classList.add('show'));
closeBtn.addEventListener('click', () => rules.classList.remove('show'));
