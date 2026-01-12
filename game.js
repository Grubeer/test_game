const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const hudLives = document.getElementById("hud-lives");
const hudScore = document.getElementById("hud-score");
const hudLevel = document.getElementById("hud-level");
const hudTime = document.getElementById("hud-time");

const startOverlay = document.getElementById("startOverlay");
const levelOverlay = document.getElementById("levelOverlay");
const endOverlay = document.getElementById("endOverlay");
const levelStats = document.getElementById("levelStats");
const endTitle = document.getElementById("endTitle");
const endStats = document.getElementById("endStats");
const startButton = document.getElementById("startButton");
const nextLevelButton = document.getElementById("nextLevel");
const restartButton = document.getElementById("restart");

const keys = new Set();
let lastFrame = performance.now();

const palette = {
  sky: "#050816",
  stars: "#dbe7ff",
  nebula: "#3b2d64",
  player: "#7df9ff",
  playerAccent: "#2bffae",
  enemy: "#ff5b5b",
  enemyAccent: "#ffa14b",
  bullet: "#ffe66d",
  enemyBullet: "#ffb3ff",
  ui: "#7df9ff",
};

const playerSkins = [
  {
    name: "Scout",
    color: "#7df9ff",
    accent: "#2bffae",
    speed: 150,
    fireRate: 3,
    lives: 3,
  },
  {
    name: "Falcon",
    color: "#7fffb6",
    accent: "#ffd166",
    speed: 165,
    fireRate: 3.6,
    lives: 3,
  },
  {
    name: "Raptor",
    color: "#5ecbff",
    accent: "#ff6b6b",
    speed: 180,
    fireRate: 4.1,
    lives: 3.5,
  },
  {
    name: "Viper",
    color: "#b88bff",
    accent: "#2bffae",
    speed: 195,
    fireRate: 4.8,
    lives: 4,
  },
  {
    name: "Phantom",
    color: "#ff7bd6",
    accent: "#ffe66d",
    speed: 210,
    fireRate: 5.4,
    lives: 4.5,
  },
  {
    name: "Nova",
    color: "#fff1a8",
    accent: "#7df9ff",
    speed: 225,
    fireRate: 6,
    lives: 5,
  },
];

const levels = Array.from({ length: 6 }, (_, index) => {
  const level = index + 1;
  return {
    level,
    duration: 28 + level * 4,
    enemySpeed: 40 + level * 8,
    enemyRate: Math.max(0.7, 2.2 - level * 0.2),
    enemyBulletRate: Math.max(1.2, 2.6 - level * 0.2),
  };
});

