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
const hudCoins = document.getElementById("hud-coins");
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
const adminPanel = document.getElementById("adminPanel");
const adminLevelSelect = document.getElementById("adminLevelSelect");
const adminGoLevelButton = document.getElementById("adminGoLevel");
const adminResetRunButton = document.getElementById("adminResetRun");

const hangarOverlay = document.getElementById("hangarOverlay");
const hangarCoins = document.getElementById("hangarCoins");
const hangarShipCanvas = document.getElementById("hangarShipCanvas");
const hangarShipName = document.getElementById("hangarShipName");
const hangarShipClass = document.getElementById("hangarShipClass");
const hangarShipTrait = document.getElementById("hangarShipTrait");
const hangarShipStats = document.getElementById("hangarShipStats");
const hangarShipPower = document.getElementById("hangarShipPower");
const hangarShips = document.getElementById("hangarShips");
const hangarWeapons = document.getElementById("hangarWeapons");
const hangarUpgrades = document.getElementById("hangarUpgrades");
const hangarMessage = document.getElementById("hangarMessage");
const hangarBack = document.getElementById("hangarBack");
const hangarPlay = document.getElementById("hangarPlay");
const hangarReset = document.getElementById("hangarReset");

const summaryOverlay = document.getElementById("summaryOverlay");
const summaryLevel = document.getElementById("summaryLevel");
const summaryCoinsKills = document.getElementById("summaryCoinsKills");
const summaryCoinsBonus = document.getElementById("summaryCoinsBonus");
const summaryCoinsTotal = document.getElementById("summaryCoinsTotal");
const summaryContinue = document.getElementById("summaryContinue");

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

const shipCatalog = [
  {
    id: "scout",
    name: "Скаут",
    price: 0,
    rarity: "Обычный",
    class: "Лёгкий",
    trait: "Манёвренность: устойчивый разгон",
    baseStats: { hp: 4, speed: 180, damageMultiplier: 1, fireRateMultiplier: 1, hitboxScale: 1 },
    color: "#b9f1ff",
    accent: "#6ad8ff",
    highlight: "#ffffff",
    cockpit: "#32c97c",
    flame: "#ffb347",
    tier: 1,
    width: 30,
    height: 44,
  },
  {
    id: "falcon",
    name: "Фалькон",
    price: 120,
    rarity: "Обычный",
    class: "Лёгкий",
    trait: "Оружейник: выше темп",
    baseStats: { hp: 4, speed: 190, damageMultiplier: 1.05, fireRateMultiplier: 1.06, hitboxScale: 1 },
    color: "#3fd34d",
    accent: "#a7ff6a",
    highlight: "#f5ffd8",
    cockpit: "#1a6a2a",
    flame: "#ff9a3c",
    tier: 2,
    width: 32,
    height: 46,
  },
  {
    id: "raptor",
    name: "Раптор",
    price: 260,
    rarity: "Необычный",
    class: "Штурмовик",
    trait: "Тяжёлый: больше корпуса",
    baseStats: { hp: 5, speed: 200, damageMultiplier: 1.1, fireRateMultiplier: 1.08, hitboxScale: 1 },
    color: "#2b7de6",
    accent: "#7fd3ff",
    highlight: "#e8f7ff",
    cockpit: "#1a4f8f",
    flame: "#ffb347",
    tier: 3,
    width: 34,
    height: 48,
  },
  {
    id: "viper",
    name: "Вайпер",
    price: 420,
    rarity: "Редкий",
    class: "Перехватчик",
    trait: "Манёвренность: высокая скорость",
    baseStats: { hp: 5, speed: 210, damageMultiplier: 1.16, fireRateMultiplier: 1.12, hitboxScale: 0.98 },
    color: "#3b3f4a",
    accent: "#f2b942",
    highlight: "#8fd6ff",
    cockpit: "#1d232e",
    flame: "#ffb347",
    tier: 4,
    width: 36,
    height: 50,
  },
  {
    id: "phantom",
    name: "Фантом",
    price: 680,
    rarity: "Эпический",
    class: "Бомбардировщик",
    trait: "Броня: повышенная живучесть",
    baseStats: { hp: 6, speed: 225, damageMultiplier: 1.22, fireRateMultiplier: 1.18, hitboxScale: 1.05 },
    color: "#d93b34",
    accent: "#ffffff",
    highlight: "#ffd2d2",
    cockpit: "#5f0f14",
    flame: "#ffb347",
    tier: 5,
    width: 38,
    height: 52,
  },
  {
    id: "nova",
    name: "Нова",
    price: 980,
    rarity: "Легендарный",
    class: "Элитный",
    trait: "Оружейник: максимальный темп",
    baseStats: { hp: 6, speed: 240, damageMultiplier: 1.32, fireRateMultiplier: 1.28, hitboxScale: 1.08 },
    color: "#5e6e87",
    accent: "#c8d4e6",
    highlight: "#ffffff",
    cockpit: "#2b3a52",
    flame: "#55d7ff",
    tier: 6,
    width: 40,
    height: 54,
  },
];

const shipCatalogMap = shipCatalog.reduce((acc, ship) => {
  acc[ship.id] = ship;
  return acc;
}, {});

const weaponCatalog = {
  blaster: {
    id: "blaster",
    name: "БЛАСТЕР",
    color: "#ffe66d",
    price: 0,
    upgradeBaseCost: 80,
    levels: [
      { shots: 1, spread: 0, pierce: 0, speed: 320, damage: 1, fireRate: 3.2, size: 4 },
      { shots: 2, spread: 0.08, pierce: 0, speed: 340, damage: 1, fireRate: 3.6, size: 4 },
      { shots: 3, spread: 0.14, pierce: 1, speed: 360, damage: 1, fireRate: 3.8, size: 4 },
      { shots: 4, spread: 0.2, pierce: 1, speed: 380, damage: 1, fireRate: 4, size: 4 },
      { shots: 5, spread: 0.24, pierce: 2, speed: 390, damage: 1, fireRate: 4.2, size: 4 },
      { shots: 5, spread: 0.28, pierce: 2, speed: 405, damage: 1, fireRate: 4.4, size: 4 },
    ],
  },
  orbs: {
    id: "orbs",
    name: "СФЕРЫ",
    color: "#7df9ff",
    price: 180,
    upgradeBaseCost: 110,
    levels: [
      { shots: 2, spread: 0.18, pierce: 0, speed: 240, damage: 1, fireRate: 2.4, size: 6 },
      { shots: 3, spread: 0.22, pierce: 0, speed: 250, damage: 1, fireRate: 2.6, size: 6 },
      { shots: 4, spread: 0.26, pierce: 1, speed: 260, damage: 1, fireRate: 2.8, size: 7 },
      { shots: 5, spread: 0.3, pierce: 1, speed: 270, damage: 1, fireRate: 3, size: 7 },
      { shots: 6, spread: 0.34, pierce: 1, speed: 280, damage: 1, fireRate: 3.2, size: 7 },
      { shots: 6, spread: 0.36, pierce: 2, speed: 290, damage: 1, fireRate: 3.35, size: 7 },
    ],
  },
  laser: {
    id: "laser",
    name: "ЛАЗЕР",
    color: "#ff7bff",
    price: 320,
    upgradeBaseCost: 140,
    levels: [
      { shots: 1, spread: 0, pierce: 2, speed: 520, damage: 1, fireRate: 2.2, size: 5, length: 24 },
      { shots: 1, spread: 0, pierce: 2, speed: 560, damage: 1, fireRate: 2.4, size: 6, length: 26 },
      { shots: 2, spread: 0.08, pierce: 3, speed: 580, damage: 1, fireRate: 2.6, size: 6, length: 28 },
      { shots: 2, spread: 0.1, pierce: 3, speed: 600, damage: 1, fireRate: 2.8, size: 7, length: 30 },
      { shots: 3, spread: 0.12, pierce: 4, speed: 620, damage: 1, fireRate: 3, size: 7, length: 32 },
      { shots: 3, spread: 0.14, pierce: 4, speed: 640, damage: 1, fireRate: 3.2, size: 7, length: 34 },
    ],
  },
  missile: {
    id: "missile",
    name: "РАКЕТЫ",
    color: "#ff9f3c",
    price: 460,
    upgradeBaseCost: 170,
    levels: [
      { shots: 1, spread: 0, pierce: 0, speed: 240, damage: 2, fireRate: 1.8, size: 6, turnRate: 2.4 },
      { shots: 2, spread: 0.12, pierce: 0, speed: 250, damage: 2, fireRate: 1.9, size: 6, turnRate: 2.6 },
      { shots: 2, spread: 0.16, pierce: 1, speed: 260, damage: 2, fireRate: 2, size: 6, turnRate: 2.8 },
      { shots: 3, spread: 0.18, pierce: 1, speed: 270, damage: 2, fireRate: 2.1, size: 7, turnRate: 3 },
      { shots: 3, spread: 0.2, pierce: 1, speed: 280, damage: 2, fireRate: 2.2, size: 7, turnRate: 3.2 },
      { shots: 4, spread: 0.22, pierce: 1, speed: 290, damage: 2, fireRate: 2.3, size: 7, turnRate: 3.4 },
    ],
  },
  arc: {
    id: "arc",
    name: "ДИСК",
    color: "#ffd166",
    price: 600,
    upgradeBaseCost: 190,
    levels: [
      { shots: 1, spread: 0, pierce: 1, speed: 260, damage: 2, fireRate: 1.6, size: 10 },
      { shots: 1, spread: 0, pierce: 2, speed: 270, damage: 2, fireRate: 1.7, size: 11 },
      { shots: 2, spread: 0.12, pierce: 2, speed: 280, damage: 2, fireRate: 1.8, size: 11 },
      { shots: 2, spread: 0.16, pierce: 3, speed: 290, damage: 2, fireRate: 1.9, size: 12 },
      { shots: 3, spread: 0.18, pierce: 3, speed: 300, damage: 2, fireRate: 2, size: 12 },
      { shots: 3, spread: 0.2, pierce: 4, speed: 310, damage: 2, fireRate: 2.1, size: 12 },
    ],
  },
};

const enemyConfigs = [
  {
    id: "scout",
    label: "скaут",
    speed: 1.15,
    hp: 1,
    fireDelay: 2.6,
    pattern: "single",
    behaviorType: "shooter",
    score: 140,
    dropChance: 0.28,
  },
  {
    id: "shooter",
    label: "стрелок",
    speed: 1,
    hp: 2,
    fireDelay: 2.8,
    pattern: "double",
    behaviorType: "shooter",
    score: 170,
    dropChance: 0.3,
  },
  {
    id: "edge",
    label: "краевой",
    speed: 1.05,
    hp: 2,
    fireDelay: 2.2,
    pattern: "single",
    behaviorType: "edge",
    score: 190,
    dropChance: 0.32,
  },
  {
    id: "rammer",
    label: "таранщик",
    speed: 1.2,
    hp: 2,
    fireDelay: 3.2,
    pattern: "single",
    behaviorType: "rammer",
    score: 220,
    dropChance: 0.3,
  },
  {
    id: "snake",
    label: "змейка",
    speed: 1.1,
    hp: 2,
    fireDelay: 3.4,
    pattern: "fan",
    behaviorType: "snake",
    score: 200,
    dropChance: 0.33,
  },
  {
    id: "armor",
    label: "броня",
    speed: 0.8,
    hp: 4,
    fireDelay: 3.6,
    pattern: "burst",
    behaviorType: "shooter",
    armored: true,
    score: 260,
    dropChance: 0.36,
  },
  {
    id: "elite",
    label: "элита",
    speed: 1.1,
    hp: 5,
    fireDelay: 2.6,
    pattern: "fan",
    behaviorType: "shooter",
    elite: true,
    score: 320,
    dropChance: 0.4,
  },
  {
    id: "rock",
    label: "камень",
    speed: 0.7,
    hp: 3,
    fireDelay: 0,
    pattern: "none",
    behaviorType: "asteroid",
    score: 80,
    dropChance: 0.15,
  },
];

