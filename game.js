const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const hudScore = document.getElementById("hud-score");
const hudLevel = document.getElementById("hud-level");
const hudLives = document.getElementById("hud-lives");
const hudShield = document.getElementById("hud-shield");
const hudWeapon = document.getElementById("hud-weapon");
const levelBanner = document.getElementById("levelBanner");
const startOverlay = document.getElementById("startOverlay");
const pauseOverlay = document.getElementById("pauseOverlay");
const endOverlay = document.getElementById("endOverlay");
const endTitle = document.getElementById("endTitle");
const endStats = document.getElementById("endStats");
const playerNameInput = document.getElementById("playerName");
const saveResultButton = document.getElementById("saveResult");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restart");
const soundToggle = document.getElementById("soundToggle");
const pauseButton = document.getElementById("pauseButton");
const statsToggle = document.getElementById("statsToggle");
const statsPanel = document.getElementById("statsPanel");
const leaderboard = document.getElementById("leaderboard");

const statPlayer = document.getElementById("stat-player");
const statLevel = document.getElementById("stat-level");
const statScore = document.getElementById("stat-score");
const statTime = document.getElementById("stat-time");
const statKills = document.getElementById("stat-kills");
const statMissed = document.getElementById("stat-missed");
const statMissDamage = document.getElementById("stat-miss-damage");
const statDamage = document.getElementById("stat-damage");
const statBoosts = document.getElementById("stat-boosts");
const statBoostWeapon = document.getElementById("stat-boost-weapon");
const statBoostShield = document.getElementById("stat-boost-shield");
const statBoostHeal = document.getElementById("stat-boost-heal");
const statBoostOther = document.getElementById("stat-boost-other");
const statWeaponMax = document.getElementById("stat-weapon-max");
const statCombo = document.getElementById("stat-combo");
const statBestCombo = document.getElementById("stat-best-combo");
const statAccuracy = document.getElementById("stat-accuracy");

const keys = new Set();
const touches = new Map();
let lastFrame = performance.now();
let statsTimer = 0;

const palette = {
  sky: "#04060f",
  nebula: "#1d1b38",
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
  miss: "#ff5b5b",
  vignette: "rgba(255, 60, 60, 0.18)",
};

const playerSkins = [
  {
    name: "Скаут",
    color: "#7df9ff",
    accent: "#2bffae",
    speed: 180,
    fireRate: 2.2,
    maxHp: 4,
  },
  {
    name: "Фалькон",
    color: "#7fffb6",
    accent: "#ffd166",
    speed: 190,
    fireRate: 2.6,
    maxHp: 4,
  },
  {
    name: "Раптор",
    color: "#5ecbff",
    accent: "#ff6b6b",
    speed: 200,
    fireRate: 3,
    maxHp: 5,
  },
  {
    name: "Вайпер",
    color: "#b88bff",
    accent: "#2bffae",
    speed: 210,
    fireRate: 3.4,
    maxHp: 5,
  },
  {
    name: "Фантом",
    color: "#ff7bd6",
    accent: "#ffe66d",
    speed: 225,
    fireRate: 3.8,
    maxHp: 6,
  },
  {
    name: "Нова",
    color: "#fff1a8",
    accent: "#7df9ff",
    speed: 240,
    fireRate: 4.2,
    maxHp: 6,
  },
];

const levels = Array.from({ length: 50 }, (_, index) => {
  const level = index + 1;
  return {
    level,
    duration: 22 + Math.min(20, level * 0.6),
    spawnRate: Math.max(0.8, 2.8 - level * 0.035),
    enemySpeed: 40 + level * 1.6,
    powerRate: Math.max(4.2, 7.8 - level * 0.06),
  };
});

const enemyTypes = [
  {
    id: "легкий",
    speed: 1.2,
    hp: 1,
    fireDelay: 2.6,
    pattern: "single",
  },
  {
    id: "зигзаг",
    speed: 1.1,
    hp: 2,
    fireDelay: 3.2,
    pattern: "single",
    zigzag: true,
  },
  {
    id: "броня",
    speed: 0.8,
    hp: 4,
    fireDelay: 3.6,
    pattern: "burst",
    armored: true,
  },
  {
    id: "веер",
    speed: 1,
    hp: 2,
    fireDelay: 3.2,
    pattern: "fan",
  },
  {
    id: "быстрый",
    speed: 1.4,
    hp: 2,
    fireDelay: 2.4,
    pattern: "double",
  },
];

