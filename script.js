(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // ---------- 탭 ----------
  const tabs = $$(".tab");
  const panels = $$(".panel");
  function showTab(id) {
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === id));
    panels.forEach((p) => p.classList.toggle("active", p.id === id));
    history.replaceState(null, "", "#" + id);
  }
  tabs.forEach((t) => t.addEventListener("click", () => showTab(t.dataset.tab)));
  const initial = location.hash.replace("#", "");
  if (initial && panels.some((p) => p.id === initial)) showTab(initial);

  // ---------- 체크리스트 ----------
  const KEY = "mc-guide-checklist";
  let done = {};
  try { done = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (_) {}

  const list = $("#checklist");
  CHECKLIST.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <label>
        <input type="checkbox" data-id="${item.id}" ${done[item.id] ? "checked" : ""}>
        <span>${item.text}</span>
      </label>`;
    list.appendChild(li);
  });
  list.addEventListener("change", (e) => {
    const cb = e.target;
    if (cb.type !== "checkbox") return;
    done[cb.dataset.id] = cb.checked;
    try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (_) {}
    updateProgress();
  });
  function updateProgress() {
    const total = CHECKLIST.length;
    const n = CHECKLIST.filter((c) => done[c.id]).length;
    $("#progressBar").style.width = (n / total) * 100 + "%";
    $("#progressText").textContent =
      n === total ? "첫날 생존 완료. 이제 광물 캐러 가도 됩니다." : `${n} / ${total} 완료`;
  }
  updateProgress();

  // ---------- 광물 차트 ----------
  const Y_MIN = -64, Y_MAX = 320;
  const chart = $("#oreChart");
  const pct = (y) => ((y - Y_MIN) / (Y_MAX - Y_MIN)) * 100;
  ORES.forEach((o) => {
    const row = document.createElement("div");
    row.className = "ore-row";
    row.innerHTML = `
      <div class="ore-name"><span class="swatch" style="background:${o.color}"></span>${o.name}</div>
      <div class="ore-track">
        <span class="ore-range" style="left:${pct(o.min)}%;width:${pct(o.max) - pct(o.min)}%;background:${o.color}"></span>
        <span class="ore-best" style="left:${pct(o.best)}%" title="최적 Y ${o.best}"></span>
      </div>
      <div class="ore-meta">Y ${o.min} ~ ${o.max} · 최적 <strong>${o.best}</strong></div>
      <div class="ore-note">${o.note}</div>`;
    chart.appendChild(row);
  });
  const axis = document.createElement("div");
  axis.className = "ore-axis";
  [-64, 0, 64, 128, 192, 256, 320].forEach((y) => {
    const t = document.createElement("span");
    t.style.left = pct(y) + "%";
    t.textContent = y;
    axis.appendChild(t);
  });
  chart.appendChild(axis);

  // ---------- 몹 카드 ----------
  const mobWrap = $("#mobCards");
  function renderMobs(filter) {
    mobWrap.innerHTML = "";
    const shown = MOBS.filter((m) => filter === "all" || m.type === filter);
    $("#mobCount").textContent = `총 ${MOBS.length}종 중 ${shown.length}종 표시 · 공격력은 일반(Normal) 난이도 기준`;
    shown.forEach((m) => {
      const c = document.createElement("article");
      c.className = "card type-" + m.type;
      c.innerHTML = `
        <div class="card-head">
          <h3>${m.name}</h3>
          <span class="badge">${m.type}</span>
        </div>
        <dl class="kv">
          <div><dt>체력</dt><dd>${m.hp}</dd></div>
          <div><dt>공격</dt><dd>${m.dmg}</dd></div>
          <div><dt>드랍</dt><dd>${m.drop}</dd></div>
        </dl>
        <p class="tip">${m.tip}</p>`;
      mobWrap.appendChild(c);
    });
  }
  renderMobs("all");
  $$("[data-mob]").forEach((b) =>
    b.addEventListener("click", () => {
      $$("[data-mob]").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      renderMobs(b.dataset.mob);
    })
  );

  // ---------- 인챈트 ----------
  const enWrap = $("#enchantCards");
  let enTotal = 0;
  ENCHANTS.forEach((g) => {
    const h = document.createElement("h3");
    h.className = "group-title";
    h.textContent = g.group;
    enWrap.appendChild(h);
    const grid = document.createElement("div");
    grid.className = "cards";
    g.items.forEach((e) => {
      enTotal++;
      const roman = ["", "I", "II", "III", "IV", "V"][e.max] || e.max;
      const treasure = /보물 인챈트/.test(e.note);
      const c = document.createElement("article");
      c.className = "card" + (treasure ? " treasure" : "");
      c.innerHTML = `
        <div class="card-head">
          <h4>${e.name} <span class="eng">${e.eng}</span></h4>
          <span class="badge">최대 ${roman}</span>
        </div>
        <p class="desc">${e.desc}</p>
        ${e.note ? `<p class="tip">${e.note}</p>` : ""}`;
      grid.appendChild(c);
    });
    enWrap.appendChild(grid);
  });
  $("#enchantCount").textContent = `총 ${enTotal}종 · 보물 인챈트(테두리 금색)는 인챈트 테이블에서 안 나오고 상자·거래·낚시로만 얻습니다.`;

  // ---------- 팁 ----------
  const tipList = $("#tipList");
  TIPS.forEach((t, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="num">${String(i + 1).padStart(2, "0")}</span><span>${t}</span>`;
    tipList.appendChild(li);
  });

  // ---------- 검색 ----------
  const search = $("#search");
  search.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    const targets = $$(".card, .checklist li, .ore-row, .tips li");
    if (!q) {
      targets.forEach((el) => el.classList.remove("hidden"));
      return;
    }
    let firstMatchPanel = null;
    targets.forEach((el) => {
      const hit = el.textContent.toLowerCase().includes(q);
      el.classList.toggle("hidden", !hit);
      if (hit && !firstMatchPanel) firstMatchPanel = el.closest(".panel");
    });
    if (firstMatchPanel) showTab(firstMatchPanel.id);
  });
})();
