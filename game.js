const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const hudHearts = document.getElementById("hearts");
const hudWeapon = document.getElementById("weapon");
const hudCoins = document.getElementById("coins");
const hudTime = document.getElementById("time");
const hudLevel = document.getElementById("level");
const gameOverOverlay = document.getElementById("gameOver");
const finalStats = document.getElementById("finalStats");
const restartButton = document.getElementById("restart");

const keys = new Set();
let lastFrame = performance.now();

const levelConfigs = [
  {
    level: 1,
    enemyHealth: 2,
    enemySpeed: 60,
    spawnInterval: 2.8,
    pickupInterval: 6.5,
    weaponPool: ["rapid"],
  },
  {
    level: 2,
    enemyHealth: 3,
    enemySpeed: 80,
    spawnInterval: 2.3,
    pickupInterval: 6,
    weaponPool: ["rapid", "burst"],
  },
  {
    level: 3,
    enemyHealth: 4,
    enemySpeed: 100,
    spawnInterval: 1.9,
    pickupInterval: 5.5,
    weaponPool: ["rapid", "burst", "spread"],
  },
  {
    level: 4,
    enemyHealth: 5,
    enemySpeed: 115,
    spawnInterval: 1.6,
    pickupInterval: 5,
    weaponPool: ["burst", "spread", "pierce"],
  },
  {
    level: 5,
    enemyHealth: 6,
    enemySpeed: 130,
    spawnInterval: 1.3,
    pickupInterval: 4.6,
    weaponPool: ["burst", "spread", "pierce", "laser"],
  },
];

const weapons = {
  basic: {
    name: "Стандарт",
    fireRate: 3,
    bulletSpeed: 320,
    damage: 1,
    spread: 0,
    bulletsPerShot: 1,
    pierce: 0,
  },
  rapid: {
    name: "Шквальный",
    fireRate: 6,
    bulletSpeed: 340,
    damage: 1,
    spread: 0.08,
    bulletsPerShot: 1,
    pierce: 0,
  },
  burst: {
    name: "Турбо",
    fireRate: 4.2,
    bulletSpeed: 360,
    damage: 1.3,
    spread: 0.1,
    bulletsPerShot: 2,
    pierce: 0,
  },
  spread: {
    name: "Картечь",
    fireRate: 3.4,
    bulletSpeed: 330,
    damage: 1.1,
    spread: 0.35,
    bulletsPerShot: 4,
    pierce: 0,
  },
  pierce: {
    name: "Пробой",
    fireRate: 3.1,
    bulletSpeed: 380,
    damage: 1.6,
    spread: 0.12,
    bulletsPerShot: 1,
    pierce: 1,
  },
  laser: {
    name: "Фотон",
    fireRate: 2.6,
    bulletSpeed: 440,
    damage: 2.2,
    spread: 0.04,
    bulletsPerShot: 1,
    pierce: 2,
  },
};

