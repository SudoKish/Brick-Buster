const rulesBtn = document.getElementById('rules-btn');
const closeBtn = document.getElementById('close-btn');
const rules = document.getElementById('rules');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let score = 0;
let level = 1;
let maxLevel = 5;
let delay = 1000;

// Default game size
const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;

// Brick colors
const brickColors = ['#0095dd', '#ff6347', '#32cd32', '#ffa500', '#9932cc'];

// Paddle & Ball
const paddle = { w: 80, h: 10, speed: 8, dx: 0, x: 0, y: 0, visible: true };
const ball = { size: 10, speed: 4, dx: 4, dy: -4, x: 0, y: 0, visible: true };

// Bricks
let bricks = [];
let brickInfo = { w: 70, h: 20, padding: 10, offsetX: 45, offsetY: 60, visible: true };

// Paddle target for smooth touch
let targetPaddleX = 0;

// --- Functions ---

function resizeCanvas() {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  if (screenWidth < DEFAULT_WIDTH) {
    canvas.width = screenWidth * 0.95;
    canvas.height = canvas.width * (DEFAULT_HEIGHT / DEFAULT_WIDTH);
  } else {
    canvas.width = DEFAULT_WIDTH;
    canvas.height = DEFAULT_HEIGHT;
  }

  // Scale game elements proportionally
  const scaleX = canvas.width / DEFAULT_WIDTH;
  const scaleY = canvas.height / DEFAULT_HEIGHT;

  paddle.h = 10 * scaleY;
  paddle.speed = 8 * scaleX;
  paddle.y = canvas.height - 20 * scaleY;
  paddle.x = canvas.width / 2 - paddle.w / 2;
  targetPaddleX = paddle.x;

  ball.size = 10 * ((scaleX + scaleY) / 2);
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;

  brickInfo.w = 70 * scaleX;
  brickInfo.h = 20 * scaleY;
  brickInfo.padding = 10 * scaleX;
  brickInfo.offsetX = 45 * scaleX;
  brickInfo.offsetY = 60 * scaleY;

  createBricks();
}

function setupLevel() {
  // Increase bricks per level
  brickRowCount = 4 + level;
  brickColumnCount = 3 + Math.floor(level / 2);

  // Increase ball speed per level
  ball.speed = 4 + level;
  ball.dx = ball.speed;
  ball.dy = -ball.speed;

  // Shrink paddle slightly per level
  const minPaddleWidth = 50;
  paddle.w = Math.max(80 - (level - 1) * 10, minPaddleWidth);
  paddle.x = canvas.width / 2 - paddle.w / 2;
  targetPaddleX = paddle.x;

  resizeCanvas();
}

function createBricks() {
  bricks = [];
  const color = brickColors[(level - 1) % brickColors.length];

  for (let i = 0; i < brickRowCount; i++) {
    bricks[i] = [];
    for (let j = 0; j < brickColumnCount; j++) {
      const x = i * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX;
      const y = j * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY;
      const offsetYPattern = (level % 2 === 0 && j % 2 === 1) ? brickInfo.h / 2 : 0;
      bricks[i][j] = { x, y: y + offsetYPattern, ...brickInfo, color, visible: true };
    }
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
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
  ctx.font = `${20 * (canvas.width / DEFAULT_WIDTH)}px Arial`;
  ctx.fillText(`Score: ${score}`, canvas.width - 100, 30);
  ctx.fillText(`Level: ${level}`, 20, 30);
  ctx.fillText(`Paddle: ${Math.round(paddle.w)}px`, 20, 60);
}

function drawBricks() {
  bricks.forEach(col => col.forEach(brick => {
    ctx.beginPath();
    ctx.rect(brick.x, brick.y, brick.w, brick.h);
    ctx.fillStyle = brick.visible ? brick.color : 'transparent';
    ctx.fill();
    ctx.closePath();
  }));
}

function showAllBricks() {
  bricks.forEach(col => col.forEach(brick => brick.visible = true));
}

function movePaddle() {
  paddle.x += (targetPaddleX - paddle.x) * 0.2;
  paddle.x += paddle.dx;

  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.w > canvas.width) paddle.x = canvas.width - paddle.w;
}

function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0) ball.dx *= -1;
  if (ball.y - ball.size < 0) ball.dy *= -1;

  // Paddle collision
  if (ball.x + ball.size > paddle.x &&
      ball.x - ball.size < paddle.x + paddle.w &&
      ball.y + ball.size > paddle.y &&
      ball.y - ball.size < paddle.y + paddle.h) {
    const collidePoint = ball.x - (paddle.x + paddle.w / 2);
    const normalized = collidePoint / (paddle.w / 2);
    const angle = normalized * Math.PI / 3;
    ball.dx = ball.speed * Math.sin(angle);
    ball.dy = -ball.speed * Math.cos(angle);
  }

  // Brick collision
  let allBricksCleared = true;
  bricks.forEach(col => col.forEach(brick => {
    if (brick.visible &&
        ball.x + ball.size > brick.x &&
        ball.x - ball.size < brick.x + brick.w &&
        ball.y + ball.size > brick.y &&
        ball.y - ball.size < brick.y + brick.h) {
      ball.dy *= -1;
      brick.visible = false;
      score++;
    }
    if (brick.visible) allBricksCleared = false;
  }));

  if (allBricksCleared) {
    ball.visible = false;
    paddle.visible = false;
    setTimeout(() => {
      if (level < maxLevel) {
        level++;
        score = 0;
        setupLevel();
        ball.visible = true;
        paddle.visible = true;
      } else {
        alert('Congratulations! You completed all levels!');
        level = 1;
        score = 0;
        setupLevel();
        ball.visible = true;
        paddle.visible = true;
      }
    }, delay);
  }

  if (ball.y + ball.size > canvas.height) {
    alert('Game Over! Restarting Level.');
    score = 0;
    setupLevel();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBall();
  drawPaddle();
  drawScore();
  drawBricks();
}

function update() {
  movePaddle();
  moveBall();
  draw();
  requestAnimationFrame(update);
}
update();

// Keyboard controls
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') paddle.dx = paddle.speed;
  if (e.key === 'ArrowLeft') paddle.dx = -paddle.speed;
});
document.addEventListener('keyup', e => {
  if (['ArrowRight', 'ArrowLeft'].includes(e.key)) paddle.dx = 0;
});

// Mouse controls
document.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  targetPaddleX = mouseX - paddle.w / 2;
  if (targetPaddleX < 0) targetPaddleX = 0;
  if (targetPaddleX + paddle.w > canvas.width) targetPaddleX = canvas.width - paddle.w;
});

// Touch controls
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touchX = e.touches[0].clientX - rect.left;
  targetPaddleX = touchX - paddle.w / 2;
  if (targetPaddleX < 0) targetPaddleX = 0;
  if (targetPaddleX + paddle.w > canvas.width) targetPaddleX = canvas.width - paddle.w;
}, { passive: false });

// Rules popup
rulesBtn.addEventListener('click', () => rules.classList.add('show'));
closeBtn.addEventListener('click', () => rules.classList.remove('show'));

// Initial setup
setupLevel();
window.addEventListener('resize', resizeCanvas);
