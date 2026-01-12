const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const hudLives = document.getElementById("hud-lives");
const hudShield = document.getElementById("hud-shield");
const hudScore = document.getElementById("hud-score");
const hudLevel = document.getElementById("hud-level");
const hudWeapon = document.getElementById("hud-weapon");
const levelBanner = document.getElementById("levelBanner");
const startOverlay = document.getElementById("startOverlay");
const endOverlay = document.getElementById("endOverlay");
const endTitle = document.getElementById("endTitle");
const endStats = document.getElementById("endStats");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restart");
const soundToggle = document.getElementById("soundToggle");
const touchArea = document.getElementById("touchArea");
const fireButton = document.getElementById("fireButton");

const keys = new Set();
const touches = new Map();
let lastFrame = performance.now();

const palette = {
  sky: "#050816",
  nebula: "#2b1c44",
  stars: "#e0ecff",
  player: "#7df9ff",
  playerAccent: "#2bffae",
  enemy: "#ff5b5b",
  enemyAccent: "#ffa14b",
  bullet: "#ffe66d",
  enemyBullet: "#ffb3ff",
  shield: "#6ce1ff",
  heal: "#9aff6c",
  power: "#ffd166",
};

const playerSkins = [
  {
    name: "Scout",
    color: "#7df9ff",
    accent: "#2bffae",
    speed: 160,
    fireRate: 3,
    maxHp: 4,
  },
  {
    name: "Falcon",
    color: "#7fffb6",
    accent: "#ffd166",
    speed: 175,
    fireRate: 3.8,
    maxHp: 4,
  },
  {
    name: "Raptor",
    color: "#5ecbff",
    accent: "#ff6b6b",
    speed: 190,
    fireRate: 4.5,
    maxHp: 5,
  },
  {
    name: "Viper",
    color: "#b88bff",
    accent: "#2bffae",
    speed: 205,
    fireRate: 5.2,
    maxHp: 5,
  },
  {
    name: "Phantom",
    color: "#ff7bd6",
    accent: "#ffe66d",
    speed: 220,
    fireRate: 5.8,
    maxHp: 6,
  },
  {
    name: "Nova",
    color: "#fff1a8",
    accent: "#7df9ff",
    speed: 235,
    fireRate: 6.3,
    maxHp: 6,
  },
];

const levels = Array.from({ length: 6 }, (_, index) => {
  const level = index + 1;
  return {
    level,
    duration: 30 + level * 4,
    spawnRate: Math.max(0.7, 2.2 - level * 0.2),
    enemySpeed: 40 + level * 10,
    powerRate: Math.max(4.5, 7 - level * 0.3),
  };
});

const enemyTypes = [
  {
    id: "scout",
    speed: 1.3,
    hp: 1,
    fireDelay: 2.2,
    pattern: "single",
  },
  {
    id: "zigzag",
    speed: 1.1,
    hp: 2,
    fireDelay: 2.6,
    pattern: "single",
    zigzag: true,
  },
  {
    id: "brute",
    speed: 0.8,
    hp: 4,
    fireDelay: 3.4,
    pattern: "burst",
    armored: true,
  },
  {
    id: "sprayer",
    speed: 1,
    hp: 2,
    fireDelay: 3.1,
    pattern: "fan",
  },
  {
    id: "striker",
    speed: 1.4,
    hp: 2,
    fireDelay: 2.2,
    pattern: "double",
  },
];

const weaponLevels = [
  { name: "MK-I", shots: 1, spread: 0, pierce: 0 },
  { name: "MK-II", shots: 2, spread: 0.1, pierce: 0 },
  { name: "MK-III", shots: 3, spread: 0.18, pierce: 1 },
  { name: "MK-IV", shots: 4, spread: 0.28, pierce: 1 },
];