const enemyConfigMap = enemyConfigs.reduce((acc, enemy) => {
  acc[enemy.id] = enemy;
  return acc;
}, {});

const levelConfigs = [
  {
    level: 1,
    duration: 36,
    spawnRate: 1.7,
    enemySpeed: 42,
    powerRate: 7.4,
    phases: [
      { at: 0, pool: ["scout", "shooter"], spawnMod: 1 },
      { at: 0.6, pool: ["scout", "shooter", "snake"], spawnMod: 0.95 },
    ],
    asteroidChance: 0.06,
  },
  {
    level: 2,
    duration: 40,
    spawnRate: 1.6,
    enemySpeed: 44,
    powerRate: 7,
    phases: [
      { at: 0, pool: ["scout", "shooter"], spawnMod: 1 },
      { at: 0.5, pool: ["edge", "shooter", "snake"], spawnMod: 0.95 },
    ],
    asteroidChance: 0.08,
  },
  {
    level: 3,
    duration: 42,
    spawnRate: 1.5,
    enemySpeed: 46,
    powerRate: 6.8,
    phases: [
      { at: 0, pool: ["scout", "rammer", "shooter"], spawnMod: 1 },
      { at: 0.55, pool: ["rammer", "snake", "edge"], spawnMod: 0.92 },
    ],
    asteroidChance: 0.1,
  },
  {
    level: 4,
    duration: 45,
    spawnRate: 1.4,
    enemySpeed: 48,
    powerRate: 6.6,
    phases: [
      { at: 0, pool: ["edge", "snake", "shooter"], spawnMod: 1 },
      { at: 0.5, pool: ["rammer", "edge", "snake"], spawnMod: 0.9 },
    ],
    asteroidChance: 0.12,
  },
  {
    level: 5,
    duration: 48,
    spawnRate: 1.35,
    enemySpeed: 50,
    powerRate: 6.4,
    phases: [
      { at: 0, pool: ["shooter", "rammer", "edge"], spawnMod: 1 },
      { at: 0.55, pool: ["snake", "rammer", "edge"], spawnMod: 0.9 },
    ],
    asteroidChance: 0.14,
  },
  {
    level: 6,
    duration: 50,
    spawnRate: 1.3,
    enemySpeed: 52,
    powerRate: 6.2,
    phases: [
      { at: 0, pool: ["shooter", "armor", "edge"], spawnMod: 1 },
      { at: 0.5, pool: ["rammer", "snake", "armor"], spawnMod: 0.88 },
    ],
    asteroidChance: 0.16,
  },
  {
    level: 7,
    duration: 52,
    spawnRate: 1.25,
    enemySpeed: 54,
    powerRate: 6,
    phases: [
      { at: 0, pool: ["edge", "snake", "armor"], spawnMod: 1 },
      { at: 0.55, pool: ["rammer", "edge", "elite"], spawnMod: 0.86 },
    ],
    asteroidChance: 0.18,
  },
  {
    level: 8,
    duration: 54,
    spawnRate: 1.2,
    enemySpeed: 56,
    powerRate: 5.8,
    phases: [
      { at: 0, pool: ["armor", "snake", "edge"], spawnMod: 1 },
      { at: 0.55, pool: ["rammer", "elite", "edge"], spawnMod: 0.84 },
    ],
    asteroidChance: 0.2,
  },
  {
    level: 9,
    duration: 56,
    spawnRate: 1.15,
    enemySpeed: 58,
    powerRate: 5.6,
    phases: [
      { at: 0, pool: ["armor", "edge", "elite"], spawnMod: 1 },
      { at: 0.55, pool: ["rammer", "snake", "elite"], spawnMod: 0.82 },
    ],
    asteroidChance: 0.22,
  },
  {
    level: 10,
    duration: 58,
    spawnRate: 1.1,
    enemySpeed: 60,
    powerRate: 5.4,
    phases: [
      { at: 0, pool: ["edge", "armor", "elite"], spawnMod: 1 },
      { at: 0.55, pool: ["rammer", "elite", "snake"], spawnMod: 0.8 },
    ],
    asteroidChance: 0.24,
  },
  {
    level: 11,
    duration: 60,
    spawnRate: 1.05,
    enemySpeed: 62,
    powerRate: 5.2,
    phases: [
      { at: 0, pool: ["elite", "edge", "armor"], spawnMod: 1 },
      { at: 0.5, pool: ["rammer", "elite", "snake"], spawnMod: 0.78 },
    ],
    asteroidChance: 0.26,
  },
  {
    level: 12,
    duration: 62,
    spawnRate: 1,
    enemySpeed: 64,
    powerRate: 5,
    phases: [
      { at: 0, pool: ["elite", "armor", "snake"], spawnMod: 1 },
      { at: 0.5, pool: ["rammer", "elite", "edge"], spawnMod: 0.76 },
    ],
    asteroidChance: 0.28,
  },
  {
    level: 13,
    duration: 64,
    spawnRate: 0.95,
    enemySpeed: 66,
    powerRate: 4.8,
    phases: [
      { at: 0, pool: ["elite", "edge", "armor"], spawnMod: 1 },
      { at: 0.5, pool: ["rammer", "elite", "snake"], spawnMod: 0.75 },
    ],
    asteroidChance: 0.3,
  },
  {
    level: 14,
    duration: 66,
    spawnRate: 0.9,
    enemySpeed: 68,
    powerRate: 4.6,
    phases: [
      { at: 0, pool: ["elite", "armor", "edge"], spawnMod: 1 },
      { at: 0.5, pool: ["rammer", "elite", "snake"], spawnMod: 0.72 },
    ],
    asteroidChance: 0.32,
  },
  {
    level: 15,
    duration: 70,
    spawnRate: 0.85,
    enemySpeed: 70,
    powerRate: 4.4,
    phases: [
      { at: 0, pool: ["elite", "armor", "edge"], spawnMod: 1 },
      { at: 0.45, pool: ["rammer", "elite", "snake"], spawnMod: 0.7 },
    ],
    asteroidChance: 0.34,
  },
];

const musicTracks = buildMusicTracks();

function buildMusicTracks() {
  // Tracker-style procedural music generator inspired by autotracker.
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
  const scale = pickScale(mood);
  const patternLength = 16;
  const progression = pickProgression(rng, mood);
  const steps = [];

  for (let i = 0; i < patternLength; i += 1) {
    const chordIndex = progression[Math.floor(i / 4) % progression.length];
    const chordMidi = buildChord(root, scale, chordIndex);
    const chordFreq = chordMidi.map(midiToFreq);
    const bassMidi = root - 12 + scale[chordIndex];
    const melodyMidi = rng() < 0.72
      ? pickMelodyNote(rng, root + 12, scale, chordMidi)
      : null;
    const stepDrum = pickDrum(i, rng);

    steps.push({
      melody: melodyMidi ? midiToFreq(melodyMidi) : null,
      bass: midiToFreq(bassMidi),
      chord: i % 4 === 0 ? chordFreq : null,
      drum: stepDrum,
    });
  }

  const tempoVariance = 0.9 + rng() * 0.2;
  return {
    tempo: Math.floor(tempo * tempoVariance),
    steps,
  };
}

function pickProgression(rng, mood) {
  if (mood === "tense") return rng() < 0.5 ? [0, 5, 1, 6] : [0, 3, 5, 4];
  if (mood === "mystic") return rng() < 0.5 ? [0, 4, 2, 5] : [0, 5, 3, 2];
  if (mood === "bright") return rng() < 0.5 ? [0, 3, 4, 5] : [0, 4, 5, 3];
  return rng() < 0.5 ? [0, 5, 3, 4] : [0, 4, 1, 5];
}

function buildChord(root, scale, degree) {
  const base = scale[degree % scale.length];
  const third = scale[(degree + 2) % scale.length];
  const fifth = scale[(degree + 4) % scale.length];
  const thirdAdjust = third < base ? 12 : 0;
  const fifthAdjust = fifth < third ? 12 : 0;
  return [
    root + base,
    root + third + thirdAdjust,
    root + fifth + fifthAdjust,
  ];
}

function pickMelodyNote(rng, base, scale, chordMidi) {
  if (rng() < 0.6) {
    const chordChoice = chordMidi[Math.floor(rng() * chordMidi.length)];
    return chordChoice + (rng() < 0.3 ? 12 : 0);
  }
  const step = scale[Math.floor(rng() * scale.length)];
  return base + step + (rng() < 0.2 ? 12 : 0);
}

function pickDrum(step, rng) {
  if (step % 8 === 0) return "kick";
  if (step % 8 === 4) return "snare";
  if (step % 2 === 0 && rng() < 0.8) return "hat";
  return null;
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
  easy: { spawn: 1.12, speed: 0.95, power: 0.92, boss: 0.9, hp: 0.9, damage: 0.85, drop: 1.15, reward: 0.95 },
  medium: { spawn: 1, speed: 1, power: 1, boss: 1, hp: 1, damage: 1, drop: 1, reward: 1 },
  hard: { spawn: 0.92, speed: 1.08, power: 1.08, boss: 1.1, hp: 1.15, damage: 1.1, drop: 0.92, reward: 1.1 },
  insane: { spawn: 0.86, speed: 1.16, power: 1.15, boss: 1.2, hp: 1.28, damage: 1.2, drop: 0.85, reward: 1.2 },
};

const coinRewards = {
  enemies: {
    scout: 6,
    shooter: 8,
    edge: 9,
    rammer: 10,
    snake: 10,
    armor: 14,
    elite: 18,
    rock: 4,
  },
  levelBonus: {
    1: 40,
    2: 48,
    3: 58,
    4: 68,
    5: 80,
    6: 92,
    7: 105,
    8: 120,
    9: 136,
    10: 154,
    11: 172,
    12: 192,
    13: 214,
    14: 238,
    15: 264,
  },
  bossBonus: {
    1: 120,
    2: 180,
    3: 240,
  },
};

const shipUpgradeConfig = {
  damage: { label: "Урон", maxLevel: 10, percentPerLevel: 0.05, baseCost: 90 },
  hp: { label: "Корпус", maxLevel: 10, percentPerLevel: 0.06, baseCost: 85 },
  speed: { label: "Скорость", maxLevel: 10, percentPerLevel: 0.04, baseCost: 95 },
  fireRate: { label: "Темп огня", maxLevel: 10, percentPerLevel: 0.05, baseCost: 100 },
};