const state = {
  phase: "start",
  levelIndex: 0,
  levelTimer: 0,
  levelHold: 0,
  time: 0,
  score: 0,
  player: null,
  bullets: [],
  enemies: [],
  enemyBullets: [],
  starfield: [],
  shakes: 0,
  lastEnemy: 0,
  lastEnemyShot: 0,
  lastShot: 0,
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const rand = (min, max) => Math.random() * (max - min) + min;

function initStarfield() {
  state.starfield = Array.from({ length: 120 }, () => ({
    x: rand(0, canvas.width),
    y: rand(0, canvas.height),
    size: Math.floor(rand(1, 3)),
    speed: rand(20, 60),
    twinkle: rand(0.2, 1),
  }));
}

function resetPlayer() {
  const skin = playerSkins[state.levelIndex] || playerSkins[playerSkins.length - 1];
  state.player = {
    x: canvas.width / 2,
    y: canvas.height * 0.78,
    width: 26,
    height: 40,
    speed: skin.speed,
    fireRate: skin.fireRate,
    lives: skin.lives,
    maxLives: skin.lives,
    skin,
    wobble: 0,
  };
}

function resetLevel() {
  state.levelTimer = 0;
  state.levelHold = 0;
  state.bullets = [];
  state.enemies = [];
  state.enemyBullets = [];
  state.lastEnemy = 0;
  state.lastEnemyShot = 0;
  state.lastShot = 0;
  resetPlayer();
}

function startGame() {
  state.phase = "play";
  state.score = 0;
  state.levelIndex = 0;
  state.time = 0;
  startOverlay.classList.add("hidden");
  levelOverlay.classList.add("hidden");
  endOverlay.classList.add("hidden");
  resetLevel();
}

function nextLevel() {
  state.phase = "play";
  levelOverlay.classList.add("hidden");
  if (state.levelIndex < levels.length - 1) {
    state.levelIndex += 1;
    resetLevel();
  }
}

function endGame(win) {
  state.phase = "end";
  endOverlay.classList.remove("hidden");
  endTitle.textContent = win ? "YOU WIN" : "GAME OVER";
  endStats.textContent = `SCORE: ${state.score} · TIME: ${state.time.toFixed(1)}s`;
}

function spawnEnemy() {
  const width = 26;
  const height = 30;
  state.enemies.push({
    x: rand(30, canvas.width - 30),
    y: -40,
    width,
    height,
    speed: levels[state.levelIndex].enemySpeed,
    wobble: rand(-1, 1),
    lives: 2 + state.levelIndex,
  });
}

function spawnPlayerBullet() {
  state.bullets.push({
    x: state.player.x,
    y: state.player.y - 18,
    width: 4,
    height: 10,
    speed: 280,
  });
}

function spawnEnemyBullet(enemy) {
  state.enemyBullets.push({
    x: enemy.x,
    y: enemy.y + 18,
    width: 5,
    height: 12,
    speed: 160 + state.levelIndex * 15,
  });
}

function updatePlayer(dt, now) {
  let direction = 0;
  if (keys.has("ArrowLeft") || keys.has("a")) direction -= 1;
  if (keys.has("ArrowRight") || keys.has("d")) direction += 1;

  state.player.wobble += dt * 4;
  const wobbleOffset = Math.sin(state.player.wobble) * 3;
  state.player.x = clamp(
    state.player.x + direction * state.player.speed * dt,
    30,
    canvas.width - 30
  );
  state.player.y = canvas.height * 0.78 + wobbleOffset;

  if (keys.has(" ")) {
    const delay = 1000 / state.player.fireRate;
    if (now - state.lastShot > delay) {
      state.lastShot = now;
      spawnPlayerBullet();
    }
  }
}

function updateBullets(dt) {
  state.bullets = state.bullets.filter((bullet) => {
    bullet.y -= bullet.speed * dt;
    return bullet.y > -20;
  });

  state.enemyBullets = state.enemyBullets.filter((bullet) => {
    bullet.y += bullet.speed * dt;
    return bullet.y < canvas.height + 20;
  });
}

function updateEnemies(dt, now) {
  const level = levels[state.levelIndex];
  if (now - state.lastEnemy > level.enemyRate * 1000) {
    state.lastEnemy = now;
    spawnEnemy();
  }

  state.enemies.forEach((enemy) => {
    enemy.y += enemy.speed * dt;
    enemy.x += Math.sin(enemy.y * 0.02) * enemy.wobble;
  });

  if (now - state.lastEnemyShot > level.enemyBulletRate * 1000) {
    state.lastEnemyShot = now;
    const shooter = state.enemies[Math.floor(rand(0, state.enemies.length))];
    if (shooter) spawnEnemyBullet(shooter);
  }

  state.enemies = state.enemies.filter((enemy) => enemy.y < canvas.height + 60);
}

function updateStarfield(dt) {
  state.starfield.forEach((star) => {
    star.y += star.speed * dt;
    if (star.y > canvas.height) {
      star.y = -10;
      star.x = rand(0, canvas.width);
    }
  });
}

function intersects(a, b) {
  return (
    a.x - a.width / 2 < b.x + b.width / 2 &&
    a.x + a.width / 2 > b.x - b.width / 2 &&
    a.y - a.height / 2 < b.y + b.height / 2 &&
    a.y + a.height / 2 > b.y - b.height / 2
  );
}

function handleCollisions() {
  state.bullets.forEach((bullet) => {
    state.enemies.forEach((enemy) => {
      if (enemy.lives <= 0) return;
      if (intersects({ x: bullet.x, y: bullet.y, width: bullet.width, height: bullet.height }, enemy)) {
        enemy.lives -= 1;
        bullet.y = -999;
        if (enemy.lives <= 0) {
          state.score += 150 + state.levelIndex * 40;
          state.shakes = 6;
        }
      }
    });
  });

  state.bullets = state.bullets.filter((bullet) => bullet.y > -100);
  state.enemies = state.enemies.filter((enemy) => enemy.lives > 0);

  state.enemyBullets.forEach((bullet) => {
    if (intersects({ x: bullet.x, y: bullet.y, width: bullet.width, height: bullet.height }, state.player)) {
      bullet.y = canvas.height + 100;
      state.player.lives = Math.max(0, state.player.lives - 1);
      state.shakes = 10;
    }
  });

  state.enemies.forEach((enemy) => {
    if (intersects(enemy, state.player)) {
      enemy.y = canvas.height + 100;
      state.player.lives = Math.max(0, state.player.lives - 1);
      state.shakes = 12;
    }
  });
}

function updateLevel(dt) {
  state.levelTimer += dt;
  state.time += dt;
  const level = levels[state.levelIndex];
  if (state.levelTimer >= level.duration) {
    state.phase = "levelComplete";
    state.levelHold = 0;
    levelOverlay.classList.remove("hidden");
    levelStats.textContent = `LEVEL ${level.level} COMPLETE · SCORE: ${state.score}`;
  }
}

function drawPixelText(text, x, y, size, color, align = "center") {
  ctx.fillStyle = color;
  ctx.font = `${size}px "Press Start 2P", monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}

function drawStarfield() {
  ctx.fillStyle = palette.sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = palette.nebula;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = palette.stars;
  state.starfield.forEach((star) => {
    ctx.globalAlpha = star.twinkle;
    ctx.fillRect(star.x, star.y, star.size, star.size);
  });
  ctx.globalAlpha = 1;
}

function drawPlayer() {
  const { x, y, width, height, skin } = state.player;
  ctx.fillStyle = skin.color;
  ctx.fillRect(x - width / 2, y - height / 2, width, height);
  ctx.fillStyle = skin.accent;
  ctx.fillRect(x - width / 2 + 4, y - height / 2 + 6, width - 8, 6);
  ctx.fillRect(x - 6, y - height / 2 - 6, 12, 6);
  ctx.fillRect(x - width / 2 - 6, y - 4, 6, 12);
  ctx.fillRect(x + width / 2, y - 4, 6, 12);
  ctx.fillStyle = "#09111f";
  ctx.fillRect(x - 5, y - height / 2 + 12, 10, 6);
}

function drawEnemy(enemy) {
  ctx.fillStyle = palette.enemy;
  ctx.fillRect(enemy.x - enemy.width / 2, enemy.y - enemy.height / 2, enemy.width, enemy.height);
  ctx.fillStyle = palette.enemyAccent;
  ctx.fillRect(enemy.x - enemy.width / 2 + 4, enemy.y - enemy.height / 2 + 6, enemy.width - 8, 6);
  ctx.fillRect(enemy.x - 4, enemy.y + enemy.height / 2 - 6, 8, 6);
}

function drawBullets() {
  ctx.fillStyle = palette.bullet;
  state.bullets.forEach((bullet) => {
    ctx.fillRect(bullet.x - bullet.width / 2, bullet.y - bullet.height / 2, bullet.width, bullet.height);
  });

  ctx.fillStyle = palette.enemyBullet;
  state.enemyBullets.forEach((bullet) => {
    ctx.fillRect(bullet.x - bullet.width / 2, bullet.y - bullet.height / 2, bullet.width, bullet.height);
  });
}

function drawHUD() {
  const livesSegments = Math.ceil(state.player.lives * 2);
  hudLives.textContent = `HP: ${"█".repeat(livesSegments)}${"░".repeat(Math.max(0, 10 - livesSegments))}`;
  hudScore.textContent = `SCORE: ${state.score}`;
  hudLevel.textContent = `LEVEL: ${levels[state.levelIndex].level}/${levels.length}`;
  hudTime.textContent = `TIME: ${state.time.toFixed(1)}s`;
}

function drawScreen() {
  if (state.shakes > 0) {
    ctx.save();
    ctx.translate(rand(-2, 2), rand(-2, 2));
    state.shakes -= 1;
  }

  drawStarfield();
  drawBullets();
  state.enemies.forEach(drawEnemy);
  drawPlayer();

  if (state.shakes > 0) {
    ctx.restore();
  }
}

function gameLoop(now) {
  const dt = Math.min((now - lastFrame) / 1000, 0.05);
  lastFrame = now;

  if (state.phase === "play") {
    updateStarfield(dt);
    updatePlayer(dt, now);
    updateBullets(dt);
    updateEnemies(dt, now);
    handleCollisions();
    updateLevel(dt);

    if (state.player.lives <= 0) {
      endGame(false);
    }
  }

  if (state.phase === "levelComplete") {
    updateStarfield(dt);
    state.levelHold += dt;
  }

  if (state.phase === "end") {
    updateStarfield(dt);
  }

  drawScreen();
  if (state.phase !== "start") {
    drawHUD();
  }

  if (state.phase === "levelComplete") {
    const level = levels[state.levelIndex];
    if (state.levelIndex >= levels.length - 1) {
      endGame(true);
    } else if (state.levelHold >= 2) {
      nextLevel();
    }
  }

  requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (event) => {
  keys.add(event.key);
  if (event.key.toLowerCase() === "p" && state.phase === "play") {
    state.phase = "pause";
  } else if (event.key.toLowerCase() === "p" && state.phase === "pause") {
    state.phase = "play";
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key);
});

startButton.addEventListener("click", startGame);
nextLevelButton.addEventListener("click", nextLevel);
restartButton.addEventListener("click", startGame);

initStarfield();
resetPlayer();
requestAnimationFrame(gameLoop);