const weaponLevels = [
  { name: "МК-I", shots: 1, spread: 0, pierce: 0 },
  { name: "МК-II", shots: 2, spread: 0.08, pierce: 0 },
  { name: "МК-III", shots: 3, spread: 0.16, pierce: 1 },
  { name: "МК-IV", shots: 4, spread: 0.24, pierce: 1 },
];

const musicTracks = {
  menu: {
    tempo: 240,
    melody: [392, 330, 349, 392, 440, 392, 349, 330],
    bass: [131, 131, 147, 165, 131, 131, 147, 165],
  },
  early: {
    tempo: 220,
    melody: [330, 392, 440, 392, 330, 294, 330, 392],
    bass: [110, 110, 123, 131, 110, 110, 123, 131],
  },
  mid: {
    tempo: 210,
    melody: [349, 392, 466, 392, 349, 330, 349, 392],
    bass: [123, 123, 139, 147, 123, 123, 139, 147],
  },
  late: {
    tempo: 200,
    melody: [440, 494, 523, 494, 440, 392, 440, 494],
    bass: [147, 147, 165, 175, 147, 147, 165, 175],
  },
};

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
  farStars: [],
  lastEnemy: 0,
  lastPower: 0,
  lastShot: 0,
  screenShake: 0,
  showMiss: 0,
  hitFlash: 0,
  pointerTarget: null,
  soundOn: localStorage.getItem("soundOn") !== "false",
  audio: null,
  musicTimer: null,
  currentTrack: null,
  stats: {
    playerName: "Гость",
    kills: 0,
    missed: 0,
    missDamage: 0,
    damageTaken: 0,
    boosts: 0,
    boostWeapon: 0,
    boostShield: 0,
    boostHeal: 0,
    boostOther: 0,
    weaponMax: 1,
    combo: 0,
    bestCombo: 0,
    shots: 0,
    hits: 0,
  },
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const rand = (min, max) => Math.random() * (max - min) + min;

function initStarfield() {
  state.starfield = Array.from({ length: 90 }, () => ({
    x: rand(0, canvas.width),
    y: rand(0, canvas.height),
    size: Math.floor(rand(1, 3)),
    speed: rand(25, 70),
    twinkle: rand(0.2, 1),
  }));
  state.farStars = Array.from({ length: 70 }, () => ({
    x: rand(0, canvas.width),
    y: rand(0, canvas.height),
    size: 1,
    speed: rand(10, 25),
  }));
}

function resetStats() {
  state.stats = {
    playerName: state.stats.playerName || "Гость",
    kills: 0,
    missed: 0,
    missDamage: 0,
    damageTaken: 0,
    boosts: 0,
    boostWeapon: 0,
    boostShield: 0,
    boostHeal: 0,
    boostOther: 0,
    weaponMax: 1,
    combo: 0,
    bestCombo: 0,
    shots: 0,
    hits: 0,
  };
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
    invuln: 0,
  };
}

function resetLevel() {
  state.levelTimer = 0;
  state.levelBannerTimer = 1.8;
  state.bullets = [];
  state.enemies = [];
  state.enemyBullets = [];
  state.powerups = [];
  state.effects = [];
  state.lastEnemy = 0;
  state.lastPower = 0;
  state.lastShot = 0;
  state.showMiss = 0;
  resetPlayer();
  showLevelBanner();
  playSfx("level");
}

function showLevelBanner() {
  levelBanner.textContent = `УРОВЕНЬ ${levels[state.levelIndex].level}`;
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
  pauseOverlay.classList.add("hidden");
  resetStats();
  resetLevel();
  initAudio();
  switchMusic("early");
}

function endGame(win) {
  state.phase = "end";
  endOverlay.classList.remove("hidden");
  endTitle.textContent = win ? "ПОБЕДА!" : "ИГРА ОКОНЧЕНА";
  endStats.textContent = `ОЧКИ: ${state.score} · ВРЕМЯ: ${state.time.toFixed(1)}с`;
  playSfx(win ? "win" : "lose");
}

