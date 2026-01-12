const canvas = document.getElementById("game");
const displayCtx = canvas.getContext("2d");
const bufferCanvas = document.createElement("canvas");
const ctx = bufferCanvas.getContext("2d");
const GAME_WIDTH = 300;
const GAME_HEIGHT = 600;
bufferCanvas.width = GAME_WIDTH;
bufferCanvas.height = GAME_HEIGHT;
displayCtx.imageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;

const hudScore = document.getElementById("hud-score");
const hudLevel = document.getElementById("hud-level");
const hudLives = document.getElementById("hud-lives");
const hudShield = document.getElementById("hud-shield");
const hudWeapon = document.getElementById("hud-weapon");
const levelBanner = document.getElementById("levelBanner");
const bossBanner = document.getElementById("bossBanner");
const bossBar = document.getElementById("bossBar");
const bossNameLabel = document.getElementById("bossName");
const bossHealthFill = document.getElementById("bossHealthFill");
const startOverlay = document.getElementById("startOverlay");
const pauseOverlay = document.getElementById("pauseOverlay");
const endOverlay = document.getElementById("endOverlay");
const endTitle = document.getElementById("endTitle");
const endStats = document.getElementById("endStats");
const playerNameInput = document.getElementById("playerName");
const saveResultButton = document.getElementById("saveResult");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restart");
const backToMenuButton = document.getElementById("backToMenu");
const soundToggle = document.getElementById("soundToggle");
const pauseButton = document.getElementById("pauseButton");
const finishButton = document.getElementById("finishButton");
const finishButtonPause = document.getElementById("finishButtonPause");
const statsToggle = document.getElementById("statsToggle");
const statsPanel = document.getElementById("statsPanel");
const leaderboard = document.getElementById("leaderboard");
const difficultyButtons = document.querySelectorAll(".difficulty-button");

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
    color: "#8fb6d9",
    accent: "#4fd1ff",
    highlight: "#f2f6ff",
    cockpit: "#1a2b4a",
    flame: "#ffb347",
    tier: 1,
    width: 30,
    height: 44,
    speed: 180,
    fireRate: 2.2,
    maxHp: 4,
  },
  {
    name: "Фалькон",
    color: "#2bd26f",
    accent: "#b4ff6b",
    highlight: "#eafff0",
    cockpit: "#0c2f1d",
    flame: "#ffa64d",
    tier: 2,
    width: 32,
    height: 46,
    speed: 190,
    fireRate: 2.6,
    maxHp: 4,
  },
  {
    name: "Раптор",
    color: "#21b964",
    accent: "#5effb1",
    highlight: "#eafff0",
    cockpit: "#103b2b",
    flame: "#ff8f3d",
    tier: 3,
    width: 34,
    height: 48,
    speed: 200,
    fireRate: 3,
    maxHp: 5,
  },
  {
    name: "Вайпер",
    color: "#2f78d6",
    accent: "#8ad9ff",
    highlight: "#e7f3ff",
    cockpit: "#0d1f3f",
    flame: "#ff9c37",
    tier: 4,
    width: 36,
    height: 50,
    speed: 210,
    fireRate: 3.4,
    maxHp: 5,
  },
  {
    name: "Фантом",
    color: "#375b92",
    accent: "#69b4ff",
    highlight: "#e4ecff",
    cockpit: "#0b1427",
    flame: "#ffb13d",
    tier: 5,
    width: 38,
    height: 52,
    speed: 225,
    fireRate: 3.8,
    maxHp: 6,
  },
  {
    name: "Нова",
    color: "#1e2f4a",
    accent: "#f6c945",
    highlight: "#cbe7ff",
    cockpit: "#0b1220",
    flame: "#51e5ff",
    tier: 6,
    width: 40,
    height: 54,
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

const musicTracks = buildMusicTracks();

function buildMusicTracks() {
  // Autotracker-inspired procedural music generator.
  return {
    menu: createAutoTrack({ seed: 0x4d5054, tempo: 240, root: 57, mood: "bright" }),
    levelA: createAutoTrack({ seed: 0x4c564c, tempo: 220, root: 55, mood: "adventure" }),
    levelB: createAutoTrack({ seed: 0x4c5642, tempo: 210, root: 53, mood: "adventure" }),
    levelC: createAutoTrack({ seed: 0x4c5643, tempo: 200, root: 52, mood: "mystic" }),
    boss: createAutoTrack({ seed: 0x424f5353, tempo: 180, root: 45, mood: "tense" }),
  };
}

function createAutoTrack({ seed, tempo, root, mood }) {
  const rng = mulberry32(seed);
  const length = 8;
  const scale = pickScale(mood);
  const melody = [];
  const bass = [];

  for (let i = 0; i < length; i += 1) {
    const noteStep = scale[Math.floor(rng() * scale.length)];
    const melodyNote = root + 12 + noteStep + (rng() < 0.2 ? 12 : 0);
    melody.push(midiToFreq(melodyNote));

    const bassStep = scale[Math.floor(rng() * scale.length)];
    const bassNote = root - 12 + bassStep;
    bass.push(midiToFreq(bassNote));
  }

  const tempoVariance = 0.9 + rng() * 0.2;
  return {
    tempo: Math.floor(tempo * tempoVariance),
    melody,
    bass,
  };
}

function pickScale(mood) {
  if (mood === "tense") return [0, 1, 3, 5, 6, 8, 10];
  if (mood === "mystic") return [0, 2, 3, 5, 7, 9, 10];
  if (mood === "bright") return [0, 2, 4, 7, 9, 12];
  return [0, 2, 4, 5, 7, 9, 11];
}

function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const difficultySettings = {
  easy: { spawn: 1.1, speed: 0.95, power: 0.9, boss: 0.9 },
  medium: { spawn: 1, speed: 1, power: 1, boss: 1 },
  hard: { spawn: 0.92, speed: 1.08, power: 1.1, boss: 1.1 },
  insane: { spawn: 0.85, speed: 1.16, power: 1.2, boss: 1.2 },
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
  runSaved: false,
  boss: null,
  bossBannerTimer: 0,
  lastBossName: null,
  difficulty: "medium",
  view: {
    x: 0,
    y: 0,
    scale: 1,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
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

const bossNamesBase = [
  "Roberto_Prado",
  "Tom_Prado",
  "Vlad_Prado",
  "Jeka_Prado",
  "Basara_Prado",
];

const bossNamesExtra = [
  "Luna_Prado",
  "Nova_Prado",
  "Astra_Prado",
  "Rex_Prado",
  "Tora_Prado",
  "Kyra_Prado",
  "Zed_Prado",
  "Auri_Prado",
];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const rand = (min, max) => Math.random() * (max - min) + min;

function resizeCanvas() {
  const width = Math.floor(canvas.clientWidth);
  const height = Math.floor(canvas.clientHeight);
  canvas.width = width;
  canvas.height = height;
  const scale = Math.max(1, Math.floor(Math.min(width / GAME_WIDTH, height / GAME_HEIGHT)));
  const viewWidth = GAME_WIDTH * scale;
  const viewHeight = GAME_HEIGHT * scale;
  state.view = {
    x: Math.floor((width - viewWidth) / 2),
    y: Math.floor((height - viewHeight) / 2),
    scale,
    width: viewWidth,
    height: viewHeight,
  };
  displayCtx.imageSmoothingEnabled = false;
}

function initStarfield() {
  state.starfield = Array.from({ length: 90 }, () => ({
    x: rand(0, GAME_WIDTH),
    y: rand(0, GAME_HEIGHT),
    size: Math.floor(rand(1, 3)),
    speed: rand(25, 70),
    twinkle: rand(0.2, 1),
  }));
  state.farStars = Array.from({ length: 70 }, () => ({
    x: rand(0, GAME_WIDTH),
    y: rand(0, GAME_HEIGHT),
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

function getLevelTrack(level) {
  if (level <= 4) return "levelA";
  if (level <= 9) return "levelB";
  if (level <= 14) return "levelC";
  const bucket = Math.floor((level - 1) / 5) % 3;
  return bucket === 0 ? "levelA" : bucket === 1 ? "levelB" : "levelC";
}

function getDifficulty() {
  return difficultySettings[state.difficulty] || difficultySettings.medium;
}

function getLevelConfig() {
  const base = levels[state.levelIndex];
  const diff = getDifficulty();
  return {
    ...base,
    spawnRate: base.spawnRate * 0.94 * diff.spawn,
    enemySpeed: base.enemySpeed * 1.06 * diff.speed,
    powerRate: base.powerRate * diff.power,
    bossScale: diff.boss,
  };
}

function setDifficulty(value) {
  if (!difficultySettings[value]) return;
  state.difficulty = value;
  difficultyButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.difficulty === value);
  });
}

function pickBossName() {
  const pool = bossNamesBase.concat(bossNamesExtra);
  let name = pool[Math.floor(rand(0, pool.length))];
  if (pool.length > 1 && name === state.lastBossName) {
    name = pool[(pool.indexOf(name) + 1) % pool.length];
  }
  state.lastBossName = name;
  return name;
}

function resetPlayer() {
  const skin = playerSkins[state.levelIndex] || playerSkins[playerSkins.length - 1];
  state.player = {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT * 0.75,
    width: skin.width,
    height: skin.height,
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
  state.boss = null;
  state.bossBannerTimer = 0;
  bossBar.classList.add("hidden");
  bossBanner.classList.add("hidden");
  resetPlayer();
  showLevelBanner();
  playSfx("level");
  if (levels[state.levelIndex].level % 5 === 0) {
    startBossFight();
  }
}

function startBossFight() {
  const level = levels[state.levelIndex].level;
  const bossIndex = Math.floor(level / 5);
  const diff = getDifficulty();
  const maxHp = Math.floor(70 * Math.pow(1.32, bossIndex) * diff.boss);
  const kind = bossIndex % 3;
  state.boss = {
    name: pickBossName(),
    x: GAME_WIDTH / 2,
    y: -60,
    width: 80,
    height: 40,
    hp: maxHp,
    maxHp,
    phase: 1,
    entering: true,
    attackTimer: 2,
    specialTimer: 4,
    kind,
    moveDir: 1,
    minionTimer: 6,
  };
  bossBanner.textContent = `БОСС: ${state.boss.name}`;
  bossBanner.classList.remove("hidden");
  state.bossBannerTimer = 1.8;
  bossBar.classList.remove("hidden");
  bossNameLabel.textContent = state.boss.name;
  bossHealthFill.style.width = "100%";
  spawnPowerup(GAME_WIDTH * 0.3, -10, "shield");
  spawnPowerup(GAME_WIDTH * 0.7, -10, "weapon");
  playBossIntro();
  setTimeout(() => switchMusic("boss"), 900);
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
  state.runSaved = false;
  startOverlay.classList.add("hidden");
  endOverlay.classList.add("hidden");
  pauseOverlay.classList.add("hidden");
  saveResultButton.disabled = false;
  saveResultButton.textContent = "СОХРАНИТЬ РЕЗУЛЬТАТ";
  playerNameInput.disabled = false;
  resetStats();
  resetLevel();
  initAudio();
  switchMusic(getLevelTrack(levels[state.levelIndex].level));
}

function endGame(win) {
  state.phase = "end";
  state.runSaved = false;
  endOverlay.classList.remove("hidden");
  bossBar.classList.add("hidden");
  endTitle.textContent = win ? "ПОБЕДА!" : "ИГРА ОКОНЧЕНА";
  endStats.textContent = `ОЧКИ: ${state.score} · ВРЕМЯ: ${state.time.toFixed(1)}с · УНИЧТОЖЕНО: ${state.stats.kills} · ПРОПУЩЕНО: ${state.stats.missed}`;
  saveResultButton.disabled = false;
  saveResultButton.textContent = "СОХРАНИТЬ РЕЗУЛЬТАТ";
  playerNameInput.disabled = false;
  playSfx(win ? "win" : "lose");
}

function finishGame() {
  if (state.phase === "end") return;
  endGame(false);
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

function triggerVibration(duration) {
  if (!state.soundOn) return;
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(duration);
  }
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

function playBossIntro() {
  if (!state.audio || !state.soundOn) return;
  playTone(196, 0.2, "square", 0.2);
  setTimeout(() => playTone(220, 0.2, "square", 0.2), 220);
  setTimeout(() => playTone(247, 0.25, "square", 0.2), 460);
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
  const level = getLevelConfig();
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
    x: rand(30, GAME_WIDTH - 30),
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
    GAME_WIDTH - 30
  );
  state.player.y = clamp(
    state.player.y + dy * state.player.speed * dt,
    80,
    GAME_HEIGHT - 30
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
    if (star.y > GAME_HEIGHT) {
      star.y = -10;
      star.x = rand(0, GAME_WIDTH);
    }
  });
  state.starfield.forEach((star) => {
    star.y += star.speed * dt;
    if (star.y > GAME_HEIGHT) {
      star.y = -10;
      star.x = rand(0, GAME_WIDTH);
    }
  });
}

function updateEnemies(dt) {
  if (state.boss) {
    return;
  }
  const level = getLevelConfig();
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
    if (enemy.y > GAME_HEIGHT + 40) {
      applyMissPenalty();
      return false;
    }
    return true;
  });
}

function updateBoss(dt) {
  const boss = state.boss;
  if (!boss) return;
  bossBar.classList.remove("hidden");
  bossNameLabel.textContent = boss.name;
  if (boss.entering) {
    boss.y += 40 * dt;
    if (boss.y >= 80) {
      boss.y = 80;
      boss.entering = false;
    }
    return;
  }

  boss.x += boss.moveDir * 40 * dt;
  if (boss.x < 50 || boss.x > GAME_WIDTH - 50) {
    boss.moveDir *= -1;
  }

  const hpRatio = boss.hp / boss.maxHp;
  boss.phase = hpRatio < 0.33 ? 3 : hpRatio < 0.66 ? 2 : 1;
  boss.attackTimer -= dt;
  if (boss.attackTimer <= 0) {
    if (boss.phase === 1) {
      spawnEnemyBullet(boss, -0.2, 20);
      spawnEnemyBullet(boss, 0, 10);
      spawnEnemyBullet(boss, 0.2, 20);
      boss.attackTimer = 1.8;
    } else if (boss.phase === 2) {
      spawnEnemyBullet(boss, -0.08, 30);
      spawnEnemyBullet(boss, 0, 30);
      spawnEnemyBullet(boss, 0.08, 30);
      boss.attackTimer = 1.4;
    } else {
      spawnEnemyBullet(boss, -0.26, 40);
      spawnEnemyBullet(boss, -0.13, 35);
      spawnEnemyBullet(boss, 0, 30);
      spawnEnemyBullet(boss, 0.13, 35);
      spawnEnemyBullet(boss, 0.26, 40);
      boss.attackTimer = 1.2;
    }
  }

  if (boss.phase >= 3) {
    boss.minionTimer -= dt;
    if (boss.minionTimer <= 0) {
      boss.minionTimer = 6;
      if (state.enemies.length < 2) {
        state.enemies.push({
          type: enemyTypes[0],
          x: rand(30, GAME_WIDTH - 30),
          y: -30,
          width: 24,
          height: 28,
          speed: 60,
          hp: 1,
          wiggle: rand(-1, 1),
          telegraph: 0,
          fireTimer: 2.4,
          fireQueued: false,
        });
      }
    }
  }

  bossHealthFill.style.width = `${Math.max(0, (boss.hp / boss.maxHp) * 100)}%`;
}

function drawBoss() {
  const boss = state.boss;
  if (!boss) return;
  ctx.fillStyle = "#7b4bff";
  ctx.fillRect(boss.x - boss.width / 2, boss.y - boss.height / 2, boss.width, boss.height);
  ctx.fillStyle = "#ffb3ff";
  ctx.fillRect(boss.x - boss.width / 2 + 6, boss.y - boss.height / 2 + 6, boss.width - 12, 6);
  ctx.fillRect(boss.x - 10, boss.y + boss.height / 2 - 6, 20, 6);
  ctx.fillStyle = "#1a0f2a";
  ctx.fillRect(boss.x - 12, boss.y - 6, 24, 12);
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
    return bullet.y < GAME_HEIGHT + 40;
  });
}

