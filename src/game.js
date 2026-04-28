const realms = [
  { name: "练气一层", qi: 100, age: 80 },
  { name: "练气二层", qi: 150, age: 88 },
  { name: "练气三层", qi: 220, age: 96 },
  { name: "筑基初期", qi: 360, age: 140 },
  { name: "筑基中期", qi: 560, age: 168 },
  { name: "筑基后期", qi: 820, age: 196 },
  { name: "金丹初期", qi: 1250, age: 280 },
];

const state = {
  realm: 0,
  qi: 28,
  mind: 62,
  age: 16,
  stones: 20,
  herbs: 8,
  pills: 1,
  day: 1,
  focus: "idle",
  lastPulse: 0,
};

const els = {};

const eventText = [
  "山腰云海翻涌，灵田里有几株草药泛起细光。",
  "外门弟子送来一封求助信，信纸上沾着妖气。",
  "丹炉火候正稳，炉壁传来细密的金石声。",
  "夜里星斗倒映在剑池，心境似乎清明了些。",
  "坊市传闻有秘境将开，散修们已经动身。",
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function currentRealm() {
  return realms[state.realm];
}

function log(message, tone = "") {
  const item = document.createElement("li");
  item.textContent = `第${state.day}日：${message}`;
  if (tone) item.className = tone;
  els.log.prepend(item);
  while (els.log.children.length > 18) {
    els.log.lastChild.remove();
  }
}

function setEvent(message) {
  els.eventText.textContent = message;
}

function advanceDay() {
  state.day += 1;
  state.age = +(state.age + 0.08).toFixed(2);
  state.qi = clamp(state.qi + 2 + state.realm, 0, currentRealm().qi);
  state.mind = clamp(state.mind - 1, 0, 100);
  if (Math.random() < 0.34) {
    setEvent(eventText[Math.floor(Math.random() * eventText.length)]);
  }
}

function actionCultivate() {
  const gain = 18 + state.realm * 7 + Math.floor(Math.random() * 12);
  state.qi = clamp(state.qi + gain, 0, currentRealm().qi);
  state.mind = clamp(state.mind - 4, 0, 100);
  state.focus = "cultivate";
  setEvent("你在洞府吐纳周天，灵气沿经脉缓缓归入丹田。");
  log(`吐纳修炼，灵气 +${gain}，心境 -4。`, "good");
  advanceDay();
  refresh();
}

function actionAlchemy() {
  if (state.herbs < 3 || state.stones < 2) {
    log("炼丹材料不足，需要 3 草药和 2 灵石。", "bad");
    return;
  }
  state.herbs -= 3;
  state.stones -= 2;
  state.focus = "alchemy";
  if (Math.random() < 0.72) {
    const made = Math.random() < 0.16 ? 2 : 1;
    state.pills += made;
    state.mind = clamp(state.mind + 2, 0, 100);
    setEvent("丹炉轻鸣，药香绕梁不散。");
    log(`炼成聚气丹 ${made} 枚，心境 +2。`, "good");
  } else {
    state.mind = clamp(state.mind - 7, 0, 100);
    setEvent("炉火一跳，丹液焦黑，只剩一缕苦烟。");
    log("炼丹失败，心境 -7。", "bad");
  }
  advanceDay();
  refresh();
}

function actionTravel() {
  state.focus = "travel";
  const roll = Math.random();
  if (roll < 0.32) {
    const herbs = 4 + Math.floor(Math.random() * 6);
    state.herbs += herbs;
    state.mind = clamp(state.mind + 4, 0, 100);
    setEvent("溪谷深处灵草成片，你记下了回山的路。");
    log(`游历采得草药 +${herbs}，心境 +4。`, "good");
  } else if (roll < 0.62) {
    const stones = 8 + Math.floor(Math.random() * 12);
    state.stones += stones;
    state.qi = clamp(state.qi + 10, 0, currentRealm().qi);
    setEvent("你替村镇除去小妖，获赠一袋灵石。");
    log(`斩妖护道，灵石 +${stones}，灵气 +10。`, "rare");
  } else if (roll < 0.82) {
    state.mind = clamp(state.mind - 10, 0, 100);
    state.qi = clamp(state.qi + 28, 0, currentRealm().qi);
    setEvent("古洞壁上残留剑痕，观之有悟，也有些心神震荡。");
    log("参悟古洞剑痕，灵气 +28，心境 -10。", "rare");
  } else {
    state.mind = clamp(state.mind - 16, 0, 100);
    state.stones = Math.max(0, state.stones - 6);
    setEvent("山路遭遇劫修，你脱身时遗失了些灵石。");
    log("遭遇劫修，灵石 -6，心境 -16。", "bad");
  }
  advanceDay();
  refresh();
}

function actionMeditate() {
  const gain = 16 + Math.floor(Math.random() * 10);
  state.mind = clamp(state.mind + gain, 0, 100);
  state.focus = "meditate";
  setEvent("静室香烟如线，你把杂念一一放下。");
  log(`静室调息，心境 +${gain}。`, "good");
  advanceDay();
  refresh();
}

function actionBreakthrough() {
  if (state.realm >= realms.length - 1) {
    log("此界灵机已不足以支撑更高境界。", "rare");
    return;
  }
  const needed = currentRealm().qi;
  if (state.qi < needed) {
    log(`灵气尚未圆满，还差 ${needed - state.qi}。`, "bad");
    return;
  }
  const pillBonus = state.pills > 0 ? 0.18 : 0;
  const chance = clamp(0.38 + state.mind / 240 + pillBonus, 0.18, 0.9);
  if (state.pills > 0) state.pills -= 1;
  state.focus = "breakthrough";
  if (Math.random() < chance) {
    state.realm += 1;
    state.qi = Math.floor(realms[state.realm].qi * 0.16);
    state.mind = clamp(state.mind - 18, 0, 100);
    setEvent("雷云散去，一缕清光落入山门，你的气息又深了一重。");
    log(`突破成功，晋入${currentRealm().name}。`, "rare");
  } else {
    state.qi = Math.floor(needed * 0.42);
    state.mind = clamp(state.mind - 28, 0, 100);
    setEvent("经脉剧痛，灵气反冲。所幸根基尚稳，仍有再来之机。");
    log("突破失败，灵气大损，心境 -28。", "bad");
  }
  advanceDay();
  refresh();
}

function refresh() {
  const realm = currentRealm();
  els.realmText.textContent = `${realm.name} · 第 ${state.day} 日`;
  els.qiValue.textContent = `${Math.floor(state.qi)} / ${realm.qi}`;
  els.mindValue.textContent = `${Math.floor(state.mind)} / 100`;
  els.ageText.textContent = `${Math.floor(state.age)} / ${realm.age}`;
  els.stoneText.textContent = state.stones;
  els.herbText.textContent = state.herbs;
  els.pillText.textContent = state.pills;
  els.qiBar.style.width = `${(state.qi / realm.qi) * 100}%`;
  els.mindBar.style.width = `${state.mind}%`;
  els.mindBar.style.background =
    state.mind < 28 ? "linear-gradient(90deg, #dd786c, #e0bf65)" : "linear-gradient(90deg, #73d3a0, #7bb8d8)";
  window.dispatchEvent(new CustomEvent("cultivation:update", { detail: { ...state } }));
}

function bindHud() {
  for (const id of ["realmText", "qiValue", "mindValue", "ageText", "stoneText", "herbText", "pillText", "eventText", "log", "qiBar", "mindBar"]) {
    els[id] = document.getElementById(id);
  }
  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      if (action === "cultivate") actionCultivate();
      if (action === "alchemy") actionAlchemy();
      if (action === "travel") actionTravel();
      if (action === "meditate") actionMeditate();
      if (action === "breakthrough") actionBreakthrough();
    });
  });
  log("山门初立，先稳住心境，再求境界。", "rare");
  refresh();
}