const saveDataKey = "cosmoprado-save";

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
  hazards: [],
  lasers: [],
  powerups: [],
  effects: [],
  starfield: [],
  farStars: [],
  lastEnemy: 0,
  lastPower: 0,
  lastHazard: 0,
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
  adminEnabled: false,
  adminBuffer: "",
  saveData: null,
  levelCoins: { kills: 0, bonus: 0, total: 0 },
  levelSummary: null,
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

const bossAttackPatterns = {
  orbRing: {
    type: "orbs",
    count: 12,
    speed: 120,
    spread: Math.PI * 2,
    radius: 0.32,
    cooldown: 2.6,
  },
  orbSpiral: {
    type: "orbs",
    count: 8,
    speed: 150,
    spread: Math.PI,
    radius: 0.18,
    cooldown: 2.2,
  },
  missiles: {
    type: "missiles",
    count: 3,
    speed: 180,
    turnRate: 2.8,
    cooldown: 2.4,
  },
  asteroids: {
    type: "asteroids",
    count: 3,
    speed: 90,
    cooldown: 3,
  },
  asteroidShower: {
    type: "asteroids",
    count: 5,
    speed: 110,
    cooldown: 3.2,
  },
  laserSweep: {
    type: "laser",
    count: 3,
    width: 16,
    duration: 1.1,
    telegraph: 0.7,
    cooldown: 3.4,
  },
  laserPair: {
    type: "laser",
    count: 2,
    width: 14,
    duration: 0.9,
    telegraph: 0.6,
    cooldown: 2.8,
  },
  burstFan: {
    type: "burst",
    count: 5,
    spread: 0.3,
    speed: 180,
    cooldown: 2,
  },
};

const bossProfiles = [
  {
    kind: 0,
    attacks: [
      { id: "orbRing", weight: 3 },
      { id: "missiles", weight: 2 },
      { id: "laserPair", weight: 2 },
      { id: "asteroids", weight: 1 },
    ],
    phases: {
      1: { cooldownMod: 1 },
      2: { cooldownMod: 0.85 },
      3: { cooldownMod: 0.72 },
    },
  },
  {
    kind: 1,
    attacks: [
      { id: "orbSpiral", weight: 3 },
      { id: "asteroidShower", weight: 2 },
      { id: "laserSweep", weight: 2 },
      { id: "burstFan", weight: 2 },
    ],
    phases: {
      1: { cooldownMod: 1 },
      2: { cooldownMod: 0.82 },
      3: { cooldownMod: 0.7 },
    },
  },
  {
    kind: 2,
    attacks: [
      { id: "missiles", weight: 3 },
      { id: "orbRing", weight: 2 },
      { id: "laserSweep", weight: 2 },
      { id: "asteroids", weight: 1 },
    ],
    phases: {
      1: { cooldownMod: 1 },
      2: { cooldownMod: 0.86 },
      3: { cooldownMod: 0.74 },
    },
  },
];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const rand = (min, max) => Math.random() * (max - min) + min;

function pickWeighted(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = rand(0, total);
  for (const item of items) {
    if (roll <= item.weight) return item;
    roll -= item.weight;
  }
  return items[0];
}

function resizeCanvas() {
  const width = Math.floor(canvas.clientWidth);
  const height = Math.floor(canvas.clientHeight);
  canvas.width = width;
  canvas.height = height;
  const scale = Math.max(1, Math.min(width / GAME_WIDTH, height / GAME_HEIGHT));
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
  const weaponLevel = state.saveData?.weaponUpgrades?.[state.saveData?.selectedWeaponId] || 0;
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
    weaponMax: weaponLevel + 1,
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
  const base = levelConfigs[state.levelIndex];
  const diff = getDifficulty();
  const phase = getActiveLevelPhase(base, state.levelTimer);
  const spawnRate = base.spawnRate * (phase?.spawnMod || 1);
  return {
    ...base,
    spawnRate: spawnRate * diff.spawn,
    enemySpeed: base.enemySpeed * diff.speed,
    powerRate: base.powerRate * diff.power,
    bossScale: diff.boss,
    hpScale: diff.hp,
    damageScale: diff.damage,
    dropScale: diff.drop,
    rewardScale: diff.reward,
    phase,
  };
}

function getActiveLevelPhase(level, timer) {
  if (!level || !level.phases) return null;
  const progress = timer / level.duration;
  let active = level.phases[0];
  level.phases.forEach((phase) => {
    if (progress >= phase.at) {
      active = phase;
    }
  });
  return active;
}

function setDifficulty(value) {
  if (!difficultySettings[value]) return;
  state.difficulty = value;
  difficultyButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.difficulty === value);
  });
}

function createDefaultSaveData() {
  return {
    version: 2,
    coins: 0,
    ownedShips: ["scout"],
    selectedShipId: "scout",
    ownedWeapons: ["blaster"],
    selectedWeaponId: "blaster",
    shipUpgrades: { damage: 0, hp: 0, speed: 0, fireRate: 0 },
    weaponUpgrades: { blaster: 0 },
  };
}

function migrateLegacySaveData(data) {
  if (!data || typeof data !== "object") return createDefaultSaveData();
  const migrated = createDefaultSaveData();
  if (typeof data.coins === "number") migrated.coins = data.coins;
  if (Array.isArray(data.ownedShips)) migrated.ownedShips = data.ownedShips;
  if (typeof data.selectedShipId === "string") migrated.selectedShipId = data.selectedShipId;
  if (Array.isArray(data.ownedWeapons)) migrated.ownedWeapons = data.ownedWeapons;
  if (typeof data.selectedWeaponId === "string") migrated.selectedWeaponId = data.selectedWeaponId;
  if (data.shipUpgrades && typeof data.shipUpgrades === "object") {
    migrated.shipUpgrades = { ...migrated.shipUpgrades, ...data.shipUpgrades };
  }
  if (data.weaponUpgrades && typeof data.weaponUpgrades === "object") {
    migrated.weaponUpgrades = { ...migrated.weaponUpgrades, ...data.weaponUpgrades };
  }
  const legacyWeaponLevel = Number(
    data.weaponLevel ?? data.weapon?.level ?? data.weaponUpgradeLevel ?? 0
  );
  if (legacyWeaponLevel > 0) {
    migrated.coins += Math.round(legacyWeaponLevel * 40);
  }
  const legacyWeaponType = data.weaponType ?? data.weapon?.type;
  if (legacyWeaponType && weaponCatalog[legacyWeaponType]) {
    migrated.ownedWeapons = Array.from(new Set(migrated.ownedWeapons.concat(legacyWeaponType)));
    migrated.selectedWeaponId = legacyWeaponType;
  }
  return migrated;
}

function normalizeSaveData(data) {
  const normalized = migrateLegacySaveData(data);
  normalized.ownedShips = normalized.ownedShips.filter((id) => shipCatalogMap[id]);
  if (!normalized.ownedShips.length) normalized.ownedShips = ["scout"];
  if (!shipCatalogMap[normalized.selectedShipId]) {
    normalized.selectedShipId = normalized.ownedShips[0];
  }
  normalized.ownedWeapons = normalized.ownedWeapons.filter((id) => weaponCatalog[id]);
  if (!normalized.ownedWeapons.length) normalized.ownedWeapons = ["blaster"];
  if (!weaponCatalog[normalized.selectedWeaponId]) {
    normalized.selectedWeaponId = normalized.ownedWeapons[0];
  }
  Object.keys(shipUpgradeConfig).forEach((key) => {
    const current = Number(normalized.shipUpgrades?.[key] ?? 0);
    const max = shipUpgradeConfig[key].maxLevel;
    normalized.shipUpgrades[key] = clamp(current, 0, max);
  });
  normalized.weaponUpgrades = normalized.weaponUpgrades || {};
  Object.keys(weaponCatalog).forEach((weaponId) => {
    const max = weaponCatalog[weaponId].levels.length - 1;
    const current = Number(normalized.weaponUpgrades[weaponId] ?? 0);
    normalized.weaponUpgrades[weaponId] = clamp(current, 0, max);
  });
  return normalized;
}

function loadSaveData() {
  try {
    const raw = localStorage.getItem(saveDataKey);
    const parsed = raw ? JSON.parse(raw) : null;
    return normalizeSaveData(parsed);
  } catch (error) {
    return createDefaultSaveData();
  }
}

function saveGameData() {
  if (!state.saveData) return;
  localStorage.setItem(saveDataKey, JSON.stringify(state.saveData));
}

function grantCoins(amount) {
  if (!state.saveData || amount <= 0) return;
  state.saveData.coins = Math.max(0, Math.floor(state.saveData.coins + amount));
}

function addCoinReward(amount, bucket = "kills") {
  const reward = Math.max(0, Math.round(amount));
  if (reward <= 0) return;
  state.levelCoins[bucket] = (state.levelCoins[bucket] || 0) + reward;
  state.levelCoins.total += reward;
  grantCoins(reward);
  saveGameData();
}

function resetLevelCoins() {
  state.levelCoins = { kills: 0, bonus: 0, total: 0 };
}

function getShipUpgradeCost(key, level) {
  const config = shipUpgradeConfig[key];
  const base = config.baseCost;
  return Math.round(base * Math.pow(level + 1, 1.45));
}

function getWeaponUpgradeCost(weaponId, level) {
  const weapon = weaponCatalog[weaponId];
  if (!weapon) return 0;
  return Math.round(weapon.upgradeBaseCost * Math.pow(level + 1, 1.4));
}

function getShipStats(shipId, upgrades) {
  const ship = shipCatalogMap[shipId] || shipCatalog[0];
  const damageLevel = upgrades.damage || 0;
  const hpLevel = upgrades.hp || 0;
  const speedLevel = upgrades.speed || 0;
  const fireRateLevel = upgrades.fireRate || 0;
  const damageMultiplier = ship.baseStats.damageMultiplier * (1 + damageLevel * shipUpgradeConfig.damage.percentPerLevel);
  const fireRateMultiplier = ship.baseStats.fireRateMultiplier * (1 + fireRateLevel * shipUpgradeConfig.fireRate.percentPerLevel);
  const speed = ship.baseStats.speed * (1 + speedLevel * shipUpgradeConfig.speed.percentPerLevel);
  const maxHp = Math.round(ship.baseStats.hp * (1 + hpLevel * shipUpgradeConfig.hp.percentPerLevel));
  return {
    ship,
    damageMultiplier,
    fireRateMultiplier,
    speed,
    maxHp,
    hitboxScale: ship.baseStats.hitboxScale,
  };
}

function getWeaponLevelConfig(type, level) {
  const config = weaponCatalog[type] || weaponCatalog.blaster;
  const idx = clamp(level, 0, config.levels.length - 1);
  return {
    ...config.levels[idx],
    name: config.name,
    color: config.color,
    maxLevel: config.levels.length - 1,
  };
}