const state = {
  phase: "start",
  levelIndex: 0,
  levelTimer: 0,
  levelBannerTimer: 0,
  time: 0,
  score: 0,
  player: null,
  bullets: [],
  enemies: [],
  enemyBullets: [],
  powerups: [],
  effects: [],
  starfield: [],
  lastEnemy: 0,
  lastEnemyShot: 0,
  lastPower: 0,
  lastShot: 0,
  screenShake: 0,
  showMiss: 0,
  pointerTarget: null,
  fireHeld: false,
  soundOn: localStorage.getItem("soundOn") !== "false",
  audio: null,
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const rand = (min, max) => Math.random() * (max - min) + min;

function initStarfield() {
  state.starfield = Array.from({ length: 140 }, () => ({
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
    y: canvas.height * 0.75,
    width: 30,
    height: 44,
    speed: skin.speed,
    fireRate: skin.fireRate,
    hp: skin.maxHp,
    maxHp: skin.maxHp,
    shield: 0,
    weaponLevel: 0,
    skin,
    wobble: 0,
    invuln: 0,
  };
}

function resetLevel() {
  state.levelTimer = 0;
  state.levelBannerTimer = 2.2;
  state.bullets = [];
  state.enemies = [];
  state.enemyBullets = [];
  state.powerups = [];
  state.effects = [];
  state.lastEnemy = 0;
  state.lastEnemyShot = 0;
  state.lastPower = 0;
  state.lastShot = 0;
  state.showMiss = 0;
  resetPlayer();
  showLevelBanner();
}

function showLevelBanner() {
  levelBanner.textContent = `LEVEL ${levels[state.levelIndex].level}`;
  levelBanner.classList.remove("hidden");
}

function hideLevelBanner() {
  levelBanner.classList.add("hidden");
}

function startGame() {
  state.phase = "play";
  state.score = 0;
  state.levelIndex = 0;
  state.time = 0;
  startOverlay.classList.add("hidden");
  endOverlay.classList.add("hidden");
  resetLevel();
  initAudio();
}

function endGame(win) {
  state.phase = "end";
  endOverlay.classList.remove("hidden");
  endTitle.textContent = win ? "YOU WIN" : "GAME OVER";
  endStats.textContent = `SCORE: ${state.score} · TIME: ${state.time.toFixed(1)}s`;
}

function initAudio() {
  if (state.audio) return;
  state.audio = new AudioContext();
  state.audio.master = state.audio.createGain();
  state.audio.master.gain.value = state.soundOn ? 0.4 : 0;
  state.audio.master.connect(state.audio.destination);
  state.audio.musicGain = state.audio.createGain();
  state.audio.musicGain.gain.value = 0.2;
  state.audio.musicGain.connect(state.audio.master);
  state.audio.sfxGain = state.audio.createGain();
  state.audio.sfxGain.gain.value = 0.5;
  state.audio.sfxGain.connect(state.audio.master);
  startMusic();
}

function setSound(enabled) {
  state.soundOn = enabled;
  localStorage.setItem("soundOn", String(enabled));
  soundToggle.textContent = enabled ? "🔊" : "🔇";
  soundToggle.classList.toggle("muted", !enabled);
  if (state.audio) {
    state.audio.master.gain.value = enabled ? 0.4 : 0;
  }
}

function playTone(freq, duration, type = "square") {
  if (!state.audio || !state.soundOn) return;
  const osc = state.audio.createOscillator();
  const gain = state.audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = 0.2;
  osc.connect(gain);
  gain.connect(state.audio.sfxGain);
  osc.start();
  osc.stop(state.audio.currentTime + duration);
}

function startMusic() {
  if (!state.audio) return;
  const notes = [262, 330, 392, 330, 440, 392, 330, 294];
  let index = 0;
  const loop = () => {
    if (!state.audio) return;
    const osc = state.audio.createOscillator();
    const gain = state.audio.createGain();
    osc.type = "square";
    osc.frequency.value = notes[index % notes.length];
    gain.gain.value = 0.12;
    osc.connect(gain);
    gain.connect(state.audio.musicGain);
    osc.start();
    osc.stop(state.audio.currentTime + 0.18);
    index += 1;
    setTimeout(loop, 220);
  };
  loop();
}

function spawnEnemy() {
  const level = levels[state.levelIndex];
  const typePool = enemyTypes.slice(0, Math.min(enemyTypes.length, 2 + state.levelIndex));
  const type = typePool[Math.floor(rand(0, typePool.length))];
  const width = type.armored ? 34 : 28;
  const height = type.armored ? 38 : 30;
  state.enemies.push({
    type,
    x: rand(30, canvas.width - 30),
    y: -40,
    width,
    height,
    speed: level.enemySpeed * type.speed,
    hp: type.hp + Math.floor(state.levelIndex / 2),
    wiggle: rand(-1, 1),
    telegraph: 0,
  });
}

function spawnPlayerBullet(angleOffset = 0, pierce = 0) {
  const speed = 320 + state.levelIndex * 8;
  state.bullets.push({
    x: state.player.x,
    y: state.player.y - 20,
    width: 4,
    height: 12,
    speed,
    angle: -Math.PI / 2 + angleOffset,
    pierce,
  });
}

function spawnEnemyBullet(enemy, angleOffset = 0, speedBoost = 0) {
  const speed = 170 + state.levelIndex * 12 + speedBoost;
  state.enemyBullets.push({
    x: enemy.x,
    y: enemy.y + 18,
    width: 5,
    height: 12,
    speed,
    angle: Math.PI / 2 + angleOffset,
  });
}

function spawnPowerup(x, y, kind) {
  state.powerups.push({
    x,
    y,
    kind,
    width: 18,
    height: 18,
    speed: 60,
    ttl: 12,
  });
}

function spawnEffect(x, y, text, color) {
  state.effects.push({
    x,
    y,
    text,
    color,
    ttl: 1.2,
    type: "text",
  });
}

function spawnExplosion(x, y, color) {
  for (let i = 0; i < 10; i += 1) {
    state.effects.push({
      x,
      y,
      vx: rand(-40, 40),
      vy: rand(-60, 20),
      ttl: 0.6,
      color,
      size: rand(2, 4),
      type: "spark",
    });
  }
}

function handlePlayerInput(dt, now) {
  let dx = 0;
  let dy = 0;
  if (keys.has("ArrowLeft") || keys.has("a")) dx -= 1;
  if (keys.has("ArrowRight") || keys.has("d")) dx += 1;
  if (keys.has("ArrowUp") || keys.has("w")) dy -= 1;
  if (keys.has("ArrowDown") || keys.has("s")) dy += 1;

  if (state.pointerTarget) {
    const target = state.pointerTarget;
    state.player.x += (target.x - state.player.x) * 0.2;
    state.player.y += (target.y - state.player.y) * 0.2;
  }

  const length = Math.hypot(dx, dy) || 1;
  dx /= length;
  dy /= length;

  state.player.wobble += dt * 4;
  const wobbleOffset = Math.sin(state.player.wobble) * 2;
  state.player.x = clamp(
    state.player.x + dx * state.player.speed * dt,
    30,
    canvas.width - 30
  );
  state.player.y = clamp(
    state.player.y + dy * state.player.speed * dt + wobbleOffset,
    80,
    canvas.height - 40
  );

  const firing = keys.has(" ") || state.fireHeld;
  if (firing) {
    const delay = 1000 / state.player.fireRate;
    if (now - state.lastShot > delay) {
      state.lastShot = now;
      const weapon = weaponLevels[state.player.weaponLevel];
      const spread = weapon.spread;
      if (weapon.shots === 1) {
        spawnPlayerBullet(0, weapon.pierce);
      } else {
        for (let i = 0; i < weapon.shots; i += 1) {
          const offset = (i - (weapon.shots - 1) / 2) * spread;
          spawnPlayerBullet(offset, weapon.pierce);
        }
      }
      playTone(880, 0.08, "square");
    }
  }

  if (state.player.invuln > 0) {
    state.player.invuln -= dt;
  }
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

function updateEnemies(dt, now) {
  const level = levels[state.levelIndex];
  if (now - state.lastEnemy > level.spawnRate * 1000) {
    state.lastEnemy = now;
    spawnEnemy();
  }

  state.enemies.forEach((enemy) => {
    enemy.y += enemy.speed * dt;
    if (enemy.type.zigzag) {
      enemy.x += Math.sin(enemy.y * 0.05) * 2.4;
    } else {
      enemy.x += Math.sin(enemy.y * 0.02) * enemy.wiggle;
    }
    if (enemy.telegraph > 0) {
      enemy.telegraph -= dt;
    }
  });

  if (now - state.lastEnemyShot > 900) {
    state.lastEnemyShot = now;
    const shooters = state.enemies.filter((enemy) => enemy.y > 40 && enemy.y < canvas.height - 80);
    shooters.forEach((enemy) => {
      if (enemy.telegraph > 0) return;
      if (Math.random() < 0.4) {
        enemy.telegraph = 0.35;
      }
    });
  }

  state.enemies.forEach((enemy) => {
    if (enemy.telegraph > 0) return;
    const chance = 0.01 + state.levelIndex * 0.003;
    if (Math.random() < chance) {
      if (enemy.type.pattern === "burst") {
        spawnEnemyBullet(enemy, 0, 40);
        spawnEnemyBullet(enemy, 0.05, 30);
        spawnEnemyBullet(enemy, -0.05, 30);
      } else if (enemy.type.pattern === "fan") {
        spawnEnemyBullet(enemy, -0.18, 20);
        spawnEnemyBullet(enemy, 0, 0);
        spawnEnemyBullet(enemy, 0.18, 20);
      } else if (enemy.type.pattern === "double") {
        spawnEnemyBullet({ ...enemy, x: enemy.x - 6 }, 0, 0);
        spawnEnemyBullet({ ...enemy, x: enemy.x + 6 }, 0, 0);
      } else {
        spawnEnemyBullet(enemy, 0, 0);
      }
      playTone(220, 0.08, "triangle");
    }
  });

  state.enemies = state.enemies.filter((enemy) => {
    if (enemy.y > canvas.height + 40) {
      applyMissPenalty();
      return false;
    }
    return true;
  });
}

function updateBullets(dt) {
  state.bullets = state.bullets.filter((bullet) => {
    bullet.y += Math.sin(bullet.angle) * bullet.speed * dt;
    bullet.x += Math.cos(bullet.angle) * bullet.speed * dt;
    return bullet.y > -40;
  });

  state.enemyBullets = state.enemyBullets.filter((bullet) => {
    bullet.y += Math.sin(bullet.angle) * bullet.speed * dt;
    bullet.x += Math.cos(bullet.angle) * bullet.speed * dt;
    return bullet.y < canvas.height + 40;
  });
}

function updatePowerups(dt) {
  state.powerups = state.powerups.filter((power) => {
    power.y += power.speed * dt;
    power.ttl -= dt;
    return power.ttl > 0 && power.y < canvas.height + 20;
  });
}

function updateEffects(dt) {
  state.effects = state.effects.filter((effect) => {
    effect.ttl -= dt;
    effect.y -= dt * 18;
    return effect.ttl > 0;
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
      if (enemy.hp <= 0) return;
      if (intersects({ x: bullet.x, y: bullet.y, width: bullet.width, height: bullet.height }, enemy)) {
        enemy.hp -= 1;
        spawnEffect(enemy.x, enemy.y, "HIT", "#ffe66d");
        if (bullet.pierce > 0) {
          bullet.pierce -= 1;
        } else {
          bullet.y = -999;
        }
        if (enemy.hp <= 0) {
          state.score += enemy.type.armored ? 220 : 150;
          state.screenShake = 6;
          spawnEffect(enemy.x, enemy.y, "+SCORE", "#9aff6c");
          spawnExplosion(enemy.x, enemy.y, "#ff9b4b");
          if (Math.random() < 0.35) {
            spawnPowerup(enemy.x, enemy.y, randomPowerupKind());
          }
          playTone(120, 0.1, "square");
        }
      }
    });
  });

  state.bullets = state.bullets.filter((bullet) => bullet.y > -200);
  state.enemies = state.enemies.filter((enemy) => enemy.hp > 0);

  if (state.player.invuln <= 0) {
    state.enemyBullets.forEach((bullet) => {
      if (intersects({ x: bullet.x, y: bullet.y, width: bullet.width, height: bullet.height }, state.player)) {
        bullet.y = canvas.height + 200;
        applyDamage(1);
      }
    });

    state.enemies.forEach((enemy) => {
      if (intersects(enemy, state.player)) {
        enemy.y = canvas.height + 100;
        applyDamage(1);
      }
    });
  }

  state.powerups = state.powerups.filter((power) => {
    if (intersects(power, state.player)) {
      collectPowerup(power.kind);
      return false;
    }
    return true;
  });
}

function applyDamage(amount) {
  if (state.player.shield > 0) {
    state.player.shield -= 1;
    spawnEffect(state.player.x, state.player.y - 20, "SHIELD", "#6ce1ff");
  } else {
    state.player.hp = Math.max(0, state.player.hp - amount);
    state.player.invuln = 0.6;
    state.screenShake = 10;
    state.showMiss = 0.7;
    spawnExplosion(state.player.x, state.player.y, "#ff5b5b");
    hudLives.classList.add("flash");
    setTimeout(() => hudLives.classList.remove("flash"), 400);
  }
  playTone(180, 0.12, "triangle");
}

function applyMissPenalty() {
  state.showMiss = 0.8;
  applyDamage(1);
  spawnEffect(canvas.width / 2, canvas.height / 2, "MISS!", "#ff5b5b");
}

function randomPowerupKind() {
  const pool = ["weapon", "shield", "heal", "score", "slow"];
  return pool[Math.floor(rand(0, pool.length))];
}

function collectPowerup(kind) {
  if (kind === "weapon") {
    state.player.weaponLevel = Math.min(weaponLevels.length - 1, state.player.weaponLevel + 1);
    spawnEffect(state.player.x, state.player.y - 20, "POWER UP", "#ffd166");
  } else if (kind === "shield") {
    state.player.shield = Math.min(3, state.player.shield + 1);
    spawnEffect(state.player.x, state.player.y - 20, "SHIELD", "#6ce1ff");
  } else if (kind === "heal") {
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + 1);
    spawnEffect(state.player.x, state.player.y - 20, "+HP", "#9aff6c");
  } else if (kind === "score") {
    state.score += 200;
    spawnEffect(state.player.x, state.player.y - 20, "BONUS", "#ffd166");
  } else if (kind === "slow") {
    state.enemies.forEach((enemy) => {
      enemy.speed *= 0.6;
    });
    spawnEffect(state.player.x, state.player.y - 20, "SLOW", "#b88bff");
  }
  playTone(520, 0.12, "square");
}

function updateLevel(dt) {
  state.levelTimer += dt;
  state.time += dt;
  if (state.levelBannerTimer > 0) {
    state.levelBannerTimer -= dt;
    if (state.levelBannerTimer <= 0) {
      hideLevelBanner();
    }
  }
  const level = levels[state.levelIndex];
  if (state.levelTimer >= level.duration) {
    if (state.levelIndex >= levels.length - 1) {
      endGame(true);
    } else {
      state.levelIndex += 1;
      resetLevel();
    }
  }
}

function drawStarfield() {
  ctx.fillStyle = palette.sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = palette.nebula;
  ctx.globalAlpha = 0.35;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1;

  ctx.fillStyle = palette.stars;
  state.starfield.forEach((star) => {
    ctx.globalAlpha = star.twinkle;
    ctx.fillRect(star.x, star.y, star.size, star.size);
  });
  ctx.globalAlpha = 1;
}

function drawPlayer() {
  const { x, y, width, height, skin, invuln, shield } = state.player;
  if (invuln > 0 && Math.floor(invuln * 10) % 2 === 0) return;

  ctx.fillStyle = skin.color;
  ctx.fillRect(x - width / 2, y - height / 2, width, height);
  ctx.fillStyle = skin.accent;
  ctx.fillRect(x - width / 2 + 4, y - height / 2 + 6, width - 8, 8);
  ctx.fillRect(x - 10, y - height / 2 - 8, 20, 8);
  ctx.fillRect(x - width / 2 - 8, y - 4, 8, 16);
  ctx.fillRect(x + width / 2, y - 4, 8, 16);
  ctx.fillStyle = "#09111f";
  ctx.fillRect(x - 6, y - height / 2 + 16, 12, 8);
  ctx.fillStyle = skin.accent;
  ctx.fillRect(x - width / 2 + 6, y + height / 2 - 6, width - 12, 6);

  if (shield > 0) {
    ctx.strokeStyle = palette.shield;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, width, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawEnemy(enemy) {
  const { x, y, width, height, type, telegraph } = enemy;
  ctx.fillStyle = palette.enemy;
  ctx.fillRect(x - width / 2, y - height / 2, width, height);
  ctx.fillStyle = palette.enemyAccent;
  ctx.fillRect(x - width / 2 + 4, y - height / 2 + 6, width - 8, 6);
  ctx.fillRect(x - 6, y + height / 2 - 6, 12, 6);
  ctx.fillRect(x - width / 2 - 6, y - 2, 6, 10);
  ctx.fillRect(x + width / 2, y - 2, 6, 10);

  if (type.armored) {
    ctx.fillStyle = "#3d2a2a";
    ctx.fillRect(x - 6, y - 6, 12, 12);
  }

  if (telegraph > 0) {
    ctx.strokeStyle = "#ffe66d";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - width / 2 - 2, y - height / 2 - 2, width + 4, height + 4);
  }
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

function drawPowerups() {
  state.powerups.forEach((power) => {
    ctx.fillStyle = power.kind === "weapon" ? palette.power : palette.heal;
    if (power.kind === "shield") ctx.fillStyle = palette.shield;
    if (power.kind === "score") ctx.fillStyle = "#ffd166";
    if (power.kind === "slow") ctx.fillStyle = "#b88bff";
    ctx.fillRect(power.x - power.width / 2, power.y - power.height / 2, power.width, power.height);
    ctx.fillStyle = "#111";
    ctx.fillText(power.kind[0].toUpperCase(), power.x - 4, power.y + 4);
  });
}

function drawEffects() {
  state.effects.forEach((effect) => {
    if (effect.type === "text") {
      ctx.fillStyle = effect.color;
      ctx.globalAlpha = Math.max(effect.ttl, 0);
      ctx.fillText(effect.text, effect.x, effect.y);
    } else {
      ctx.fillStyle = effect.color;
      ctx.globalAlpha = Math.max(effect.ttl, 0);
      ctx.fillRect(effect.x, effect.y, effect.size, effect.size);
      effect.x += effect.vx * 0.016;
      effect.y += effect.vy * 0.016;
    }
  });
  ctx.globalAlpha = 1;
}

function drawHUD() {
  const hpBlocks = "❤".repeat(state.player.hp).padEnd(state.player.maxHp, "░");
  const shieldBlocks = "♦".repeat(state.player.shield).padEnd(3, "·");
  hudLives.textContent = `HP ${hpBlocks}`;
  hudShield.textContent = `SHIELD ${shieldBlocks}`;
  hudScore.textContent = `SCORE ${state.score}`;
  hudLevel.textContent = `LEVEL ${levels[state.levelIndex].level}/${levels.length}`;
  const weapon = weaponLevels[state.player.weaponLevel];
  hudWeapon.textContent = `WEAPON ${weapon.name}`;
}

function drawScreen() {
  if (state.screenShake > 0) {
    ctx.save();
    ctx.translate(rand(-2, 2), rand(-2, 2));
    state.screenShake -= 1;
  }

  ctx.font = '12px "Press Start 2P", monospace';
  drawStarfield();
  drawPowerups();
  drawBullets();
  state.enemies.forEach(drawEnemy);
  drawPlayer();
  drawEffects();

  if (state.showMiss > 0) {
    ctx.fillStyle = "#ff5b5b";
    ctx.fillText("MISS!", canvas.width / 2 - 20, canvas.height / 2);
    state.showMiss -= 0.02;
  }

  if (state.screenShake > 0) {
    ctx.restore();
  }
}

function gameLoop(now) {
  const dt = Math.min((now - lastFrame) / 1000, 0.05);
  lastFrame = now;

  if (state.phase === "play") {
    updateStarfield(dt);
    handlePlayerInput(dt, now);
    updateEnemies(dt, now);
    updateBullets(dt);
    updatePowerups(dt);
    updateEffects(dt);
    handleCollisions();
    updateLevel(dt);

    if (state.player.hp <= 0) {
      endGame(false);
    }

    const level = levels[state.levelIndex];
    if (now - state.lastPower > level.powerRate * 1000) {
      state.lastPower = now;
      spawnPowerup(rand(40, canvas.width - 40), -20, randomPowerupKind());
    }
  }

  drawScreen();
  if (state.phase !== "start") {
    drawHUD();
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

canvas.addEventListener("pointerdown", (event) => {
  canvas.setPointerCapture(event.pointerId);
  touches.set(event.pointerId, { x: event.offsetX, y: event.offsetY });
  state.pointerTarget = { x: event.offsetX, y: event.offsetY };
});

canvas.addEventListener("pointermove", (event) => {
  if (!touches.has(event.pointerId)) return;
  touches.set(event.pointerId, { x: event.offsetX, y: event.offsetY });
  state.pointerTarget = { x: event.offsetX, y: event.offsetY };
});

canvas.addEventListener("pointerup", (event) => {
  touches.delete(event.pointerId);
  if (touches.size === 0) {
    state.pointerTarget = null;
  }
});

function pointerToCanvas(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * canvas.width;
  const y = ((clientY - rect.top) / rect.height) * canvas.height;
  return { x, y };
}

touchArea.addEventListener("pointerdown", (event) => {
  touchArea.setPointerCapture(event.pointerId);
  const target = pointerToCanvas(event.clientX, event.clientY);
  state.pointerTarget = target;
});

touchArea.addEventListener("pointermove", (event) => {
  if (event.pressure === 0) return;
  const target = pointerToCanvas(event.clientX, event.clientY);
  state.pointerTarget = target;
});

touchArea.addEventListener("pointerup", () => {
  state.pointerTarget = null;
});

fireButton.addEventListener("pointerdown", () => {
  state.fireHeld = true;
});

fireButton.addEventListener("pointerup", () => {
  state.fireHeld = false;
});

soundToggle.addEventListener("click", () => {
  setSound(!state.soundOn);
});

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

document.addEventListener("visibilitychange", () => {
  if (document.hidden && state.phase === "play") {
    state.phase = "pause";
  }
});

setSound(state.soundOn);
initStarfield();
resetPlayer();
requestAnimationFrame(gameLoop);