const PhaserSceneBase = window.Phaser ? window.Phaser.Scene : class {};

class CultivationScene extends PhaserSceneBase {
  constructor() {
    super("CultivationScene");
    this.fx = [];
    this.state = { ...state };
  }

  create() {
    this.cameras.main.setBackgroundColor("#10211f");
    this.drawWorld();
    this.createActors();
    window.addEventListener("cultivation:update", (event) => {
      this.state = event.detail;
      this.flashAction();
    });
  }

  drawWorld() {
    const g = this.add.graphics();
    g.fillGradientStyle(0x14332f, 0x14332f, 0x263c32, 0x1b2526, 1);
    g.fillRect(0, 0, 1280, 720);
    g.fillStyle(0x20312f, 1);
    g.fillEllipse(650, 720, 1380, 420);
    g.fillStyle(0x314742, 1);
    g.fillTriangle(80, 610, 300, 150, 560, 610);
    g.fillStyle(0x415b51, 1);
    g.fillTriangle(370, 620, 655, 75, 975, 620);
    g.fillStyle(0x29423f, 1);
    g.fillTriangle(800, 615, 1040, 190, 1220, 615);
    g.fillStyle(0xded7c6, 0.78);
    g.fillTriangle(613, 155, 655, 75, 704, 162);
    g.fillTriangle(270, 210, 300, 150, 340, 218);
    g.fillStyle(0x2c4939, 1);
    g.fillRect(150, 505, 260, 94);
    g.fillStyle(0x1a2c28, 1);
    g.fillTriangle(120, 510, 280, 415, 440, 510);
    g.fillStyle(0xe0bf65, 0.8);
    g.fillRect(248, 536, 52, 63);
    g.fillStyle(0x543f34, 1);
    g.fillRect(820, 508, 86, 76);
    g.fillStyle(0x1a2c28, 1);
    g.fillTriangle(792, 510, 862, 452, 932, 510);
    g.lineStyle(4, 0xd7c48c, 0.9);
    g.strokeCircle(862, 548, 24);
    g.fillStyle(0x365c36, 1);
    for (let i = 0; i < 6; i += 1) {
      g.fillRect(510 + i * 42, 540 + (i % 2) * 8, 28, 54);
    }
    g.lineStyle(2, 0x73d3a0, 0.28);
    for (let i = 0; i < 7; i += 1) {
      g.beginPath();
      g.moveTo(0, 650 + i * 7);
      g.lineTo(1280, 610 + i * 9);
      g.strokePath();
    }
    this.add.text(180, 610, "山门", { font: "22px Microsoft YaHei", color: "#e0bf65" });
    this.add.text(530, 625, "灵田", { font: "22px Microsoft YaHei", color: "#9ce2b6" });
    this.add.text(820, 610, "丹房", { font: "22px Microsoft YaHei", color: "#e7b782" });
  }

