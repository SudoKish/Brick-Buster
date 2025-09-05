const rulesBtn = document.getElementById('rules-btn');
const closeBtn = document.getElementById('close-btn');
const rules = document.getElementById('rules');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let score = 0;

const brickRowCount = 9;
const brickColumnCount = 5;
const delay = 500; // delay to reset game

// Paddle
const paddle = {
  w: 80,
  h: 10,
  speed: 8,
  dx: 0,
  visible: true,
  x: 0,
  y: 0
};

// Ball
const ball = {
  size: 10,
  speed: 4,
  dx: 4,
  dy: -4,
  visible: true,
  x: 0,
  y: 0
};

// Target paddle X (for touch smooth movement)
let targetPaddleX = 0;

// Brick
const brickInfo = {
  w: 70,
  h: 20,
  padding: 10,
  offsetX: 45,
  offsetY: 60,
  visible: true
};

// Create bricks
const bricks = [];
for (let i = 0; i < brickRowCount; i++) {
  bricks[i] = [];
  for (let j = 0; j < brickColumnCount; j++) {
    const x = i * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX;
    const y = j * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY;
    bricks[i][j] = { x, y, ...brickInfo };
  }
}

// Responsive canvas
function resizeCanvas() {
  const aspectRatio = 4 / 3; // width/height
  canvas.width = window.innerWidth * 0.95; // 95% width
  canvas.height = canvas.width / aspectRatio;

  // Adjust paddle and ball positions proportionally
  paddle.x = canvas.width / 2 - paddle.w / 2;
  paddle.y = canvas.height - 20;
  targetPaddleX = paddle.x;

  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;

  // Adjust ball speed for smaller screens
  if (window.innerWidth <= 768) {
    ball.speed = 6;
    ball.dx = 6;
    ball.dy = -6;
  } else {
    ball.speed = 4;
    ball.dx = 4;
    ball.dy = -4;
  }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // initial call

// Draw functions
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
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, canvas.width - 100, 30);
}

function drawBricks() {
  bricks.forEach(column => {
    column.forEach(brick => {
      ctx.beginPath();
      ctx.rect(brick.x, brick.y, brick.w, brick.h);
      ctx.fillStyle = brick.visible ? '#0095dd' : 'transparent';
      ctx.fill();
      ctx.closePath();
    });
  });
}

// Show all bricks
function showAllBricks() {
  bricks.forEach(column => {
    column.forEach(brick => (brick.visible = true));
  });
}

// Paddle movement (smooth + keyboard)
function movePaddle() {
  // Smooth touch movement
  paddle.x += (targetPaddleX - paddle.x) * 0.2; // 0.2 = smoothness factor

  // Keyboard movement
  paddle.x += paddle.dx;

  // Wall boundaries
  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.w > canvas.width) paddle.x = canvas.width - paddle.w;
}

// Ball movement
function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall collision
  if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0) ball.dx *= -1;
  if (ball.y - ball.size < 0) ball.dy *= -1;

  // Paddle collision with angle
  if (
    ball.x + ball.size > paddle.x &&
    ball.x - ball.size < paddle.x + paddle.w &&
    ball.y + ball.size > paddle.y &&
    ball.y - ball.size < paddle.y + paddle.h
  ) {
    const collidePoint = ball.x - (paddle.x + paddle.w / 2);
    const normalizedPoint = collidePoint / (paddle.w / 2);
    const angle = normalizedPoint * Math.PI / 3;
    ball.dx = ball.speed * Math.sin(angle);
    ball.dy = -ball.speed * Math.cos(angle);
  }

  // Brick collision
  bricks.forEach(column => {
    column.forEach(brick => {
      if (brick.visible) {
        if (
          ball.x + ball.size > brick.x &&
          ball.x - ball.size < brick.x + brick.w &&
          ball.y + ball.size > brick.y &&
          ball.y - ball.size < brick.y + brick.h
        ) {
          // Bounce
          ball.dy *= -1;
          brick.visible = false;
          increaseScore();
        }
      }
    });
  });

  // Bottom hit - reset
  if (ball.y + ball.size > canvas.height) {
    showAllBricks();
    score = 0;

    paddle.x = canvas.width / 2 - paddle.w / 2;
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = ball.speed;
    ball.dy = -ball.speed;
  }
}

// Increase score
function increaseScore() {
  score++;
  if (score % (brickRowCount * brickColumnCount) === 0) {
    ball.visible = false;
    paddle.visible = false;

    setTimeout(() => {
      showAllBricks();
      score = 0;
      paddle.x = canvas.width / 2 - paddle.w / 2;
      paddle.y = canvas.height - 20;
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
      ball.visible = true;
      paddle.visible = true;
    }, delay);
  }
}

// Draw everything
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBall();
  drawPaddle();
  drawScore();
  drawBricks();
}

// Update loop
function update() {
  movePaddle();
  moveBall();
  draw();
  requestAnimationFrame(update);
}

update();

// Keyboard controls
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') paddle.dx = paddle.speed;
  else if (e.key === 'ArrowLeft') paddle.dx = -paddle.speed;
});

document.addEventListener('keyup', (e) => {
  if (['ArrowRight','ArrowLeft'].includes(e.key)) paddle.dx = 0;
});

// Mouse controls (desktop)
document.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  targetPaddleX = mouseX - paddle.w / 2;
});

// Touch controls (mobile)
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touchX = e.touches[0].clientX - rect.left;
  targetPaddleX = touchX - paddle.w / 2;
}, { passive: false });

// Rules popup
rulesBtn.addEventListener('click', () => rules.classList.add('show'));
closeBtn.addEventListener('click', () => rules.classList.remove('show'));