function getPowerRating(shipStats, weaponStats) {
  const base = shipStats.maxHp * 12 + shipStats.speed * 0.25;
  const dmg = weaponStats.damage * weaponStats.shots * shipStats.damageMultiplier * 18;
  return Math.round(base + dmg + shipStats.fireRateMultiplier * 60);
}

function updateAdminPanelVisibility() {
  if (state.adminEnabled && state.phase === "pause") {
    adminPanel.classList.remove("hidden");
  } else {
    adminPanel.classList.add("hidden");
  }
}

function populateAdminLevels() {
  adminLevelSelect.innerHTML = levelConfigs
    .map((level, index) => `<option value="${index}">УРОВЕНЬ ${level.level}</option>`)
    .join("");
}

function showHangarMessage(text) {
  if (!hangarMessage) return;
  hangarMessage.textContent = text;
  hangarMessage.classList.add("visible");
  setTimeout(() => {
    hangarMessage.classList.remove("visible");
  }, 1600);
}

function renderHangar() {
  if (!state.saveData) return;
  const saveData = state.saveData;
  const shipStats = getShipStats(saveData.selectedShipId, saveData.shipUpgrades);
  const weaponLevel = saveData.weaponUpgrades[saveData.selectedWeaponId] || 0;
  const weaponStats = getWeaponLevelConfig(saveData.selectedWeaponId, weaponLevel);
  if (hangarCoins) {
    hangarCoins.textContent = `💰 ${saveData.coins}`;
  }
  drawHangarShipPreview(shipStats.ship);
  hangarShipName.textContent = shipStats.ship.name;
  hangarShipClass.textContent = `${shipStats.ship.rarity} · ${shipStats.ship.class}`;
  hangarShipTrait.textContent = shipStats.ship.trait;
  hangarShipStats.innerHTML = `
    <div>HP: ${shipStats.maxHp}</div>
    <div>Скорость: ${Math.round(shipStats.speed)}</div>
    <div>Урон: x${shipStats.damageMultiplier.toFixed(2)}</div>
    <div>Огонь: x${shipStats.fireRateMultiplier.toFixed(2)}</div>
  `;
  hangarShipPower.textContent = `Мощь: ${getPowerRating(shipStats, weaponStats)}`;

  hangarShips.innerHTML = shipCatalog
    .map((ship) => {
      const owned = saveData.ownedShips.includes(ship.id);
      const selected = saveData.selectedShipId === ship.id;
      const actionLabel = selected ? "ВЫБРАН" : owned ? "ВЫБРАТЬ" : `КУПИТЬ · ${ship.price}`;
      return `
        <div class="hangar-card ${selected ? "active" : ""}">
          <div class="hangar-card-title">${ship.name}</div>
          <div class="hangar-card-sub">${ship.rarity} · ${ship.class}</div>
          <div class="hangar-card-trait">${ship.trait}</div>
          <div class="hangar-card-stats">HP ${ship.baseStats.hp} · SPD ${Math.round(ship.baseStats.speed)}</div>
          <button class="hangar-action" data-action="${owned ? "select-ship" : "buy-ship"}" data-ship-id="${ship.id}" ${selected ? "disabled" : ""}>
            ${actionLabel}
          </button>
        </div>
      `;
    })
    .join("");

  hangarWeapons.innerHTML = Object.values(weaponCatalog)
    .map((weapon) => {
      const owned = saveData.ownedWeapons.includes(weapon.id);
      const selected = saveData.selectedWeaponId === weapon.id;
      const actionLabel = selected ? "ВЫБРАНО" : owned ? "ВЫБРАТЬ" : `КУПИТЬ · ${weapon.price}`;
      const currentLevel = saveData.weaponUpgrades[weapon.id] || 0;
      return `
        <div class="hangar-card ${selected ? "active" : ""}">
          <div class="hangar-card-title">${weapon.name}</div>
          <div class="hangar-card-sub">Уровень ${currentLevel + 1}/${weapon.levels.length}</div>
          <div class="hangar-card-stats">DMG ${weapon.levels[0].damage} · CD ${weapon.levels[0].fireRate}</div>
          <button class="hangar-action" data-action="${owned ? "select-weapon" : "buy-weapon"}" data-weapon-id="${weapon.id}" ${selected ? "disabled" : ""}>
            ${actionLabel}
          </button>
        </div>
      `;
    })
    .join("");

  const shipUpgradeHtml = Object.entries(shipUpgradeConfig)
    .map(([key, config]) => {
      const level = saveData.shipUpgrades[key] || 0;
      const max = config.maxLevel;
      const nextCost = level < max ? getShipUpgradeCost(key, level) : null;
      const gainLabel = `+${Math.round(config.percentPerLevel * 100)}%`;
      return `
        <div class="hangar-upgrade-card">
          <div class="hangar-upgrade-title">${config.label}</div>
          <div class="hangar-upgrade-sub">Уровень ${level}/${max}</div>
          <div class="hangar-upgrade-sub">След. бонус ${gainLabel}</div>
          <button class="hangar-action" data-action="upgrade-ship" data-upgrade-key="${key}" ${level >= max ? "disabled" : ""}>
            ${level >= max ? "МАКС" : `АПГРЕЙД · ${nextCost}`}
          </button>
        </div>
      `;
    })
    .join("");

  const weaponUpgradeHtml = (() => {
    const weaponId = saveData.selectedWeaponId;
    const weapon = weaponCatalog[weaponId];
    if (!weapon) return "";
    const level = saveData.weaponUpgrades[weaponId] || 0;
    const max = weapon.levels.length - 1;
    const nextCost = level < max ? getWeaponUpgradeCost(weaponId, level) : null;
    const current = weapon.levels[level];
    const next = weapon.levels[Math.min(level + 1, max)];
    const upgradeDelta = level < max
      ? `DMG ${next.damage - current.damage >= 0 ? "+" : ""}${(next.damage - current.damage).toFixed(1)} · SHOTS ${next.shots - current.shots >= 0 ? "+" : ""}${next.shots - current.shots}`
      : "МАКС. УРОВЕНЬ";
    return `
      <div class="hangar-upgrade-card wide">
        <div class="hangar-upgrade-title">Оружие: ${weapon.name}</div>
        <div class="hangar-upgrade-sub">Уровень ${level + 1}/${weapon.levels.length}</div>
        <div class="hangar-upgrade-sub">${upgradeDelta}</div>
        <button class="hangar-action" data-action="upgrade-weapon" data-weapon-id="${weaponId}" ${level >= max ? "disabled" : ""}>
          ${level >= max ? "МАКС" : `АПГРЕЙД · ${nextCost}`}
        </button>
      </div>
    `;
  })();

  hangarUpgrades.innerHTML = shipUpgradeHtml + weaponUpgradeHtml;
}

function openHangar() {
  state.phase = "hangar";
  startOverlay.classList.add("hidden");
  endOverlay.classList.add("hidden");
  pauseOverlay.classList.add("hidden");
  hangarOverlay.classList.remove("hidden");
  renderHangar();
  if (state.audio) {
    switchMusic("menu");
  }
}

function closeHangar() {
  hangarOverlay.classList.add("hidden");
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

function handleAdminCodeInput(key, target) {
  const tag = target?.tagName?.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return;
  if (!/^[0-9]$/.test(key)) return;
  state.adminBuffer = `${state.adminBuffer}${key}`.slice(-4);
  if (state.adminBuffer === "7777") {
    state.adminEnabled = true;
    updateAdminPanelVisibility();
  }
}

function buildPlayerForLevel({ preserveProgress }) {
  const saveData = state.saveData || createDefaultSaveData();
  const prev = state.player;
  const shipStats = getShipStats(saveData.selectedShipId, saveData.shipUpgrades);
  const weaponType = saveData.selectedWeaponId;
  const weaponLevel = saveData.weaponUpgrades[weaponType] || 0;
  const weapon = preserveProgress && prev ? prev.weapon : { type: weaponType, level: weaponLevel };
  const hitboxScale = shipStats.hitboxScale || 1;
  const hp = preserveProgress && prev ? Math.min(prev.hp, shipStats.maxHp) : shipStats.maxHp;
  const shield = preserveProgress && prev ? prev.shield : 0;
  state.player = {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT * 0.75,
    width: shipStats.ship.width * hitboxScale,
    height: shipStats.ship.height * hitboxScale,
    speed: shipStats.speed,
    baseFireRate: 3 * shipStats.fireRateMultiplier,
    hp,
    maxHp: shipStats.maxHp,
    shield,
    weapon,
    damageMultiplier: shipStats.damageMultiplier,
    skin: shipStats.ship,
    invuln: 0,
  };
  state.stats.weaponMax = Math.max(state.stats.weaponMax, weapon.level + 1);
}

function resetLevel() {
  state.levelTimer = 0;
  state.levelBannerTimer = 1.8;
  state.bullets = [];
  state.enemies = [];
  state.enemyBullets = [];
  state.hazards = [];
  state.lasers = [];
  state.powerups = [];
  state.effects = [];
  state.lastEnemy = 0;
  state.lastPower = 0;
  state.lastHazard = 0;
  state.lastShot = 0;
  state.showMiss = 0;
  state.boss = null;
  state.bossBannerTimer = 0;
  bossBar.classList.remove("visible");
  bossBanner.classList.add("hidden");
  resetLevelCoins();
  buildPlayerForLevel({ preserveProgress: true });
  showLevelBanner();
  playSfx("level");
  if (levelConfigs[state.levelIndex].level % 5 === 0) {
    startBossFight();
  }
}

function jumpToLevel(index) {
  const nextIndex = clamp(index, 0, levelConfigs.length - 1);
  state.levelIndex = nextIndex;
  resetLevel();
  switchMusic(getLevelTrack(levelConfigs[state.levelIndex].level));
  if (state.phase === "pause") {
    state.phase = "play";
    pauseOverlay.classList.add("hidden");
  }
  updateAdminPanelVisibility();
}

function startBossFight() {
  const level = levelConfigs[state.levelIndex].level;
  const bossIndex = Math.floor(level / 5);
  const diff = getDifficulty();
  const maxHp = Math.floor(90 * Math.pow(1.3, bossIndex) * diff.boss);
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
    attackTimer: 1.6,
    kind,
    moveDir: 1,
    minionTimer: 6,
    attackHistory: [],
    activeAttack: null,
  };
  bossBanner.textContent = `БОСС: ${state.boss.name}`;
  bossBanner.classList.remove("hidden");
  state.bossBannerTimer = 1.8;
  bossBar.classList.add("visible");
  bossNameLabel.textContent = state.boss.name;
  bossHealthFill.style.width = "100%";
  spawnPowerup(GAME_WIDTH * 0.3, -10, "shield");
  playBossIntro();
  setTimeout(() => switchMusic("boss"), 900);
}

function showLevelBanner() {
  levelBanner.textContent = `УРОВЕНЬ ${levelConfigs[state.levelIndex].level}`;
  levelBanner.classList.remove("hidden");
}

function hideLevelBanner() {
  levelBanner.classList.add("hidden");
}