  createActors() {
    this.cultivator = this.add.container(645, 465);
    const robe = this.add.graphics();
    robe.fillStyle(0x5b786c, 1);
    robe.fillTriangle(0, -42, -34, 46, 34, 46);
    robe.fillStyle(0xf0d6a6, 1);
    robe.fillCircle(0, -54, 18);
    robe.lineStyle(3, 0xe0bf65, 0.8);
    robe.strokeCircle(0, -7, 58);
    this.cultivator.add(robe);
    this.orb = this.add.graphics();
    this.clouds = this.add.group();
    for (let i = 0; i < 9; i += 1) {
      const cloud = this.add.ellipse(i * 170 - 80, 110 + Math.random() * 120, 120, 28, 0xdde6dc, 0.16);
      this.clouds.add(cloud);
    }
  }

  update(time, delta) {
    this.cultivator.y = 465 + Math.sin(time / 850) * 5;
    this.cultivator.rotation = Math.sin(time / 1200) * 0.025;
    this.clouds.children.iterate((cloud) => {
      cloud.x += delta * 0.008;
      if (cloud.x > 1370) cloud.x = -120;
    });
    this.drawQiOrb(time);
  }

  drawQiOrb(time) {
    this.orb.clear();
    const qiRatio = this.state.qi / realms[this.state.realm].qi;
    const radius = 44 + qiRatio * 42 + Math.sin(time / 260) * 4;
    const color = this.state.focus === "breakthrough" ? 0xe0bf65 : 0x73d3a0;
    this.orb.lineStyle(3, color, 0.38 + qiRatio * 0.42);
    this.orb.strokeCircle(645, 430, radius);
    this.orb.lineStyle(1, 0x7bb8d8, 0.35);
    this.orb.strokeCircle(645, 430, radius + 16);
  }

  flashAction() {
    const colorByFocus = {
      cultivate: 0x73d3a0,
      alchemy: 0xe7a75f,
      travel: 0x7bb8d8,
      meditate: 0xded7c6,
      breakthrough: 0xe0bf65,
    };
    const circle = this.add.circle(645, 430, 20, colorByFocus[this.state.focus] || 0xffffff, 0.35);
    this.tweens.add({
      targets: circle,
      radius: 170,
      alpha: 0,
      duration: 520,
      ease: "Sine.easeOut",
      onComplete: () => circle.destroy(),
    });
  }
}

class CanvasFallback {
  constructor(parent) {
    this.parent = parent;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.state = { ...state };
    this.time = 0;
    this.parent.appendChild(this.canvas);
    window.addEventListener("resize", () => this.resize());
    window.addEventListener("cultivation:update", (event) => {
      this.state = event.detail;
      this.pulse = 1;
    });
    this.resize();
    requestAnimationFrame((time) => this.frame(time));
  }

