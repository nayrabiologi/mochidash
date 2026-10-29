const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const gameArea = document.getElementById("gameArea");
const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const message = document.getElementById("message");
const scoreLabel = document.getElementById("score");
const bestLabel = document.getElementById("best");

const height = 170;
const cat = { x: 70, y: 0, velocityY: 0, jumping: false };
let width = 0;
let obstacles = [];
let score = 0;
let best = 0;
let frame = 0;
let running = false;
let lastTime = 0;
let spawnTimer = 0;

try {
  best = Number(localStorage.getItem("meowRunBest")) || 0;
} catch (_) {
  best = 0;
}
bestLabel.textContent = best;

function resizeCanvas() {
  const rect = gameArea.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  width = rect.width;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  cat.y = height - 26;
  draw();
}

function drawCat() {
  ctx.save();
  ctx.translate(cat.x, cat.y);

  const step = cat.jumping ? 0 : Math.sin(frame * 0.45) * 3;
  const fur = "#F3D8B5";
  const ink = "#44363B";

  // Curled tail and little running paws.
  ctx.strokeStyle = fur;
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-13, 5);
  ctx.quadraticCurveTo(-29, 3, -25, -9);
  ctx.stroke();

  ctx.fillStyle = fur;
  ctx.beginPath();
  ctx.ellipse(-11 + step, 17, 7, 4, -0.2, 0, Math.PI * 2);
  ctx.ellipse(11 - step, 17, 7, 4, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Round kitten body.
  ctx.beginPath();
  ctx.ellipse(0, 5, 18, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pointy ears with pink centers.
  ctx.fillStyle = fur;
  ctx.beginPath();
  ctx.moveTo(-17, -20);
  ctx.lineTo(-16, -39);
  ctx.lineTo(-3, -27);
  ctx.closePath();
  ctx.moveTo(3, -27);
  ctx.lineTo(17, -39);
  ctx.lineTo(18, -19);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#E9A9B7";
  ctx.beginPath();
  ctx.moveTo(-14, -25);
  ctx.lineTo(-15, -33);
  ctx.lineTo(-8, -27);
  ctx.closePath();
  ctx.moveTo(8, -27);
  ctx.lineTo(15, -33);
  ctx.lineTo(15, -24);
  ctx.closePath();
  ctx.fill();

  // Big round face.
  ctx.fillStyle = fur;
  ctx.beginPath();
  ctx.arc(0, -17, 20, 0, Math.PI * 2);
  ctx.fill();

  // Eyes and tiny highlights.
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.ellipse(-8, -18, 2.5, 3.5, 0, 0, Math.PI * 2);
  ctx.ellipse(8, -18, 2.5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(-7, -19, 0.9, 0, Math.PI * 2);
  ctx.arc(9, -19, 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Nose, smile, and rosy cheeks.
  ctx.fillStyle = "#E9A9B7";
  ctx.beginPath();
  ctx.arc(0, -11, 2.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#F3C1C7";
  ctx.beginPath();
  ctx.ellipse(-13, -10, 3.5, 2, 0, 0, Math.PI * 2);
  ctx.ellipse(13, -10, 3.5, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -9);
  ctx.quadraticCurveTo(-1, -5, -4, -6);
  ctx.moveTo(0, -9);
  ctx.quadraticCurveTo(1, -5, 4, -6);
  ctx.stroke();

  ctx.restore();
}

function drawObstacle(obstacle) {
  const x = obstacle.x;
  const ground = height - 2;
  ctx.fillStyle = "#89B89B";
  ctx.beginPath();
  ctx.ellipse(x + 12, ground - 10, 9, 12, -0.35, 0, Math.PI * 2);
  ctx.ellipse(x + 22, ground - 8, 8, 10, 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#739F84";
  ctx.fillRect(x + 14, ground - 11, 5, 11);
  ctx.fillStyle = "#E9A9B7";
  ctx.beginPath();
  ctx.arc(x + 17, ground - 20, 3, 0, Math.PI * 2);
  ctx.fill();
}

function draw() {
  if (!width) return;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fffaf6";
  ctx.fillRect(0, 0, width, height);

  for (const obstacle of obstacles) drawObstacle(obstacle);
  drawCat();
}

function startGame() {
  score = 0;
  obstacles = [];
  spawnTimer = 55;
  cat.y = height - 26;
  cat.velocityY = 0;
  cat.jumping = false;
  running = true;
  lastTime = 0;
  scoreLabel.textContent = "0";
  startScreen.classList.add("hidden");
  requestAnimationFrame(gameLoop);
}

function jump() {
  if (!running) return;
  if (!cat.jumping) {
    cat.velocityY = -11;
    cat.jumping = true;
  }
}

function endGame() {
  running = false;
  if (score > best) {
    best = score;
    bestLabel.textContent = best;
    try {
      localStorage.setItem("meowRunBest", String(best));
    } catch (_) {
      // The game still works if browser storage is unavailable.
    }
  }
  message.textContent = "oops, try again?";
  startBtn.textContent = "play again!";
  startScreen.classList.remove("hidden");
}

function gameLoop(time) {
  if (!running) return;
  const delta = lastTime ? Math.min((time - lastTime) / 16.67, 2) : 1;
  lastTime = time;
  frame += delta;
  score += delta * 0.12;
  scoreLabel.textContent = Math.floor(score);

  cat.y += cat.velocityY * delta;
  cat.velocityY += 0.58 * delta;
  if (cat.y >= height - 26) {
    cat.y = height - 26;
    cat.velocityY = 0;
    cat.jumping = false;
  }

  spawnTimer -= delta;
  if (spawnTimer <= 0) {
    obstacles.push({ x: width + 10 });
    spawnTimer = 75 + Math.random() * 45;
  }

  const speed = 4.2 + Math.min(score / 150, 2);
  for (const obstacle of obstacles) obstacle.x -= speed * delta;
  obstacles = obstacles.filter((obstacle) => obstacle.x > -35);

  for (const obstacle of obstacles) {
    const catLeft = cat.x - 15;
    const catRight = cat.x + 18;
    const catBottom = cat.y + 23;
    if (catRight > obstacle.x + 3 && catLeft < obstacle.x + 29 && catBottom > height - 28) {
      draw();
      endGame();
      return;
    }
  }

  draw();
  requestAnimationFrame(gameLoop);
}

startBtn.addEventListener("click", startGame);
gameArea.addEventListener("pointerdown", (event) => {
  if (event.target === startBtn) return;
  if (!running) startGame();
  else jump();
});
window.addEventListener("keydown", (event) => {
  if (event.code !== "Space" && event.code !== "ArrowUp") return;
  event.preventDefault();
  if (!running) startGame();
  else jump();
});
window.addEventListener("resize", resizeCanvas);

resizeCanvas();
