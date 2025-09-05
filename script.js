const rulesBtn = document.getElementById('rules-btn');
const closeBtn = document.getElementById('close-btn');
const rules = document.getElementById('rules');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let score = 0;

// Default game size
const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;
const brickRowCount = 9;
const brickColumnCount = 5;
const delay = 500;

// Paddle
const paddle = { w: 80, h: 10, speed: 8, dx: 0, x: 0, y: 0, visible: true };

// Ball
const ball = { size: 10, speed: 4, dx: 4, dy: -4, x: 0, y: 0, visible: true };

// Bricks
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

// Resize canvas for mobile and initialize positions
function resizeCanvas() {
  if (window.innerWidth <= 768) {
    canvas.width = window.innerWidth * 0.95;
    canvas.height = canvas.width * (DEFAULT_HEIGHT / DEFAULT_WIDTH);
    ball.speed = 5; // slightly faster on mobile
  } else {
    canvas.width = DEFAULT_WIDTH;
    canvas.height = DEFAULT_HEIGHT;
    ball.speed = 4;
  }

  resetPositions();
}

// Reset positions
function resetPositions() {
  paddle.x = canvas.width / 2 - paddle.w / 2;
  paddle.y = canvas.height - 20;
  targetPaddleX = paddle.x;

  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.dx = ball.speed;
  ball.dy = -ball.speed;
}

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
  ctx.fillText(`Score: ${score}`, canvas.width-100, 30);
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

// Move paddle smoothly
function movePaddle() {
  paddle.x += (targetPaddleX - paddle.x) * 0.2;
  paddle.x += paddle.dx;

  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.w > canvas.width) paddle.x = canvas.width - paddle.w;
}

// Ball movement
function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0) ball.dx *= -1;
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

  if (ball.y + ball.size > canvas.height) {
    showAllBricks();
    score = 0;
    resetPositions();
  }
}

// Draw everything
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
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
  if (targetPaddleX < 0) targetPaddleX = 0;
  if (targetPaddleX + paddle.w > canvas.width) targetPaddleX = canvas.width - paddle.w;
});

// Touch
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touchX = e.touches[0].clientX - rect.left;
  targetPaddleX = touchX - paddle.w/2;
  if (targetPaddleX < 0) targetPaddleX = 0;
  if (targetPaddleX + paddle.w > canvas.width) targetPaddleX = canvas.width - paddle.w;
}, { passive: false });

// Rules popup
rulesBtn.addEventListener('click', () => rules.classList.add('show'));
closeBtn.addEventListener('click', () => rules.classList.remove('show'));

// Initial resize
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