function togglePause() {
  if (state.phase !== "play" && state.phase !== "pause") return;
  if (state.phase === "play") {
    state.phase = "pause";
    pauseOverlay.classList.remove("hidden");
  } else {
    state.phase = "play";
    pauseOverlay.classList.add("hidden");
  }
}

function initAudio() {
  if (state.audio) return;
  state.audio = new AudioContext();
  state.audio.master = state.audio.createGain();
  state.audio.master.gain.value = state.soundOn ? 0.4 : 0;
  state.audio.master.connect(state.audio.destination);
  state.audio.musicGain = state.audio.createGain();
  state.audio.musicGain.gain.value = 0.15;
  state.audio.musicGain.connect(state.audio.master);
  state.audio.sfxGain = state.audio.createGain();
  state.audio.sfxGain.gain.value = 0.5;
  state.audio.sfxGain.connect(state.audio.master);
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

function playTone(freq, duration, type = "square", volume = 0.2) {
  if (!state.audio || !state.soundOn) return;
  const osc = state.audio.createOscillator();
  const gain = state.audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  osc.connect(gain);
  gain.connect(state.audio.sfxGain);
  osc.start();
  osc.stop(state.audio.currentTime + duration);
}

function playSfx(type) {
  if (!state.audio || !state.soundOn) return;
  if (type === "shot") {
    playTone(880, 0.05, "square", 0.05);
  } else if (type === "hit") {
    playTone(420, 0.08, "triangle", 0.15);
  } else if (type === "boom") {
    playTone(180, 0.12, "square", 0.2);
  } else if (type === "hurt") {
    playTone(140, 0.14, "triangle", 0.2);
  } else if (type === "shield") {
    playTone(620, 0.12, "square", 0.18);
  } else if (type === "heal") {
    playTone(520, 0.12, "square", 0.18);
  } else if (type === "weapon") {
    playTone(720, 0.12, "square", 0.18);
  } else if (type === "bonus") {
    playTone(660, 0.12, "triangle", 0.18);
  } else if (type === "miss") {
    playTone(90, 0.2, "triangle", 0.2);
  } else if (type === "level") {
    playTone(330, 0.12, "square", 0.16);
    playTone(392, 0.12, "square", 0.16);
  } else if (type === "win") {
    playTone(523, 0.2, "square", 0.2);
    playTone(659, 0.2, "square", 0.2);
  } else if (type === "lose") {
    playTone(196, 0.25, "triangle", 0.2);
    playTone(165, 0.25, "triangle", 0.2);
  }
}

function scheduleMusic(trackKey) {
  const track = musicTracks[trackKey];
  if (!track || !state.audio) return;
  let index = 0;
  const step = () => {
    if (!state.audio || state.currentTrack !== trackKey) return;
    const melody = track.melody[index % track.melody.length];
    const bass = track.bass[index % track.bass.length];
    playMusicTone(melody, 0.16, "square", 0.1);
    if (index % 2 === 0) {
      playMusicTone(bass, 0.18, "triangle", 0.08);
    }
    index += 1;
    state.musicTimer = setTimeout(step, track.tempo);
  };
  step();
}

function playMusicTone(freq, duration, type, volume) {
  if (!state.audio || !state.soundOn) return;
  const osc = state.audio.createOscillator();
  const gain = state.audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  osc.connect(gain);
  gain.connect(state.audio.musicGain);
  osc.start();
  osc.stop(state.audio.currentTime + duration);
}

function switchMusic(trackKey) {
  if (!state.audio || state.currentTrack === trackKey) return;
  if (state.musicTimer) {
    clearTimeout(state.musicTimer);
    state.musicTimer = null;
  }
  const gain = state.audio.musicGain;
  gain.gain.cancelScheduledValues(state.audio.currentTime);
  gain.gain.setValueAtTime(gain.gain.value, state.audio.currentTime);
  gain.gain.linearRampToValueAtTime(0, state.audio.currentTime + 0.3);
  state.currentTrack = trackKey;
  setTimeout(() => {
    gain.gain.linearRampToValueAtTime(0.15, state.audio.currentTime + 0.3);
    scheduleMusic(trackKey);
  }, 320);
}

function spawnEnemy() {
  const level = levels[state.levelIndex];
  let typePool = [enemyTypes[0]];
  if (state.levelIndex >= 1) typePool = typePool.concat(enemyTypes[1]);
  if (state.levelIndex >= 2) typePool = typePool.concat(enemyTypes[4]);
  if (state.levelIndex >= 3) typePool = typePool.concat(enemyTypes[3]);
  if (state.levelIndex >= 4) typePool = typePool.concat(enemyTypes[2]);
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
    fireTimer: rand(type.fireDelay * 0.6, type.fireDelay * 1.4),
    fireQueued: false,
  });
}