const state = {
  player: null,
  bullets: [],
  enemies: [],
  pickups: [],
  coins: 0,
  maxTime: Number(localStorage.getItem("maxTime")) || 0,
  startTime: 0,
  lastShot: 0,
  lastSpawn: 0,
  lastPickup: 0,
  level: 1,
  config: levelConfigs[0],
  isGameOver: false,
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const rand = (min, max) => Math.random() * (max - min) + min;
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function resetGame() {
  resize();
  state.player = {
    x: canvas.width * 0.5,
    y: canvas.height * 0.7,
    radius: 18,
    speed: 230,
    direction: -Math.PI / 2,
    lives: 3,
    invuln: 0,
    weapon: "basic",
  };
  state.bullets = [];
  state.enemies = [];
  state.pickups = [];
  state.coins = 0;
  state.startTime = performance.now();
  state.lastShot = 0;
  state.lastSpawn = 0;
  state.lastPickup = 0;
  state.level = 1;
  state.config = levelConfigs[0];
  state.isGameOver = false;
  gameOverOverlay.classList.add("hidden");
}

function currentTime() {
  return (performance.now() - state.startTime) / 1000;
}

function updateLevel() {
  const time = currentTime();
  const newLevel = Math.min(5, Math.floor(time / 30) + 1);
  if (newLevel !== state.level) {
    state.level = newLevel;
    state.config = levelConfigs[newLevel - 1];
  }
}

function spawnEnemy() {
  const edge = Math.floor(rand(0, 4));
  const padding = 30;
  let x = 0;
  let y = 0;
  if (edge === 0) {
    x = rand(0, canvas.width);
    y = -padding;
  } else if (edge === 1) {
    x = canvas.width + padding;
    y = rand(0, canvas.height);
  } else if (edge === 2) {
    x = rand(0, canvas.width);
    y = canvas.height + padding;
  } else {
    x = -padding;
    y = rand(0, canvas.height);
  }
  state.enemies.push({
    x,
    y,
    radius: rand(16, 24),
    speed: state.config.enemySpeed + rand(-10, 10),
    health: state.config.enemyHealth,
  });
}

function spawnPickup() {
  const pool = state.config.weaponPool;
  const weapon = pool[Math.floor(rand(0, pool.length))];
  state.pickups.push({
    x: rand(40, canvas.width - 40),
    y: rand(60, canvas.height * 0.6),
    radius: 14,
    weapon,
    ttl: 12,
  });
}

function shoot(now) {
  const weapon = weapons[state.player.weapon];
  const fireDelay = 1000 / weapon.fireRate;
  if (now - state.lastShot < fireDelay) return;
  state.lastShot = now;
  for (let i = 0; i < weapon.bulletsPerShot; i += 1) {
    const spread = weapon.spread * (weapon.bulletsPerShot === 1 ? 0 : (i - (weapon.bulletsPerShot - 1) / 2));
    const angle = state.player.direction + spread;
    state.bullets.push({
      x: state.player.x,
      y: state.player.y,
      radius: 4,
      speed: weapon.bulletSpeed,
      angle,
      damage: weapon.damage,
      pierce: weapon.pierce,
    });
  }
}

function updatePlayer(dt, now) {
  let dx = 0;
  let dy = 0;
  if (keys.has("ArrowUp") || keys.has("w")) dy -= 1;
  if (keys.has("ArrowDown") || keys.has("s")) dy += 1;
  if (keys.has("ArrowLeft") || keys.has("a")) dx -= 1;
  if (keys.has("ArrowRight") || keys.has("d")) dx += 1;
  const length = Math.hypot(dx, dy) || 1;
  dx /= length;
  dy /= length;
  if (dx || dy) {
    state.player.direction = Math.atan2(dy, dx);
  }
  state.player.x = clamp(state.player.x + dx * state.player.speed * dt, 20, canvas.width - 20);
  state.player.y = clamp(state.player.y + dy * state.player.speed * dt, 20, canvas.height - 20);

  if (keys.has(" ")) {
    shoot(now);
  }

  if (state.player.invuln > 0) {
    state.player.invuln -= dt;
  }
}

function updateBullets(dt) {
  state.bullets = state.bullets.filter((bullet) => {
    bullet.x += Math.cos(bullet.angle) * bullet.speed * dt;
    bullet.y += Math.sin(bullet.angle) * bullet.speed * dt;
    return (
      bullet.x > -20 &&
      bullet.x < canvas.width + 20 &&
      bullet.y > -20 &&
      bullet.y < canvas.height + 20
    );
  });
}

function updateEnemies(dt) {
  state.enemies.forEach((enemy) => {
    const angle = Math.atan2(state.player.y - enemy.y, state.player.x - enemy.x);
    enemy.x += Math.cos(angle) * enemy.speed * dt;
    enemy.y += Math.sin(angle) * enemy.speed * dt;
  });
}

function updatePickups(dt) {
  state.pickups = state.pickups.filter((pickup) => {
    pickup.ttl -= dt;
    return pickup.ttl > 0;
  });
}

function handleCollisions() {
  state.bullets.forEach((bullet) => {
    state.enemies.forEach((enemy) => {
      if (enemy.health <= 0) return;
      if (distance(bullet, enemy) < enemy.radius + bullet.radius) {
        enemy.health -= bullet.damage;
        if (bullet.pierce > 0) {
          bullet.pierce -= 1;
        } else {
          bullet.x = -9999;
        }
      }
    });
  });

  state.bullets = state.bullets.filter((bullet) => bullet.x > -1000);

  state.enemies = state.enemies.filter((enemy) => {
    if (enemy.health <= 0) {
      state.coins += 1;
      return false;
    }
    return true;
  });

  state.enemies.forEach((enemy) => {
    if (distance(enemy, state.player) < enemy.radius + state.player.radius) {
      if (state.player.invuln <= 0) {
        state.player.lives = Math.max(0, state.player.lives - 0.5);
        state.player.invuln = 1.2;
      }
    }
  });

  state.pickups = state.pickups.filter((pickup) => {
    if (distance(pickup, state.player) < pickup.radius + state.player.radius) {
      state.player.weapon = pickup.weapon;
      return false;
    }
    return true;
  });
}

function drawHeart(x, y, size, fillPercent) {
  const half = size / 2;
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, half);
  ctx.bezierCurveTo(0, 0, -half, 0, -half, half / 1.3);
  ctx.bezierCurveTo(-half, size, 0, size * 1.1, 0, size * 1.5);
  ctx.bezierCurveTo(0, size * 1.1, half, size, half, half / 1.3);
  ctx.bezierCurveTo(half, 0, 0, 0, 0, half);
  ctx.closePath();
  ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
  ctx.fill();

  if (fillPercent > 0) {
    ctx.save();
    ctx.clip();
    ctx.fillStyle = "#ff4d5c";
    ctx.fillRect(-half, 0, size * fillPercent, size * 1.6);
    ctx.restore();
  }
  ctx.restore();
}