function updatePowerups(dt) {
  state.powerups = state.powerups.filter((power) => {
    power.y += power.speed * dt;
    power.ttl -= dt;
    return power.ttl > 0 && power.y < GAME_HEIGHT + 20;
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

  if (state.boss) {
    state.bullets.forEach((bullet) => {
      if (bullet.y < -500) return;
      if (intersects({ x: bullet.x, y: bullet.y, width: bullet.width, height: bullet.height }, state.boss)) {
        state.boss.hp -= 1;
        state.stats.hits += 1;
        spawnEffect(state.boss.x, state.boss.y, "УДАР", "#ffb3ff");
        playSfx("hit");
        if (bullet.pierce > 0) {
          bullet.pierce -= 1;
        } else {
          bullet.y = -999;
        }
      }
    });
    if (state.boss.hp <= 0) {
      playSfx("win");
      bossBar.classList.add("hidden");
      state.boss = null;
      if (state.levelIndex >= levels.length - 1) {
        endGame(true);
      } else {
        state.levelIndex += 1;
        resetLevel();
        switchMusic(getLevelTrack(levels[state.levelIndex].level));
      }
    }
  }

  state.bullets = state.bullets.filter((bullet) => bullet.y > -200);
  state.enemies = state.enemies.filter((enemy) => enemy.hp > 0);

  if (state.player.invuln <= 0) {
    state.enemyBullets.forEach((bullet) => {
      if (intersects({ x: bullet.x, y: bullet.y, width: bullet.width, height: bullet.height }, state.player)) {
        bullet.y = GAME_HEIGHT + 200;
        applyDamage(1);
      }
    });

    state.enemies.forEach((enemy) => {
      if (intersects(enemy, state.player)) {
        enemy.y = GAME_HEIGHT + 100;
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
    triggerVibration(50);
  }
}

function applyMissPenalty() {
  state.showMiss = 0.9;
  state.stats.missed += 1;
  state.stats.missDamage += 1;
  applyDamage(1);
  spawnEffect(GAME_WIDTH / 2, GAME_HEIGHT / 2, "ПРОМАХ!", "#ff5b5b");
  playSfx("miss");
  triggerVibration(100);
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
  if (state.bossBannerTimer > 0) {
    state.bossBannerTimer -= dt;
    if (state.bossBannerTimer <= 0) {
      bossBanner.classList.add("hidden");
    }
  }
  if (state.boss) {
    return;
  }
  const level = levels[state.levelIndex];
  if (state.levelTimer >= level.duration) {
    if (state.levelIndex >= levels.length - 1) {
      endGame(true);
    } else {
      state.levelIndex += 1;
      resetLevel();
      switchMusic(getLevelTrack(levels[state.levelIndex].level));
    }
  }
}

function drawStarfield() {
  ctx.fillStyle = palette.sky;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  ctx.fillStyle = palette.nebula;
  ctx.globalAlpha = 0.35;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
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

function drawPixelShip({ x, y, skin }) {
  const unit = 2;
  const drawBlocks = (blocks, color) => {
    if (!blocks.length) return;
    ctx.fillStyle = color;
    blocks.forEach(([bx, by, bw, bh]) => {
      ctx.fillRect(x + bx * unit, y + by * unit, bw * unit, bh * unit);
    });
  };

  const styleMap = {
    1: {
      body: [
        [-2, -10, 4, 14],
        [-1, -12, 2, 3],
        [-6, -3, 12, 4],
        [-4, 2, 3, 5],
        [1, 2, 3, 5],
        [-1, 5, 2, 6],
      ],
      accent: [
        [-1, -6, 2, 4],
        [-4, -1, 3, 2],
        [1, -1, 3, 2],
      ],
      highlight: [
        [-1, -11, 2, 1],
        [-5, -2, 2, 1],
        [3, -2, 2, 1],
      ],
      cockpit: [[-1, -4, 2, 3]],
      flame: [
        [-3, 8, 2, 3],
        [1, 8, 2, 3],
      ],
    },
    2: {
      body: [
        [-3, -11, 6, 16],
        [-1, -13, 2, 3],
        [-7, -4, 14, 5],
        [-6, 1, 4, 6],
        [2, 1, 4, 6],
        [-2, 5, 4, 7],
      ],
      accent: [
        [-1, -7, 2, 5],
        [-5, -2, 3, 2],
        [2, -2, 3, 2],
      ],
      highlight: [
        [-1, -12, 2, 1],
        [-6, -3, 2, 1],
        [4, -3, 2, 1],
      ],
      cockpit: [[-1, -5, 2, 4]],
      flame: [
        [-5, 9, 2, 3],
        [3, 9, 2, 3],
      ],
    },
    3: {
      body: [
        [-3, -12, 6, 17],
        [-1, -14, 2, 3],
        [-8, -5, 16, 5],
        [-7, 0, 5, 7],
        [2, 0, 5, 7],
        [-2, 5, 4, 8],
        [-1, -9, 2, 3],
      ],
      accent: [
        [-1, -8, 2, 5],
        [-6, -3, 3, 2],
        [3, -3, 3, 2],
        [-2, 1, 4, 2],
      ],
      highlight: [
        [-1, -13, 2, 1],
        [-7, -4, 2, 1],
        [5, -4, 2, 1],
      ],
      cockpit: [[-1, -6, 2, 4]],
      flame: [
        [-6, 10, 2, 3],
        [4, 10, 2, 3],
        [-1, 10, 2, 3],
      ],
    },
    4: {
      body: [
        [-4, -13, 8, 18],
        [-1, -15, 2, 3],
        [-9, -6, 18, 5],
        [-8, -1, 6, 8],
        [2, -1, 6, 8],
        [-2, 6, 4, 8],
        [-1, -10, 2, 3],
        [-5, -9, 2, 3],
        [3, -9, 2, 3],
      ],
      accent: [
        [-1, -9, 2, 6],
        [-7, -4, 3, 2],
        [4, -4, 3, 2],
        [-3, 1, 6, 2],
      ],
      highlight: [
        [-1, -14, 2, 1],
        [-8, -5, 2, 1],
        [6, -5, 2, 1],
      ],
      cockpit: [[-1, -7, 2, 4]],
      flame: [
        [-7, 11, 2, 3],
        [5, 11, 2, 3],
        [-2, 11, 4, 3],
      ],
    },
    5: {
      body: [
        [-4, -14, 8, 19],
        [-1, -16, 2, 3],
        [-10, -7, 20, 5],
        [-9, -2, 7, 8],
        [2, -2, 7, 8],
        [-3, 7, 6, 8],
        [-2, -11, 4, 4],
        [-6, -10, 2, 4],
        [4, -10, 2, 4],
      ],
      accent: [
        [-1, -10, 2, 6],
        [-8, -5, 3, 2],
        [5, -5, 3, 2],
        [-3, 1, 6, 2],
        [-5, 3, 10, 2],
      ],
      highlight: [
        [-1, -15, 2, 1],
        [-9, -6, 2, 1],
        [7, -6, 2, 1],
      ],
      cockpit: [[-1, -8, 2, 4]],
      flame: [
        [-8, 12, 2, 3],
        [6, 12, 2, 3],
        [-3, 12, 6, 3],
      ],
    },
    6: {
      body: [
        [-5, -15, 10, 20],
        [-1, -17, 2, 3],
        [-11, -8, 22, 5],
        [-10, -3, 8, 9],
        [2, -3, 8, 9],
        [-3, 8, 6, 8],
        [-2, -12, 4, 4],
        [-7, -11, 2, 4],
        [5, -11, 2, 4],
        [-6, -6, 2, 5],
        [4, -6, 2, 5],
      ],
      accent: [
        [-1, -11, 2, 6],
        [-9, -6, 3, 2],
        [6, -6, 3, 2],
        [-4, 1, 8, 2],
        [-6, 3, 12, 2],
      ],
      highlight: [
        [-1, -16, 2, 1],
        [-10, -7, 2, 1],
        [8, -7, 2, 1],
      ],
      cockpit: [[-1, -9, 2, 4]],
      flame: [
        [-9, 13, 2, 3],
        [7, 13, 2, 3],
        [-4, 13, 8, 3],
      ],
    },
  };

  const style = styleMap[skin.tier] || styleMap[1];
  drawBlocks(style.body, skin.color);
  drawBlocks(style.accent, skin.accent);
  drawBlocks(style.highlight, skin.highlight);
  drawBlocks(style.cockpit, skin.cockpit);
  drawBlocks(style.flame, skin.flame);
}

function drawPlayer() {
  const { x, y, width, height, skin, invuln, shield } = state.player;
  if (invuln > 0 && Math.floor(invuln * 10) % 2 === 0) return;

  drawPixelShip({ x, y, skin });

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
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

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
  drawBoss();
  drawPlayer();
  drawEffects();

  if (state.showMiss > 0) {
    ctx.fillStyle = palette.miss;
    ctx.fillText("ПРОМАХ!", GAME_WIDTH / 2 - 30, GAME_HEIGHT / 2);
    state.showMiss -= 0.02;
  }

  if (state.hitFlash > 0) {
    ctx.fillStyle = palette.vignette;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    state.hitFlash -= 0.02;
  }

  if (state.screenShake > 0) {
    ctx.restore();
  }

  displayCtx.setTransform(1, 0, 0, 1, 0, 0);
  displayCtx.clearRect(0, 0, canvas.width, canvas.height);
  displayCtx.imageSmoothingEnabled = false;
  const { x, y, width, height } = state.view;
  displayCtx.save();
  displayCtx.beginPath();
  displayCtx.rect(x, y, width, height);
  displayCtx.clip();
  displayCtx.drawImage(bufferCanvas, 0, 0, GAME_WIDTH, GAME_HEIGHT, x, y, width, height);
  displayCtx.restore();
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
  if (state.runSaved) return;
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
  state.runSaved = true;
  saveResultButton.disabled = true;
  saveResultButton.textContent = "СОХРАНЕНО";
  playerNameInput.disabled = true;
}

function gameLoop(now) {
  const dt = Math.min((now - lastFrame) / 1000, 0.05);
  lastFrame = now;

  if (state.phase === "play") {
    updateStarfield(dt);
    handlePlayerInput(dt, now);
    updateEnemies(dt);
    updateBoss(dt);
    updateBullets(dt);
    updatePowerups(dt);
    updateEffects(dt);
    handleCollisions();
    updateLevel(dt);

    if (state.player.hp <= 0) {
      endGame(false);
    }

    if (!state.boss) {
      const level = getLevelConfig();
      if (state.time - state.lastPower > level.powerRate) {
        state.lastPower = state.time;
        spawnPowerup(rand(40, GAME_WIDTH - 40), -20, randomPowerupKind());
      }
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
  const view = state.view;
  const localX = (x - view.x) / view.scale;
  const localY = (y - view.y) / view.scale;
  return {
    x: clamp(localX, 0, GAME_WIDTH),
    y: clamp(localY, 0, GAME_HEIGHT),
  };
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

finishButton.addEventListener("click", () => {
  finishGame();
});

finishButtonPause.addEventListener("click", () => {
  finishGame();
});

statsToggle.addEventListener("click", () => {
  statsPanel.classList.toggle("open");
});

difficultyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (state.phase !== "start") return;
    setDifficulty(button.dataset.difficulty);
  });
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

backToMenuButton.addEventListener("click", () => {
  state.phase = "start";
  startOverlay.classList.remove("hidden");
  endOverlay.classList.add("hidden");
  pauseOverlay.classList.add("hidden");
  if (state.audio) {
    switchMusic("menu");
  }
});

playerNameInput.addEventListener("keydown", (event) => {
  if (state.runSaved) return;
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
setDifficulty(state.difficulty);
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
initStarfield();
resetPlayer();
resetStats();
renderLeaderboard();
updateStatsPanel();
requestAnimationFrame(gameLoop);