function spawnPlayerBullet(angleOffset = 0, pierce = 0) {
  const speed = 320 + state.levelIndex * 6;
  state.bullets.push({
    x: state.player.x,
    y: state.player.y - 20,
    width: 4,
    height: 12,
    speed,
    angle: -Math.PI / 2 + angleOffset,
    pierce,
  });
  state.stats.shots += 1;
}

function spawnEnemyBullet(enemy, angleOffset = 0, speedBoost = 0) {
  const speed = 160 + state.levelIndex * 10 + speedBoost;
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
  if (keys.has("arrowleft") || keys.has("a")) dx -= 1;
  if (keys.has("arrowright") || keys.has("d")) dx += 1;
  if (keys.has("arrowup") || keys.has("w")) dy -= 1;
  if (keys.has("arrowdown") || keys.has("s")) dy += 1;

  if (state.pointerTarget) {
    const target = state.pointerTarget;
    state.player.x += (target.x - state.player.x) * 0.15;
    state.player.y += (target.y - state.player.y) * 0.15;
  }

  const length = Math.hypot(dx, dy) || 1;
  dx /= length;
  dy /= length;

  state.player.x = clamp(
    state.player.x + dx * state.player.speed * dt,
    30,
    canvas.width - 30
  );
  state.player.y = clamp(
    state.player.y + dy * state.player.speed * dt,
    80,
    canvas.height - 30
  );

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
    playSfx("shot");
  }

  if (state.player.invuln > 0) {
    state.player.invuln -= dt;
  }
}

function updateStarfield(dt) {
  state.farStars.forEach((star) => {
    star.y += star.speed * dt;
    if (star.y > canvas.height) {
      star.y = -10;
      star.x = rand(0, canvas.width);
    }
  });
  state.starfield.forEach((star) => {
    star.y += star.speed * dt;
    if (star.y > canvas.height) {
      star.y = -10;
      star.x = rand(0, canvas.width);
    }
  });
}