function drawHUD() {
  hudWeapon.textContent = `Оружие: ${weapons[state.player.weapon].name}`;
  hudCoins.textContent = `Монеты: ${state.coins}`;
  const time = currentTime();
  hudTime.textContent = `Время: ${time.toFixed(1)} c`;
  hudLevel.textContent = `Уровень: ${state.level}/5`;

  const hearts = [];
  for (let i = 0; i < 3; i += 1) {
    const lifeLeft = state.player.lives - i;
    if (lifeLeft >= 1) {
      hearts.push("❤️");
    } else if (lifeLeft === 0.5) {
      hearts.push("💔");
    } else {
      hearts.push("🤍");
    }
  }
  hudHearts.textContent = `Жизни: ${hearts.join(" ")}`;
}

function drawBackground() {
  ctx.fillStyle = "#0b121a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1;
  const grid = 60;
  for (let x = 0; x <= canvas.width; x += grid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += grid) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawPlayer() {
  ctx.save();
  ctx.translate(state.player.x, state.player.y);
  ctx.rotate(state.player.direction);
  ctx.globalAlpha = state.player.invuln > 0 ? 0.6 : 1;
  ctx.fillStyle = "#7fd4ff";
  ctx.beginPath();
  ctx.moveTo(22, 0);
  ctx.lineTo(-16, -12);
  ctx.lineTo(-10, 0);
  ctx.lineTo(-16, 12);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBullets() {
  ctx.fillStyle = "#ffe66d";
  state.bullets.forEach((bullet) => {
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawEnemies() {
  state.enemies.forEach((enemy) => {
    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
    ctx.stroke();
  });
}

function drawPickups() {
  state.pickups.forEach((pickup) => {
    ctx.fillStyle = "#6ef3c5";
    ctx.beginPath();
    ctx.arc(pickup.x, pickup.y, pickup.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(weapons[pickup.weapon].name[0], pickup.x, pickup.y + 1);
  });
}

function drawHeartsCanvas() {
  const baseX = canvas.width - 140;
  const baseY = 20;
  for (let i = 0; i < 3; i += 1) {
    const fill = clamp(state.player.lives - i, 0, 1);
    drawHeart(baseX + i * 32, baseY, 18, fill);
  }
}

function draw() {
  drawBackground();
  drawPickups();
  drawBullets();
  drawEnemies();
  drawPlayer();
  drawHeartsCanvas();
}

function gameLoop(now) {
  const dt = Math.min((now - lastFrame) / 1000, 0.05);
  lastFrame = now;
  if (!state.isGameOver) {
    updateLevel();
    updatePlayer(dt, now);
    updateBullets(dt);
    updateEnemies(dt);
    updatePickups(dt);

    if (now - state.lastSpawn > state.config.spawnInterval * 1000) {
      state.lastSpawn = now;
      spawnEnemy();
    }
    if (now - state.lastPickup > state.config.pickupInterval * 1000) {
      state.lastPickup = now;
      spawnPickup();
    }

    handleCollisions();

    if (state.player.lives <= 0) {
      endGame();
    }
  }

  draw();
  drawHUD();
  requestAnimationFrame(gameLoop);
}

function endGame() {
  state.isGameOver = true;
  const time = currentTime();
  if (time > state.maxTime) {
    state.maxTime = time;
    localStorage.setItem("maxTime", String(time));
  }
  finalStats.textContent = `Время: ${time.toFixed(1)} c · Макс: ${state.maxTime.toFixed(1)} c · Монеты: ${state.coins} · Уровень: ${state.level}/5`;
  gameOverOverlay.classList.remove("hidden");
}

window.addEventListener("resize", resize);
window.addEventListener("keydown", (event) => {
  keys.add(event.key);
  if (event.key.toLowerCase() === "r" && state.isGameOver) {
    resetGame();
  }
});
window.addEventListener("keyup", (event) => {
  keys.delete(event.key);
});
restartButton.addEventListener("click", resetGame);

resetGame();
requestAnimationFrame(gameLoop);