function showSummaryOverlay() {
  if (!state.levelSummary) return;
  summaryLevel.textContent = `УРОВЕНЬ ${state.levelSummary.level}`;
  summaryCoinsKills.textContent = `${state.levelSummary.kills}`;
  summaryCoinsBonus.textContent = `${state.levelSummary.bonus}`;
  summaryCoinsTotal.textContent = `${state.levelSummary.total}`;
  summaryOverlay.classList.remove("hidden");
}

function hideSummaryOverlay() {
  summaryOverlay.classList.add("hidden");
}

function triggerLevelSummary({ bossDefeated, finalLevel }) {
  const levelNumber = levelConfigs[state.levelIndex].level;
  const diff = getDifficulty();
  const levelBonus = (coinRewards.levelBonus[levelNumber] || 0) * diff.reward;
  let bonusReward = levelBonus;
  if (bossDefeated) {
    const bossTier = Math.max(1, Math.floor(levelNumber / 5));
    bonusReward += (coinRewards.bossBonus[bossTier] || coinRewards.bossBonus[3] || 0) * diff.reward;
  }
  if (bonusReward > 0) {
    addCoinReward(bonusReward, "bonus");
  }
  state.levelSummary = {
    level: levelNumber,
    kills: state.levelCoins.kills,
    bonus: state.levelCoins.bonus,
    total: state.levelCoins.total,
    finalLevel,
  };
  state.phase = "summary";
  showSummaryOverlay();
}

function continueAfterSummary() {
  if (!state.levelSummary) return;
  const { finalLevel } = state.levelSummary;
  hideSummaryOverlay();
  state.levelSummary = null;
  if (finalLevel) {
    endGame(true);
    return;
  }
  state.levelIndex += 1;
  resetLevel();
  switchMusic(getLevelTrack(levelConfigs[state.levelIndex].level));
  state.phase = "play";
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
  hideSummaryOverlay();
  state.levelSummary = null;
  saveResultButton.disabled = false;
  saveResultButton.textContent = "СОХРАНИТЬ РЕЗУЛЬТАТ";
  playerNameInput.disabled = false;
  resetStats();
  state.player = null;
  resetLevel();
  playerNameInput.value = state.stats.playerName || "";
  initAudio();
  switchMusic(getLevelTrack(levelConfigs[state.levelIndex].level));
}