  resize() {
    const rect = this.parent.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.width = rect.width;
    this.height = rect.height;
  }

  frame(time) {
    this.time = time;
    this.draw();
    requestAnimationFrame((next) => this.frame(next));
  }

  draw() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const sx = w / 1280;
    const sy = h / 720;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.scale(sx, sy);
    const sky = ctx.createLinearGradient(0, 0, 0, 720);
    sky.addColorStop(0, "#14332f");
    sky.addColorStop(1, "#1b2526");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 1280, 720);
    this.ellipse(650, 720, 1380, 420, "#20312f");
    this.triangle(80, 610, 300, 150, 560, 610, "#314742");
    this.triangle(370, 620, 655, 75, 975, 620, "#415b51");
    this.triangle(800, 615, 1040, 190, 1220, 615, "#29423f");
    this.triangle(613, 155, 655, 75, 704, 162, "rgba(222,215,198,.78)");
    this.triangle(270, 210, 300, 150, 340, 218, "rgba(222,215,198,.7)");
    ctx.fillStyle = "#2c4939";
    ctx.fillRect(150, 505, 260, 94);
    this.triangle(120, 510, 280, 415, 440, 510, "#1a2c28");
    ctx.fillStyle = "#e0bf65";
    ctx.fillRect(248, 536, 52, 63);
    ctx.fillStyle = "#543f34";
    ctx.fillRect(820, 508, 86, 76);
    this.triangle(792, 510, 862, 452, 932, 510, "#1a2c28");
    ctx.strokeStyle = "rgba(215,196,140,.9)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(862, 548, 24, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#365c36";
    for (let i = 0; i < 6; i += 1) ctx.fillRect(510 + i * 42, 540 + (i % 2) * 8, 28, 54);
    this.drawCultivator();
    this.drawClouds();
    ctx.font = "22px Microsoft YaHei";
    ctx.fillStyle = "#e0bf65";
    ctx.fillText("山门", 180, 632);
    ctx.fillStyle = "#9ce2b6";
    ctx.fillText("灵田", 530, 650);
    ctx.fillStyle = "#e7b782";
    ctx.fillText("丹房", 820, 632);
    ctx.restore();
    this.pulse = Math.max(0, (this.pulse || 0) - 0.035);
  }

  drawClouds() {
    const ctx = this.ctx;
    ctx.fillStyle = "rgba(221,230,220,.16)";
    for (let i = 0; i < 9; i += 1) {
      const x = ((i * 170 - 80 + this.time * 0.008) % 1500) - 120;
      this.ellipse(x, 120 + (i % 4) * 32, 120, 28);
    }
  }

  drawCultivator() {
    const ctx = this.ctx;
    const bob = Math.sin(this.time / 850) * 5;
    const qiRatio = this.state.qi / realms[this.state.realm].qi;
    const radius = 44 + qiRatio * 42 + Math.sin(this.time / 260) * 4 + (this.pulse || 0) * 75;
    ctx.save();
    ctx.translate(645, 465 + bob);
    ctx.rotate(Math.sin(this.time / 1200) * 0.025);
    this.triangle(0, -42, -34, 46, 34, 46, "#5b786c");
    this.ellipse(0, -54, 36, 36, "#f0d6a6");
    ctx.restore();
    ctx.strokeStyle = this.state.focus === "breakthrough" ? "rgba(224,191,101,.7)" : "rgba(115,211,160,.68)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(645, 430, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(123,184,216,.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(645, 430, radius + 16, 0, Math.PI * 2);
    ctx.stroke();
  }

  triangle(x1, y1, x2, y2, x3, y3, fill) {
    const ctx = this.ctx;
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.fill();
  }

  ellipse(x, y, width, height, fill) {
    const ctx = this.ctx;
    if (fill) ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.ellipse(x, y, width / 2, height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function startGame() {
  if (!window.Phaser) {
    new CanvasFallback(document.getElementById("game"));
    log("当前使用本地 Canvas 备用渲染，联网后可自动启用 Phaser 版本。", "rare");
    return;
  }
  new Phaser.Game({
    type: Phaser.AUTO,
    parent: "game",
    width: 1280,
    height: 720,
    backgroundColor: "#10211f",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [CultivationScene],
  });
}

bindHud();
startGame();