function updateEnemies(dt) {
  const level = levels[state.levelIndex];
  if (state.time - state.lastEnemy > level.spawnRate) {
    state.lastEnemy = state.time;
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
      if (enemy.telegraph <= 0 && enemy.fireQueued) {
        fireEnemy(enemy);
        enemy.fireQueued = false;
        enemy.fireTimer = enemy.type.fireDelay + rand(0.6, 1.6);
      }
    } else {
      enemy.fireTimer -= dt;
      if (enemy.fireTimer <= 0) {
        enemy.telegraph = 0.3;
        enemy.fireQueued = true;
      }
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

function fireEnemy(enemy) {
  if (enemy.type.pattern === "burst") {
    spawnEnemyBullet(enemy, 0, 20);
    spawnEnemyBullet(enemy, 0.08, 10);
    spawnEnemyBullet(enemy, -0.08, 10);
  } else if (enemy.type.pattern === "fan") {
    spawnEnemyBullet(enemy, -0.2, 10);
    spawnEnemyBullet(enemy, 0, 0);
    spawnEnemyBullet(enemy, 0.2, 10);
  } else if (enemy.type.pattern === "double") {
    spawnEnemyBullet({ ...enemy, x: enemy.x - 6 }, 0, 0);
    spawnEnemyBullet({ ...enemy, x: enemy.x + 6 }, 0, 0);
  } else {
    spawnEnemyBullet(enemy, 0, 0);
  }
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
        spawnEffect(enemy.x, enemy.y, "ПОПАДАНИЕ", "#ffe66d");
        playSfx("hit");
        state.stats.hits += 1;
        if (bullet.pierce > 0) {
          bullet.pierce -= 1;
        } else {
          bullet.y = -999;
        }
        if (enemy.hp <= 0) {
          state.score += enemy.type.armored ? 220 : 150;
          state.stats.kills += 1;
          state.stats.combo += 1;
          state.stats.bestCombo = Math.max(state.stats.bestCombo, state.stats.combo);
          state.screenShake = 6;
          spawnEffect(enemy.x, enemy.y, "+ОЧКИ", "#9aff6c");
          spawnExplosion(enemy.x, enemy.y, "#ff9b4b");
          if (Math.random() < 0.35) {
            spawnPowerup(enemy.x, enemy.y, randomPowerupKind());
          }
          playSfx("boom");
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
    spawnEffect(state.player.x, state.player.y - 20, "ЩИТ", "#6ce1ff");
    playSfx("shield");
  } else {
    state.player.hp = Math.max(0, state.player.hp - amount);
    state.stats.damageTaken += amount;
    state.stats.combo = 0;
    state.player.invuln = 0.8;
    state.screenShake = 8;
    state.hitFlash = 0.25;
    spawnExplosion(state.player.x, state.player.y, "#ff5b5b");
    hudLives.classList.add("flash");
    setTimeout(() => hudLives.classList.remove("flash"), 400);
    playSfx("hurt");
  }
}

function applyMissPenalty() {
  state.showMiss = 0.9;
  state.stats.missed += 1;
  state.stats.missDamage += 1;
  applyDamage(1);
  spawnEffect(canvas.width / 2, canvas.height / 2, "ПРОМАХ!", "#ff5b5b");
  playSfx("miss");
}

function randomPowerupKind() {
  const pool = ["weapon", "shield", "heal", "score", "slow"];
  return pool[Math.floor(rand(0, pool.length))];
}

function collectPowerup(kind) {
  state.stats.boosts += 1;
  if (kind === "weapon") {
    state.player.weaponLevel = Math.min(weaponLevels.length - 1, state.player.weaponLevel + 1);
    state.stats.weaponMax = Math.max(state.stats.weaponMax, state.player.weaponLevel + 1);
    state.stats.boostWeapon += 1;
    spawnEffect(state.player.x, state.player.y - 20, "ОРУЖИЕ +", "#ffd166");
    hudWeapon.classList.add("glow");
    setTimeout(() => hudWeapon.classList.remove("glow"), 600);
    playSfx("weapon");
  } else if (kind === "shield") {
    state.player.shield = Math.min(3, state.player.shield + 1);
    state.stats.boostShield += 1;
    spawnEffect(state.player.x, state.player.y - 20, "ЩИТ +", "#6ce1ff");
    hudShield.classList.add("glow");
    setTimeout(() => hudShield.classList.remove("glow"), 600);
    playSfx("shield");
  } else if (kind === "heal") {
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + 1);
    state.stats.boostHeal += 1;
    spawnEffect(state.player.x, state.player.y - 20, "ЗДОРОВЬЕ +", "#9aff6c");
    hudLives.classList.add("glow");
    setTimeout(() => hudLives.classList.remove("glow"), 600);
    playSfx("heal");
  } else if (kind === "score") {
    state.score += 200;
    state.stats.boostOther += 1;
    spawnEffect(state.player.x, state.player.y - 20, "БОНУС", "#ffd166");
    playSfx("bonus");
  } else if (kind === "slow") {
    state.stats.boostOther += 1;
    state.enemies.forEach((enemy) => {
      enemy.speed *= 0.6;
    });
    spawnEffect(state.player.x, state.player.y - 20, "ЗАМЕДЛ.", "#b88bff");
    playSfx("bonus");
  }
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
      if (state.levelIndex >= 34) {
        switchMusic("late");
      } else if (state.levelIndex >= 17) {
        switchMusic("mid");
      } else {
        switchMusic("early");
      }
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
  state.farStars.forEach((star) => {
    ctx.fillRect(star.x, star.y, star.size, star.size);
  });
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
  ctx.fillRect(x - 12, y - height / 2 - 8, 24, 8);
  ctx.fillRect(x - width / 2 - 10, y - 6, 10, 18);
  ctx.fillRect(x + width / 2, y - 6, 10, 18);
  ctx.fillRect(x - 6, y - height / 2 - 12, 12, 4);
  ctx.fillStyle = "#09111f";
  ctx.fillRect(x - 6, y - height / 2 + 18, 12, 8);
  ctx.fillStyle = skin.accent;
  ctx.fillRect(x - width / 2 + 6, y + height / 2 - 6, width - 12, 6);
  ctx.fillRect(x - width / 2 + 2, y + height / 2, 8, 6);
  ctx.fillRect(x + width / 2 - 10, y + height / 2, 8, 6);

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
  ctx.fillRect(x - width / 2 - 8, y - 4, 8, 12);
  ctx.fillRect(x + width / 2, y - 4, 8, 12);
  ctx.fillRect(x - 4, y - height / 2 - 6, 8, 4);

  if (type.armored) {
    ctx.fillStyle = "#3d2a2a";
    ctx.fillRect(x - 6, y - 6, 12, 12);
    ctx.fillRect(x - width / 2 + 2, y - 2, 6, 10);
    ctx.fillRect(x + width / 2 - 8, y - 2, 6, 10);
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
    const labelMap = {
      weapon: "О",
      shield: "Щ",
      heal: "+",
      score: "★",
      slow: "З",
    };
    ctx.fillStyle = power.kind === "weapon" ? palette.power : palette.heal;
    if (power.kind === "shield") ctx.fillStyle = palette.shield;
    if (power.kind === "score") ctx.fillStyle = "#ffd166";
    if (power.kind === "slow") ctx.fillStyle = "#b88bff";
    ctx.fillRect(power.x - power.width / 2, power.y - power.height / 2, power.width, power.height);
    ctx.fillStyle = "#111";
    ctx.fillText(labelMap[power.kind] || "?", power.x - 4, power.y + 4);
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
  hudLives.textContent = `❤ ЗДОРОВЬЕ ${hpBlocks}`;
  hudShield.textContent = `🛡 ЩИТ ${shieldBlocks}`;
  hudScore.textContent = `★ ОЧКИ ${state.score}`;
  hudLevel.textContent = `🏁 УРОВЕНЬ ${levels[state.levelIndex].level}/${levels.length}`;
  const weapon = weaponLevels[state.player.weaponLevel];
  hudWeapon.textContent = `🔫 ОРУЖИЕ ${weapon.name}`;
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
    ctx.fillStyle = palette.miss;
    ctx.fillText("ПРОМАХ!", canvas.width / 2 - 30, canvas.height / 2);
    state.showMiss -= 0.02;
  }

  if (state.hitFlash > 0) {
    ctx.fillStyle = palette.vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    state.hitFlash -= 0.02;
  }

  if (state.screenShake > 0) {
    ctx.restore();
  }
}

function updateStatsPanel() {
  const accuracy = state.stats.shots === 0 ? 0 : Math.round((state.stats.hits / state.stats.shots) * 100);
  statPlayer.textContent = state.stats.playerName || "Гость";
  statLevel.textContent = String(levels[state.levelIndex].level);
  statScore.textContent = String(state.score);
  statTime.textContent = `${state.time.toFixed(1)}с`;
  statKills.textContent = String(state.stats.kills);
  statMissed.textContent = String(state.stats.missed);
  statMissDamage.textContent = String(state.stats.missDamage);
  statDamage.textContent = String(state.stats.damageTaken);
  statBoosts.textContent = String(state.stats.boosts);
  statBoostWeapon.textContent = String(state.stats.boostWeapon);
  statBoostShield.textContent = String(state.stats.boostShield);
  statBoostHeal.textContent = String(state.stats.boostHeal);
  statBoostOther.textContent = String(state.stats.boostOther);
  statWeaponMax.textContent = String(state.stats.weaponMax);
  statCombo.textContent = String(state.stats.combo);
  statBestCombo.textContent = String(state.stats.bestCombo);
  statAccuracy.textContent = `${accuracy}%`;
}

function loadLeaderboard() {
  const data = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  return Array.isArray(data) ? data : [];
}

function saveLeaderboard(entries) {
  localStorage.setItem("leaderboard", JSON.stringify(entries.slice(0, 10)));
}

function renderLeaderboard() {
  const entries = loadLeaderboard();
  leaderboard.innerHTML = entries
    .map(
      (entry) => `
        <div class="leaderboard-row">
          <span>${entry.name}</span>
          <span>${entry.score} · ${entry.level} ур.</span>
        </div>
        <div class="leaderboard-row">
          <span>${entry.date}</span>
          <span>${entry.time.toFixed(1)}с</span>
        </div>
      `
    )
    .join("");
}

function saveResult() {
  const name = playerNameInput.value.trim() || "Гость";
  state.stats.playerName = name;
  const entries = loadLeaderboard();
  const newEntry = {
    name,
    score: state.score,
    level: levels[state.levelIndex].level,
    time: state.time,
    date: new Date().toLocaleString("ru-RU"),
  };
  entries.push(newEntry);
  entries.sort((a, b) => b.score - a.score);
  saveLeaderboard(entries);
  renderLeaderboard();
  updateStatsPanel();
}

function gameLoop(now) {
  const dt = Math.min((now - lastFrame) / 1000, 0.05);
  lastFrame = now;

  if (state.phase === "play") {
    updateStarfield(dt);
    handlePlayerInput(dt, now);
    updateEnemies(dt);
    updateBullets(dt);
    updatePowerups(dt);
    updateEffects(dt);
    handleCollisions();
    updateLevel(dt);

    if (state.player.hp <= 0) {
      endGame(false);
    }

    const level = levels[state.levelIndex];
    if (state.time - state.lastPower > level.powerRate) {
      state.lastPower = state.time;
      spawnPowerup(rand(40, canvas.width - 40), -20, randomPowerupKind());
    }
  }

  drawScreen();
  if (state.phase !== "start") {
    drawHUD();
  }

  statsTimer += dt;
  if (statsTimer >= 0.3) {
    updateStatsPanel();
    statsTimer = 0;
  }

  requestAnimationFrame(gameLoop);
}

function pointerToCanvas(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * canvas.width;
  const y = ((clientY - rect.top) / rect.height) * canvas.height;
  return { x, y };
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  keys.add(key);
  if (key === "p" || event.key === "Escape") {
    togglePause();
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

canvas.addEventListener("pointerdown", (event) => {
  canvas.setPointerCapture(event.pointerId);
  touches.set(event.pointerId, { x: event.offsetX, y: event.offsetY });
  const target = pointerToCanvas(event.clientX, event.clientY);
  state.pointerTarget = target;
});

canvas.addEventListener("pointermove", (event) => {
  if (!touches.has(event.pointerId)) return;
  touches.set(event.pointerId, { x: event.offsetX, y: event.offsetY });
  const target = pointerToCanvas(event.clientX, event.clientY);
  state.pointerTarget = target;
});

canvas.addEventListener("pointerup", (event) => {
  touches.delete(event.pointerId);
  if (touches.size === 0) {
    state.pointerTarget = null;
  }
});

canvas.addEventListener("pointerleave", () => {
  state.pointerTarget = null;
});

soundToggle.addEventListener("click", () => {
  setSound(!state.soundOn);
});

pauseButton.addEventListener("click", () => {
  togglePause();
});

statsToggle.addEventListener("click", () => {
  statsPanel.classList.toggle("open");
});

pauseOverlay.addEventListener("click", () => {
  togglePause();
});

startButton.addEventListener("click", () => {
  startGame();
  playerNameInput.value = state.stats.playerName || "";
});

restartButton.addEventListener("click", startGame);

saveResultButton.addEventListener("click", saveResult);

playerNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    saveResult();
  }
});

document.addEventListener(
  "touchmove",
  (event) => {
    if (event.target === canvas) {
      event.preventDefault();
    }
  },
  { passive: false }
);

document.addEventListener("visibilitychange", () => {
  if (document.hidden && state.phase === "play") {
    togglePause();
  }
});

setSound(state.soundOn);
initStarfield();
resetPlayer();
resetStats();
renderLeaderboard();
updateStatsPanel();
requestAnimationFrame(gameLoop);