function endGame(win) {
  state.phase = "end";
  state.runSaved = false;
  endOverlay.classList.remove("hidden");
  bossBar.classList.remove("visible");
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
    adminLevelSelect.value = String(state.levelIndex);
    updateAdminPanelVisibility();
  } else {
    state.phase = "play";
    pauseOverlay.classList.add("hidden");
    updateAdminPanelVisibility();
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
  state.audio.noiseBuffer = createNoiseBuffer(state.audio);
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
    const beat = track.steps[index % track.steps.length];
    if (beat.melody) {
      playMusicTone(beat.melody, 0.16, "square", 0.1);
    }
    if (index % 2 === 0) {
      playMusicTone(beat.bass, 0.2, "triangle", 0.08);
    }
    if (beat.chord) {
      beat.chord.forEach((freq) => playMusicTone(freq, 0.12, "sawtooth", 0.04));
    }
    if (beat.drum) {
      playDrum(beat.drum);
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

function playDrum(type) {
  if (!state.audio || !state.soundOn) return;
  const now = state.audio.currentTime;
  if (type === "kick") {
    const osc = state.audio.createOscillator();
    const gain = state.audio.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
    osc.connect(gain);
    gain.connect(state.audio.musicGain);
    osc.start(now);
    osc.stop(now + 0.14);
    return;
  }

  const noise = state.audio.createBufferSource();
  noise.buffer = state.audio.noiseBuffer;
  const filter = state.audio.createBiquadFilter();
  const gain = state.audio.createGain();
  filter.type = type === "snare" ? "bandpass" : "highpass";
  filter.frequency.value = type === "snare" ? 1800 : 6000;
  gain.gain.value = type === "snare" ? 0.1 : 0.06;
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(state.audio.musicGain);
  noise.start(now);
  noise.stop(now + (type === "snare" ? 0.12 : 0.05));
}

function createNoiseBuffer(audio) {
  const duration = 1;
  const buffer = audio.createBuffer(1, audio.sampleRate * duration, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
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
  const pool = level.phase?.pool || level.phases[0].pool;
  const typeId = pool[Math.floor(rand(0, pool.length))];
  const type = enemyConfigMap[typeId] || enemyConfigs[0];
  const isElite = type.elite;
  const width = type.armored ? 34 : isElite ? 36 : 28;
  const height = type.armored ? 38 : isElite ? 34 : 30;
  state.enemies.push({
    type,
    x: rand(30, GAME_WIDTH - 30),
    y: -40,
    width,
    height,
    speed: level.enemySpeed * type.speed,
    hp: Math.ceil((type.hp + Math.floor(state.levelIndex / 2)) * level.hpScale),
    wiggle: rand(-1, 1),
    telegraph: 0,
    fireTimer: rand(type.fireDelay * 0.6, type.fireDelay * 1.4),
    fireQueued: false,
    behaviorState: {
      phase: "cruise",
      timer: rand(0.6, 1.4),
      side: Math.random() < 0.5 ? -1 : 1,
      waveOffset: rand(0, Math.PI * 2),
    },
  });
}

function spawnAsteroid({ x = rand(30, GAME_WIDTH - 30), y = -30, size = rand(18, 32), speed = rand(60, 90), drift = rand(-20, 20) } = {}) {
  state.hazards.push({
    kind: "asteroid",
    x,
    y,
    width: size,
    height: size,
    speed,
    vx: drift,
    hp: 2,
    spin: rand(-2, 2),
    angle: rand(0, Math.PI * 2),
    damage: 1,
  });
}

function spawnPlayerBullet({ angleOffset = 0, pierce = 0, speed = 320, size = 4, damage = 1, kind = "blaster", length = 12, turnRate = 0 }) {
  state.bullets.push({
    x: state.player.x,
    y: state.player.y - 20,
    width: size,
    height: length,
    speed,
    angle: -Math.PI / 2 + angleOffset,
    pierce,
    damage,
    kind,
    turnRate,
  });
  state.stats.shots += 1;
}

function spawnEnemyBullet(enemy, angleOffset = 0, speedBoost = 0, options = {}) {
  const speed = (options.speed || 160 + state.levelIndex * 10 + speedBoost);
  state.enemyBullets.push({
    x: enemy.x,
    y: enemy.y + 18,
    width: options.size || 5,
    height: options.length || 12,
    speed,
    angle: Math.PI / 2 + angleOffset,
    kind: options.kind || "shot",
    damage: options.damage || 1,
    turnRate: options.turnRate || 0,
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

  const weaponState = state.player.weapon;
  const weapon = getWeaponLevelConfig(weaponState.type, weaponState.level);
  const fireRate = weapon.fireRate * (state.player.baseFireRate / 3);
  const delay = 1000 / fireRate;
  if (now - state.lastShot > delay) {
    state.lastShot = now;
    const spread = weapon.spread || 0;
    const shots = weapon.shots || 1;
    for (let i = 0; i < shots; i += 1) {
      const offset = (i - (shots - 1) / 2) * spread;
      spawnPlayerBullet({
        angleOffset: offset,
        pierce: weapon.pierce || 0,
        speed: weapon.speed,
        size: weapon.size,
        damage: weapon.damage * state.player.damageMultiplier,
        kind: weaponState.type,
        length: weapon.length || 12,
        turnRate: weapon.turnRate || 0,
      });
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

  if (state.time - state.lastHazard > 3.2 - level.asteroidChance * 3) {
    state.lastHazard = state.time;
    if (Math.random() < level.asteroidChance) {
      spawnAsteroid({ speed: rand(60, 90) + level.enemySpeed * 0.4 });
    }
  }

  state.enemies.forEach((enemy) => {
    if (enemy.type.behaviorType === "edge") {
      const edgeX = enemy.behaviorState.side < 0 ? 22 : GAME_WIDTH - 22;
      enemy.x += (edgeX - enemy.x) * 0.12;
      enemy.y += enemy.speed * dt;
    } else if (enemy.type.behaviorType === "rammer") {
      enemy.behaviorState.timer -= dt;
      if (enemy.behaviorState.phase === "cruise") {
        enemy.y += enemy.speed * dt;
        enemy.x += Math.sin(enemy.y * 0.03) * enemy.wiggle;
        if (enemy.behaviorState.timer <= 0) {
          enemy.behaviorState.phase = "charge";
          enemy.behaviorState.timer = 0.9;
          const angle = Math.atan2(state.player.y - enemy.y, state.player.x - enemy.x);
          enemy.behaviorState.vx = Math.cos(angle) * enemy.speed * 1.8;
          enemy.behaviorState.vy = Math.sin(angle) * enemy.speed * 1.8;
        }
      } else if (enemy.behaviorState.phase === "charge") {
        enemy.x += enemy.behaviorState.vx * dt;
        enemy.y += enemy.behaviorState.vy * dt;
        if (enemy.behaviorState.timer <= 0 || enemy.y > state.player.y + 60) {
          enemy.behaviorState.phase = "rebound";
          enemy.behaviorState.timer = 0.6;
          enemy.behaviorState.vx *= -0.4;
          enemy.behaviorState.vy = -Math.abs(enemy.behaviorState.vy) * 0.5;
        }
      } else if (enemy.behaviorState.phase === "rebound") {
        enemy.x += enemy.behaviorState.vx * dt;
        enemy.y += enemy.behaviorState.vy * dt;
        if (enemy.behaviorState.timer <= 0) {
          enemy.behaviorState.phase = "cruise";
          enemy.behaviorState.timer = rand(0.8, 1.4);
        }
      }
    } else if (enemy.type.behaviorType === "snake") {
      enemy.y += enemy.speed * dt;
      enemy.x += Math.sin(enemy.y * 0.06 + enemy.behaviorState.waveOffset) * 6;
    } else {
      enemy.y += enemy.speed * dt;
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
      if (enemy.type.fireDelay > 0) {
        enemy.fireTimer -= dt;
        if (enemy.fireTimer <= 0) {
          enemy.telegraph = 0.3;
          enemy.fireQueued = true;
        }
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

function getBossProfile(boss) {
  return bossProfiles.find((profile) => profile.kind === boss.kind) || bossProfiles[0];
}

function chooseBossAttack(boss) {
  const profile = getBossProfile(boss);
  const history = boss.attackHistory.slice(-2);
  let candidates = profile.attacks;
  if (history.length >= 2 && history[0] === history[1]) {
    candidates = profile.attacks.filter((attack) => attack.id !== history[0]);
  }
  const picked = pickWeighted(candidates.length ? candidates : profile.attacks);
  boss.attackHistory.push(picked.id);
  if (boss.attackHistory.length > 6) {
    boss.attackHistory.shift();
  }
  return bossAttackPatterns[picked.id];
}

function spawnBossOrbs(boss, pattern) {
  const count = pattern.count;
  const angleStart = -Math.PI / 2 - pattern.spread / 2;
  const step = pattern.spread / (count - 1 || 1);
  for (let i = 0; i < count; i += 1) {
    const angle = angleStart + step * i;
    state.enemyBullets.push({
      x: boss.x,
      y: boss.y + 18,
      width: 6,
      height: 6,
      speed: pattern.speed,
      angle,
      kind: "orb",
      damage: 1,
      turnRate: 0,
    });
  }
}

function spawnBossMissiles(boss, pattern) {
  for (let i = 0; i < pattern.count; i += 1) {
    const offset = (i - (pattern.count - 1) / 2) * 8;
    state.enemyBullets.push({
      x: boss.x + offset,
      y: boss.y + 12,
      width: 6,
      height: 10,
      speed: pattern.speed,
      angle: Math.PI / 2,
      kind: "missile",
      damage: 1,
      turnRate: pattern.turnRate,
    });
  }
}

function spawnBossAsteroids(boss, pattern) {
  for (let i = 0; i < pattern.count; i += 1) {
    spawnAsteroid({
      x: clamp(boss.x + rand(-60, 60), 30, GAME_WIDTH - 30),
      y: boss.y + 20,
      size: rand(22, 36),
      speed: pattern.speed + rand(-10, 10),
      drift: rand(-30, 30),
    });
  }
}

function spawnBossLaser(boss, pattern) {
  const positions = [];
  if (pattern.count === 1) {
    positions.push(boss.x);
  } else {
    const spread = 80;
    for (let i = 0; i < pattern.count; i += 1) {
      positions.push(clamp(boss.x - spread / 2 + (spread / (pattern.count - 1)) * i, 40, GAME_WIDTH - 40));
    }
  }
  positions.forEach((x) => {
    state.lasers.push({
      x,
      y: boss.y + 30,
      width: pattern.width,
      telegraph: pattern.telegraph,
      duration: pattern.duration,
      timer: pattern.telegraph,
      active: false,
    });
  });
}

function spawnBossBurst(boss, pattern) {
  const count = pattern.count;
  const angleStart = Math.PI / 2 - pattern.spread / 2;
  const step = pattern.spread / (count - 1 || 1);
  for (let i = 0; i < count; i += 1) {
    const angle = angleStart + step * i;
    state.enemyBullets.push({
      x: boss.x,
      y: boss.y + 18,
      width: 5,
      height: 12,
      speed: pattern.speed,
      angle,
      kind: "shot",
      damage: 1,
      turnRate: 0,
    });
  }
}

function updateBoss(dt) {
  const boss = state.boss;
  if (!boss) return;
  bossBar.classList.add("visible");
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
    const pattern = chooseBossAttack(boss);
    if (pattern.type === "orbs") spawnBossOrbs(boss, pattern);
    if (pattern.type === "missiles") spawnBossMissiles(boss, pattern);
    if (pattern.type === "asteroids") spawnBossAsteroids(boss, pattern);
    if (pattern.type === "laser") spawnBossLaser(boss, pattern);
    if (pattern.type === "burst") spawnBossBurst(boss, pattern);
    const profile = getBossProfile(boss);
    boss.attackTimer = pattern.cooldown * (profile.phases[boss.phase]?.cooldownMod || 1);
  }

  if (boss.phase >= 3) {
    boss.minionTimer -= dt;
    if (boss.minionTimer <= 0) {
      boss.minionTimer = 6;
      if (state.enemies.length < 2) {
        state.enemies.push({
          type: enemyConfigMap.scout,
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
          behaviorState: {
            phase: "cruise",
            timer: rand(0.6, 1.4),
            side: Math.random() < 0.5 ? -1 : 1,
            waveOffset: rand(0, Math.PI * 2),
          },
        });
      }
    }
  }

  bossHealthFill.style.width = `${Math.max(0, (boss.hp / boss.maxHp) * 100)}%`;
}

function drawPixelBoss({ x, y, kind }) {
  const unit = 2;
  const drawBlocks = (blocks, color) => {
    if (!blocks.length) return;
    ctx.fillStyle = color;
    blocks.forEach(([bx, by, bw, bh]) => {
      ctx.fillRect(x + bx * unit, y + by * unit, bw * unit, bh * unit);
    });
  };

  const styleMap = {
    0: {
      colors: {
        body: "#3fd34d",
        accent: "#8dff5c",
        core: "#ff4040",
        metal: "#2b3c54",
        glow: "#ffffff",
      },
      body: [
        [-18, -10, 36, 14],
        [-14, 4, 28, 10],
        [-6, -16, 12, 6],
      ],
      arms: [
        [-24, -6, 8, 8],
        [16, -6, 8, 8],
        [-26, 2, 6, 8],
        [20, 2, 6, 8],
      ],
      core: [[-4, -8, 8, 8]],
      accents: [
        [-10, -6, 20, 3],
        [-12, 6, 24, 3],
      ],
      glow: [[-2, -6, 4, 2]],
    },
    1: {
      colors: {
        body: "#8c92a1",
        accent: "#c8d4e6",
        core: "#ff6b6b",
        metal: "#3b3f4a",
        glow: "#ffffff",
      },
      body: [
        [-18, -9, 36, 13],
        [-16, 4, 32, 10],
        [-8, -15, 16, 6],
      ],
      arms: [
        [-26, -6, 8, 8],
        [18, -6, 8, 8],
        [-28, 2, 6, 8],
        [22, 2, 6, 8],
      ],
      core: [[-5, -7, 10, 8]],
      accents: [
        [-12, -5, 24, 3],
        [-14, 6, 28, 3],
      ],
      glow: [[-2, -6, 4, 2]],
    },
    2: {
      colors: {
        body: "#d23b32",
        accent: "#ff9f3c",
        core: "#ffd166",
        metal: "#4a1f23",
        glow: "#ffffff",
      },
      body: [
        [-18, -9, 36, 13],
        [-16, 4, 32, 10],
        [-8, -16, 16, 7],
      ],
      arms: [
        [-24, -6, 8, 8],
        [16, -6, 8, 8],
        [-28, 2, 8, 8],
        [20, 2, 8, 8],
      ],
      core: [[-5, -7, 10, 8]],
      accents: [
        [-12, -5, 24, 3],
        [-14, 6, 28, 3],
      ],
      glow: [[-2, -6, 4, 2]],
    },
  };

  const style = styleMap[kind] || styleMap[0];
  drawBlocks(style.body, style.colors.body);
  drawBlocks(style.arms, style.colors.accent);
  drawBlocks(style.accents, style.colors.accent);
  drawBlocks(style.core, style.colors.core);
  drawBlocks([[-6, -2, 12, 6]], style.colors.metal);
  drawBlocks(style.glow, style.colors.glow);
  drawBlocks(
    [
      [-14, 12, 6, 6],
      [8, 12, 6, 6],
      [-2, 12, 4, 6],
    ],
    style.colors.accent
  );
}

function drawBoss() {
  const boss = state.boss;
  if (!boss) return;
  drawPixelBoss({ x: boss.x, y: boss.y, kind: boss.kind });
}

function fireEnemy(enemy) {
  if (enemy.type.behaviorType === "edge") {
    const centerX = GAME_WIDTH / 2;
    const angle = Math.atan2(state.player.y - enemy.y, centerX - enemy.x);
    state.enemyBullets.push({
      x: enemy.x,
      y: enemy.y + 10,
      width: 5,
      height: 12,
      speed: 170,
      angle,
      kind: "shot",
      damage: 1,
      turnRate: 0,
    });
    return;
  }
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
    if (bullet.kind === "missile" && bullet.turnRate) {
      const target = findNearestTarget(bullet.x, bullet.y);
      if (target) {
        const desired = Math.atan2(target.y - bullet.y, target.x - bullet.x);
        const diff = normalizeAngle(desired - bullet.angle);
        bullet.angle += clamp(diff, -bullet.turnRate * dt, bullet.turnRate * dt);
      }
    }
    bullet.y += Math.sin(bullet.angle) * bullet.speed * dt;
    bullet.x += Math.cos(bullet.angle) * bullet.speed * dt;
    return bullet.y > -40;
  });

  state.enemyBullets = state.enemyBullets.filter((bullet) => {
    if (bullet.kind === "missile" && bullet.turnRate) {
      const desired = Math.atan2(state.player.y - bullet.y, state.player.x - bullet.x);
      const diff = normalizeAngle(desired - bullet.angle);
      bullet.angle += clamp(diff, -bullet.turnRate * dt, bullet.turnRate * dt);
    }
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

function updateHazards(dt) {
  state.hazards = state.hazards.filter((hazard) => {
    hazard.y += hazard.speed * dt;
    hazard.x += hazard.vx * dt;
    hazard.angle += hazard.spin * dt;
    return hazard.y < GAME_HEIGHT + 40;
  });
}

function updateLasers(dt) {
  state.lasers = state.lasers.filter((laser) => {
    laser.timer -= dt;
    if (!laser.active && laser.timer <= 0) {
      laser.active = true;
      laser.timer = laser.duration;
    }
    return laser.timer > 0;
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

function normalizeAngle(angle) {
  let value = angle;
  while (value > Math.PI) value -= Math.PI * 2;
  while (value < -Math.PI) value += Math.PI * 2;
  return value;
}

function findNearestTarget(x, y) {
  let target = null;
  let best = Infinity;
  state.enemies.forEach((enemy) => {
    const dist = Math.hypot(enemy.x - x, enemy.y - y);
    if (dist < best) {
      best = dist;
      target = enemy;
    }
  });
  if (state.boss) {
    const dist = Math.hypot(state.boss.x - x, state.boss.y - y);
    if (dist < best) {
      target = state.boss;
    }
  }
  return target;
}

function handleCollisions() {
  state.bullets.forEach((bullet) => {
    state.enemies.forEach((enemy) => {
      if (enemy.hp <= 0) return;
      if (intersects({ x: bullet.x, y: bullet.y, width: bullet.width, height: bullet.height }, enemy)) {
        enemy.hp -= bullet.damage || 1;
        spawnEffect(enemy.x, enemy.y, "ПОПАДАНИЕ", "#ffe66d");
        playSfx("hit");
        state.stats.hits += 1;
        if (bullet.pierce > 0) {
          bullet.pierce -= 1;
        } else {
          bullet.y = -999;
        }
        if (enemy.hp <= 0) {
          const level = getLevelConfig();
          const scoreBoost = level.rewardScale || 1;
          state.score += Math.round((enemy.type.score || 150) * scoreBoost);
          state.stats.kills += 1;
          state.stats.combo += 1;
          state.stats.bestCombo = Math.max(state.stats.bestCombo, state.stats.combo);
          state.screenShake = 6;
          spawnEffect(enemy.x, enemy.y, "+ОЧКИ", "#9aff6c");
          const coinBase = coinRewards.enemies[enemy.type.id] || 6;
          const coinReward = coinBase * (level.rewardScale || 1);
          addCoinReward(coinReward, "kills");
          spawnEffect(enemy.x, enemy.y + 14, "+💰", "#ffd166");
          spawnExplosion(enemy.x, enemy.y, "#ff9b4b");
          if (Math.random() < (enemy.type.dropChance || 0.3) * (level.dropScale || 1)) {
            const drop = randomPowerupKind();
            spawnPowerup(enemy.x, enemy.y, drop.kind);
          }
          playSfx("boom");
        }
      }
    });
  });

  state.bullets.forEach((bullet) => {
    state.hazards.forEach((hazard) => {
      if (hazard.hp <= 0) return;
      if (intersects({ x: bullet.x, y: bullet.y, width: bullet.width, height: bullet.height }, hazard)) {
        hazard.hp -= bullet.damage || 1;
        spawnEffect(hazard.x, hazard.y, "СКОЛ", "#ffd166");
        playSfx("hit");
        if (bullet.pierce > 0) {
          bullet.pierce -= 1;
        } else {
          bullet.y = -999;
        }
        if (hazard.hp <= 0) {
          spawnExplosion(hazard.x, hazard.y, "#bda28a");
        }
      }
    });
  });

  if (state.boss) {
    state.bullets.forEach((bullet) => {
      if (bullet.y < -500) return;
      if (intersects({ x: bullet.x, y: bullet.y, width: bullet.width, height: bullet.height }, state.boss)) {
        state.boss.hp -= bullet.damage || 1;
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
      bossBar.classList.remove("visible");
      state.boss = null;
      const finalLevel = state.levelIndex >= levelConfigs.length - 1;
      triggerLevelSummary({ bossDefeated: true, finalLevel });
    }
  }

  state.bullets = state.bullets.filter((bullet) => bullet.y > -200);
  state.enemies = state.enemies.filter((enemy) => enemy.hp > 0);
  state.hazards = state.hazards.filter((hazard) => hazard.hp > 0);

  if (state.player.invuln <= 0) {
    state.enemyBullets.forEach((bullet) => {
      if (intersects({ x: bullet.x, y: bullet.y, width: bullet.width, height: bullet.height }, state.player)) {
        bullet.y = GAME_HEIGHT + 200;
        applyDamage(bullet.damage || 1);
      }
    });

    state.enemies.forEach((enemy) => {
      if (intersects(enemy, state.player)) {
        enemy.y = GAME_HEIGHT + 100;
        applyDamage(1);
      }
    });

    state.hazards.forEach((hazard) => {
      if (intersects(hazard, state.player)) {
        hazard.y = GAME_HEIGHT + 100;
        applyDamage(hazard.damage || 1);
      }
    });

    state.lasers.forEach((laser) => {
      if (!laser.active) return;
      const hitbox = { x: laser.x, y: GAME_HEIGHT / 2, width: laser.width, height: GAME_HEIGHT };
      if (intersects(hitbox, state.player)) {
        applyDamage(1.5);
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
  const level = getLevelConfig();
  const scaled = amount * (level?.damageScale || 1);
  const finalDamage = scaled < 1 ? (Math.random() < scaled ? 1 : 0) : Math.ceil(scaled);
  if (finalDamage <= 0) return;
  if (state.player.shield > 0) {
    state.player.shield -= 1;
    spawnEffect(state.player.x, state.player.y - 20, "ЩИТ", "#6ce1ff");
    playSfx("shield");
  } else {
    state.player.hp = Math.max(0, state.player.hp - finalDamage);
    state.stats.damageTaken += finalDamage;
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
  const roll = Math.random();
  if (roll < 0.4) return { kind: "shield" };
  if (roll < 0.6) return { kind: "heal" };
  if (roll < 0.8) return { kind: "score" };
  return { kind: "slow" };
}

function collectPowerup(kind) {
  state.stats.boosts += 1;
  if (kind === "shield") {
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
  const level = levelConfigs[state.levelIndex];
  if (state.levelTimer >= level.duration) {
    const finalLevel = state.levelIndex >= levelConfigs.length - 1;
    triggerLevelSummary({ bossDefeated: false, finalLevel });
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

function drawPixelShip({ x, y, skin, targetCtx }) {
  const unit = 2;
  const context = targetCtx || ctx;
  const drawBlocks = (blocks, color) => {
    if (!blocks.length) return;
    context.fillStyle = color;
    blocks.forEach(([bx, by, bw, bh]) => {
      context.fillRect(x + bx * unit, y + by * unit, bw * unit, bh * unit);
    });
  };

  const styleMap = {
    1: {
      body: [
        [-2, -10, 4, 16],
        [-1, -12, 2, 3],
        [-7, -4, 14, 5],
        [-5, 1, 4, 6],
        [1, 1, 4, 6],
        [-1, 6, 2, 6],
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
      cockpit: [[-1, -5, 2, 3]],
      flame: [
        [-4, 10, 2, 3],
        [2, 10, 2, 3],
      ],
    },
    2: {
      body: [
        [-3, -12, 6, 18],
        [-1, -14, 2, 3],
        [-8, -5, 16, 6],
        [-7, 1, 5, 7],
        [2, 1, 5, 7],
        [-2, 6, 4, 7],
      ],
      accent: [
        [-1, -8, 2, 6],
        [-6, -3, 3, 2],
        [3, -3, 3, 2],
      ],
      highlight: [
        [-1, -13, 2, 1],
        [-7, -4, 2, 1],
        [5, -4, 2, 1],
      ],
      cockpit: [[-1, -6, 2, 4]],
      flame: [
        [-6, 11, 2, 3],
        [4, 11, 2, 3],
      ],
    },
    3: {
      body: [
        [-3, -13, 6, 18],
        [-1, -15, 2, 3],
        [-9, -6, 18, 6],
        [-8, 0, 6, 7],
        [2, 0, 6, 7],
        [-2, 6, 4, 8],
        [-1, -10, 2, 3],
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
        [-7, 12, 2, 3],
        [5, 12, 2, 3],
        [-1, 12, 2, 3],
      ],
    },
    4: {
      body: [
        [-4, -14, 8, 18],
        [-1, -16, 2, 3],
        [-10, -7, 20, 6],
        [-9, -1, 7, 8],
        [2, -1, 7, 8],
        [-3, 6, 6, 8],
        [-2, -11, 4, 4],
        [-6, -10, 2, 4],
        [4, -10, 2, 4],
      ],
      accent: [
        [-1, -10, 2, 6],
        [-8, -5, 3, 2],
        [5, -5, 3, 2],
        [-4, 1, 8, 2],
      ],
      highlight: [
        [-1, -15, 2, 1],
        [-9, -6, 2, 1],
        [7, -6, 2, 1],
      ],
      cockpit: [[-1, -8, 2, 4]],
      flame: [
        [-8, 13, 2, 3],
        [6, 13, 2, 3],
        [-3, 13, 6, 3],
      ],
    },
    5: {
      body: [
        [-4, -15, 8, 19],
        [-1, -17, 2, 3],
        [-11, -8, 22, 6],
        [-10, -2, 8, 8],
        [2, -2, 8, 8],
        [-4, 7, 8, 8],
        [-2, -12, 4, 4],
        [-7, -11, 2, 4],
        [5, -11, 2, 4],
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
        [-9, 14, 2, 3],
        [7, 14, 2, 3],
        [-4, 14, 8, 3],
      ],
    },
    6: {
      body: [
        [-5, -16, 10, 20],
        [-1, -18, 2, 3],
        [-12, -9, 24, 6],
        [-11, -3, 9, 9],
        [2, -3, 9, 9],
        [-4, 8, 8, 8],
        [-2, -13, 4, 4],
        [-8, -12, 2, 4],
        [6, -12, 2, 4],
        [-7, -7, 2, 5],
        [5, -7, 2, 5],
      ],
      accent: [
        [-1, -12, 2, 6],
        [-10, -7, 3, 2],
        [7, -7, 3, 2],
        [-5, 1, 10, 2],
        [-7, 3, 14, 2],
      ],
      highlight: [
        [-1, -17, 2, 1],
        [-11, -8, 2, 1],
        [9, -8, 2, 1],
      ],
      cockpit: [[-1, -10, 2, 4]],
      flame: [
        [-10, 15, 2, 3],
        [8, 15, 2, 3],
        [-5, 15, 10, 3],
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

function drawHangarShipPreview(ship) {
  if (!hangarShipCanvas || !ship) return;
  const previewCtx = hangarShipCanvas.getContext("2d");
  if (!previewCtx) return;
  previewCtx.imageSmoothingEnabled = false;
  previewCtx.clearRect(0, 0, hangarShipCanvas.width, hangarShipCanvas.height);
  previewCtx.fillStyle = "#0b0d1f";
  previewCtx.fillRect(0, 0, hangarShipCanvas.width, hangarShipCanvas.height);
  const centerX = hangarShipCanvas.width / 2;
  const centerY = hangarShipCanvas.height / 2 + 8;
  drawPixelShip({ x: centerX, y: centerY, skin: ship, targetCtx: previewCtx });
}

function drawPixelEnemy({ x, y, type }) {
  const unit = 2;
  const drawBlocks = (blocks, color) => {
    if (!blocks.length) return;
    ctx.fillStyle = color;
    blocks.forEach(([bx, by, bw, bh]) => {
      ctx.fillRect(x + bx * unit, y + by * unit, bw * unit, bh * unit);
    });
  };

  const styleMap = {
    scout: {
      colors: {
        body: "#4de56e",
        accent: "#2bbf58",
        eye: "#ff4040",
        highlight: "#ffffff",
      },
      body: [
        [-5, -6, 10, 10],
        [-7, 3, 14, 4],
      ],
      accent: [
        [-3, -4, 6, 2],
        [-5, 1, 10, 2],
      ],
      eye: [[-1, -1, 2, 2]],
      extra: [
        [-6, 7, 3, 2],
        [3, 7, 3, 2],
      ],
    },
    shooter: {
      colors: {
        body: "#7fc8ff",
        accent: "#4a8bff",
        eye: "#ff4040",
        highlight: "#e7f3ff",
      },
      body: [
        [-4, -7, 8, 12],
        [-8, -2, 16, 6],
      ],
      accent: [
        [-2, -5, 4, 4],
        [-6, 2, 12, 2],
      ],
      eye: [[-1, -1, 2, 2]],
      extra: [
        [-9, 1, 2, 4],
        [7, 1, 2, 4],
      ],
    },
    edge: {
      colors: {
        body: "#c06cff",
        accent: "#ff6adf",
        eye: "#ff4040",
        highlight: "#ffd8ff",
      },
      body: [
        [-6, -6, 12, 8],
        [-9, 0, 18, 6],
      ],
      accent: [
        [-3, -4, 6, 2],
        [-7, 2, 14, 2],
      ],
      eye: [[-1, -2, 2, 2]],
      extra: [
        [-8, 6, 4, 2],
        [4, 6, 4, 2],
      ],
    },
    rammer: {
      colors: {
        body: "#ff5a4f",
        accent: "#ff9f3c",
        eye: "#fff1a8",
        highlight: "#ffffff",
      },
      body: [
        [-6, -7, 12, 10],
        [-8, 2, 16, 6],
        [-2, -10, 4, 3],
      ],
      accent: [
        [-4, -3, 8, 2],
        [-6, 4, 12, 2],
      ],
      eye: [[-1, -2, 2, 2]],
      extra: [
        [-9, 4, 2, 2],
        [7, 4, 2, 2],
      ],
    },
    snake: {
      colors: {
        body: "#5ae6ff",
        accent: "#2ba8bf",
        eye: "#ff4040",
        highlight: "#e7f3ff",
      },
      body: [
        [-4, -7, 8, 10],
        [-7, 0, 14, 5],
        [-5, 5, 10, 3],
      ],
      accent: [
        [-2, -5, 4, 3],
        [-6, 2, 12, 2],
      ],
      eye: [[-1, -2, 2, 2]],
      extra: [
        [-8, 6, 2, 2],
        [6, 6, 2, 2],
      ],
    },
    armor: {
      colors: {
        body: "#b6c4d9",
        accent: "#7a8796",
        eye: "#ff5b5b",
        highlight: "#ffffff",
      },
      body: [
        [-7, -7, 14, 9],
        [-9, 2, 18, 6],
        [-5, 8, 10, 2],
      ],
      accent: [
        [-3, -5, 6, 3],
        [-7, 3, 14, 2],
      ],
      eye: [[-1, -2, 2, 2]],
      extra: [
        [-9, 1, 2, 4],
        [7, 1, 2, 4],
      ],
    },
    elite: {
      colors: {
        body: "#ffd166",
        accent: "#ff9f3c",
        eye: "#ffffff",
        highlight: "#fff1a8",
      },
      body: [
        [-7, -7, 14, 10],
        [-10, 1, 20, 6],
      ],
      accent: [
        [-3, -5, 6, 3],
        [-8, 3, 16, 2],
      ],
      eye: [[-1, -2, 2, 2]],
      extra: [
        [-10, 6, 4, 2],
        [6, 6, 4, 2],
      ],
    },
  };

  const style = styleMap[type.id] || styleMap.scout;
  drawBlocks(style.body, style.colors.body);
  drawBlocks(style.accent, style.colors.accent);
  drawBlocks(style.extra, style.colors.accent);
  drawBlocks(style.eye, style.colors.eye);
  drawBlocks([[-1, -3, 2, 1]], style.colors.highlight);
}

function drawEnemy(enemy) {
  const { x, y, width, height, type, telegraph } = enemy;
  drawPixelEnemy({ x, y, type });

  if (telegraph > 0) {
    ctx.strokeStyle = "#ffe66d";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - width / 2 - 2, y - height / 2 - 2, width + 4, height + 4);
  }
}

function drawBullets() {
  state.bullets.forEach((bullet) => {
    if (bullet.kind === "laser") {
      ctx.fillStyle = "#ff7bff";
    } else if (bullet.kind === "missile") {
      ctx.fillStyle = "#ff9f3c";
    } else if (bullet.kind === "arc") {
      ctx.fillStyle = "#ffd166";
    } else if (bullet.kind === "orbs") {
      ctx.fillStyle = "#7df9ff";
    } else {
      ctx.fillStyle = palette.bullet;
    }
    ctx.fillRect(bullet.x - bullet.width / 2, bullet.y - bullet.height / 2, bullet.width, bullet.height);
  });

  ctx.fillStyle = palette.enemyBullet;
  state.enemyBullets.forEach((bullet) => {
    if (bullet.kind === "missile") {
      ctx.fillStyle = "#ff9f3c";
    } else if (bullet.kind === "orb") {
      ctx.fillStyle = "#7df9ff";
    } else {
      ctx.fillStyle = palette.enemyBullet;
    }
    ctx.fillRect(bullet.x - bullet.width / 2, bullet.y - bullet.height / 2, bullet.width, bullet.height);
  });
}

function drawHazards() {
  state.hazards.forEach((hazard) => {
    if (hazard.kind !== "asteroid") return;
    ctx.save();
    ctx.translate(hazard.x, hazard.y);
    ctx.rotate(hazard.angle);
    ctx.fillStyle = "#8f7f6f";
    ctx.fillRect(-hazard.width / 2, -hazard.height / 2, hazard.width, hazard.height);
    ctx.fillStyle = "#bda28a";
    ctx.fillRect(-hazard.width / 4, -hazard.height / 4, hazard.width / 3, hazard.height / 3);
    ctx.restore();
  });
}

function drawLasers() {
  state.lasers.forEach((laser) => {
    if (!laser.active) {
      ctx.strokeStyle = "rgba(255, 123, 255, 0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(laser.x, laser.y);
      ctx.lineTo(laser.x, GAME_HEIGHT);
      ctx.stroke();
    } else {
      ctx.fillStyle = "rgba(255, 123, 255, 0.4)";
      ctx.fillRect(laser.x - laser.width / 2, laser.y, laser.width, GAME_HEIGHT - laser.y);
      ctx.strokeStyle = "#ffb3ff";
      ctx.lineWidth = 1;
      ctx.strokeRect(laser.x - laser.width / 2, laser.y, laser.width, GAME_HEIGHT - laser.y);
    }
  });
}

function drawPowerups() {
  state.powerups.forEach((power) => {
    const labelMap = {
      shield: "Щ",
      heal: "+",
      score: "★",
      slow: "З",
    };
    ctx.fillStyle = palette.heal;
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
  if (hudCoins) {
    hudCoins.textContent = `💰 ${state.saveData?.coins ?? 0}`;
  }
  hudLevel.textContent = `🏁 УРОВЕНЬ ${levelConfigs[state.levelIndex].level}/${levelConfigs.length}`;
  const weapon = getWeaponLevelConfig(state.player.weapon.type, state.player.weapon.level);
  const shipLabel = state.player?.skin?.name || "КОРАБЛЬ";
  hudWeapon.textContent = `🚀 ${shipLabel} · 🔫 ${weapon.name} ${state.player.weapon.level + 1}/${weapon.maxLevel + 1}`;
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
  drawHazards();
  drawPowerups();
  drawBullets();
  drawLasers();
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
  statLevel.textContent = String(levelConfigs[state.levelIndex].level);
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
    level: levelConfigs[state.levelIndex].level,
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
    updateHazards(dt);
    updateLasers(dt);
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
        const drop = randomPowerupKind();
        spawnPowerup(rand(40, GAME_WIDTH - 40), -20, drop.kind);
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
  handleAdminCodeInput(event.key, event.target);
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

adminGoLevelButton.addEventListener("click", () => {
  if (!state.adminEnabled) return;
  const index = Number(adminLevelSelect.value);
  if (Number.isNaN(index)) return;
  jumpToLevel(index);
});

adminResetRunButton.addEventListener("click", () => {
  if (!state.adminEnabled) return;
  startGame();
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

pauseOverlay.addEventListener("click", (event) => {
  if (event.target === pauseOverlay) {
    togglePause();
  }
});

startButton.addEventListener("click", () => {
  openHangar();
});

restartButton.addEventListener("click", startGame);

saveResultButton.addEventListener("click", saveResult);

backToMenuButton.addEventListener("click", () => {
  state.phase = "start";
  startOverlay.classList.remove("hidden");
  endOverlay.classList.add("hidden");
  pauseOverlay.classList.add("hidden");
  updateAdminPanelVisibility();
  if (state.audio) {
    switchMusic("menu");
  }
});

hangarBack.addEventListener("click", () => {
  closeHangar();
  startOverlay.classList.remove("hidden");
  state.phase = "start";
});

hangarPlay.addEventListener("click", () => {
  closeHangar();
  startGame();
});

hangarReset.addEventListener("click", () => {
  if (!confirm("Сбросить прогресс? Это удалит все покупки и монеты.")) return;
  state.saveData = createDefaultSaveData();
  saveGameData();
  renderHangar();
  showHangarMessage("Прогресс сброшен.");
});

hangarShips.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const shipId = button.dataset.shipId;
  const ship = shipCatalogMap[shipId];
  if (!ship || !state.saveData) return;
  if (button.dataset.action === "buy-ship") {
    if (state.saveData.coins < ship.price) {
      showHangarMessage("Недостаточно монет.");
      return;
    }
    state.saveData.coins -= ship.price;
    state.saveData.ownedShips = Array.from(new Set(state.saveData.ownedShips.concat(shipId)));
    state.saveData.selectedShipId = shipId;
    saveGameData();
    playSfx("bonus");
    showHangarMessage(`Корабль ${ship.name} куплен.`);
  } else if (button.dataset.action === "select-ship") {
    state.saveData.selectedShipId = shipId;
    saveGameData();
    playSfx("bonus");
  }
  renderHangar();
});

hangarWeapons.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const weaponId = button.dataset.weaponId;
  const weapon = weaponCatalog[weaponId];
  if (!weapon || !state.saveData) return;
  if (button.dataset.action === "buy-weapon") {
    if (state.saveData.coins < weapon.price) {
      showHangarMessage("Недостаточно монет.");
      return;
    }
    state.saveData.coins -= weapon.price;
    state.saveData.ownedWeapons = Array.from(new Set(state.saveData.ownedWeapons.concat(weaponId)));
    state.saveData.selectedWeaponId = weaponId;
    saveGameData();
    playSfx("bonus");
    showHangarMessage(`Оружие ${weapon.name} куплено.`);
  } else if (button.dataset.action === "select-weapon") {
    state.saveData.selectedWeaponId = weaponId;
    saveGameData();
    playSfx("bonus");
  }
  renderHangar();
});

hangarUpgrades.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button || !state.saveData) return;
  const action = button.dataset.action;
  if (action === "upgrade-ship") {
    const key = button.dataset.upgradeKey;
    const config = shipUpgradeConfig[key];
    if (!config) return;
    const level = state.saveData.shipUpgrades[key] || 0;
    if (level >= config.maxLevel) return;
    const cost = getShipUpgradeCost(key, level);
    if (state.saveData.coins < cost) {
      showHangarMessage("Недостаточно монет.");
      return;
    }
    state.saveData.coins -= cost;
    state.saveData.shipUpgrades[key] = level + 1;
    saveGameData();
    playSfx("bonus");
    showHangarMessage(`Апгрейд ${config.label} улучшен.`);
  }
  if (action === "upgrade-weapon") {
    const weaponId = button.dataset.weaponId;
    const weapon = weaponCatalog[weaponId];
    if (!weapon) return;
    const level = state.saveData.weaponUpgrades[weaponId] || 0;
    const max = weapon.levels.length - 1;
    if (level >= max) return;
    const cost = getWeaponUpgradeCost(weaponId, level);
    if (state.saveData.coins < cost) {
      showHangarMessage("Недостаточно монет.");
      return;
    }
    state.saveData.coins -= cost;
    state.saveData.weaponUpgrades[weaponId] = level + 1;
    saveGameData();
    playSfx("bonus");
    showHangarMessage(`Оружие ${weapon.name} усилено.`);
  }
  renderHangar();
});

summaryContinue.addEventListener("click", () => {
  continueAfterSummary();
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

state.saveData = loadSaveData();
saveGameData();
setSound(state.soundOn);
setDifficulty(state.difficulty);
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
initStarfield();
resetStats();
buildPlayerForLevel({ preserveProgress: false });
renderLeaderboard();
populateAdminLevels();
updateStatsPanel();
requestAnimationFrame(gameLoop);
