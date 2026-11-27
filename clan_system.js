// =========================================================================
// 1. CẤU HÌNH LOGO CLAN & HỆ THỐNG RANK CLAN (TÍCH LŨY TỪ LÚC THÀNH LẬP)
// =========================================================================
const CLAN_AVATARS = [
  { id: "clan1", name: "Hiệp sĩ bình minh Gemland", url: "hiepsibinhminhgemland.png" },
  { id: "clan2", name: "Địa ngục la vọng Gemhell", url: "dianguclavonggemhell.png" },
  { id: "clan3", name: "Đất nước Việt", url: "datnuocviet.png" },
  { id: "clan4", name: "Quỷ lùn Rừng Gemeval", url: "quylunrunggemeval.png" },
  { id: "clan5", name: "Bộ tộc Chiến binh Gemeval", url: "botocchienbinhgemeval.png" }
];

const CLAN_RANKS = [
  { minGem: 0,     maxGem: 10000, name: "Tân Binh",     mult: 1.0, cssClass: "clan-rank-0", nextName: "Chiến Binh" },
  { minGem: 10000, maxGem: 30000, name: "Chiến Binh",   mult: 1.1, cssClass: "clan-rank-1", nextName: "Chỉ Huy" },
  { minGem: 30000, maxGem: 50000, name: "Chỉ Huy",     mult: 1.2, cssClass: "clan-rank-2", nextName: "Hiệp Sĩ" },
  { minGem: 50000, maxGem: 100000, name: "Hiệp Sĩ",  mult: 1.3, cssClass: "clan-rank-3", nextName: "Hiệp Sĩ Đại Thập Tự" },
  { minGem: 100000, maxGem: 200000, name: "Hiệp Sĩ Đại Thập Tự",  mult: 1.4, cssClass: "clan-rank-4", nextName: "Thượng Sĩ Tối Cao" },
  { minGem: 200000, maxGem: 500000, name: "Thượng Sĩ Tối Cao",  mult: 1.5, cssClass: "clan-rank-5", nextName: "Max" },
];

const CLAN_CREATE_COST = 500;
const CLAN_DB_ROOT = "https://" + "tich-luy-gempoint-default-rtdb" + ".asia-southeast1." + "firebasedatabase.app";
const clanUser = localStorage.getItem("currentUsername");
const clanUserName = localStorage.getItem("currentStudentName") || clanUser;

window.currentClanMultiplier = 1.0;
window.allClansCache = {};
window.allStudentsCache = {};

(function initClanUI() {
  const style = document.createElement("style");
  style.innerHTML = `
    .clan-tag-wrap { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 8px; font-size: 0.72rem; font-weight: 800; vertical-align: middle; }
    .clan-tag-wrap img { width: 16px; height: 16px; border-radius: 50%; object-fit: cover; background: #fff; }
    .clan-rank-0 { background: #faf5ef; color: #6f4e37; border: 1px solid #d6c7b2; }
    .clan-rank-1 { background: #ecfdf5; color: #065f46; border: 1px solid #34d399; box-shadow: 0 0 6px rgba(16, 185, 129, 0.2); }
    .clan-rank-2 { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); color: #92400e; border: 1px solid #f59e0b; box-shadow: 0 0 10px rgba(245, 158, 11, 0.35); }
    .clan-rank-3 { background: linear-gradient(135deg, #3e2723 0%, #5d4037 100%); border: 1.5px solid #facc15; box-shadow: 0 0 12px rgba(250, 204, 21, 0.65); }
    .clan-rank-3 span {
      background: linear-gradient(90deg, #fef08a, #f59e0b, #fef08a); background-size: 200% auto;
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: clanLegendShine 2.5s linear infinite;
    }
    @keyframes clanLegendShine { to { background-position: 200% center; } }

    .clan-modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(67, 40, 24, 0.55);
      backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
      display: none; justify-content: center; align-items: center; padding: 16px; z-index: 10020;
    }
    .clan-modal-overlay.open { display: flex; }
    .clan-modal-card {
      background: #fdf8f2; width: 100%; max-width: 490px; max-height: 88vh;
      display: flex; flex-direction: column; border-radius: 26px; overflow: hidden;
      box-shadow: 0 25px 55px rgba(67, 40, 24, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.6) inset;
      border: 2px solid #e6d5c1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #432818; animation: clanPop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes clanPop { from { transform: scale(0.93); opacity: 0; } to { transform: scale(1); opacity: 1; } }

    .clan-modal-head {
      background: linear-gradient(135deg, #f7ead9 0%, #edd7bc 60%, #e3c49e 100%);
      color: #432818; padding: 20px 22px; text-align: center; position: relative; border-bottom: 1.5px solid #dcc3a6;
    }
    .clan-modal-head h3 { font-size: 1.22rem; font-weight: 900; letter-spacing: 0.4px; color: #3e2723; text-transform: uppercase; }
    .clan-modal-head p { font-size: 0.82rem; color: #7f5539; margin-top: 4px; font-weight: 700; }
    .clan-close-x {
      position: absolute; top: 14px; right: 14px; background: rgba(67, 40, 24, 0.1); color: #432818;
      border: 1px solid rgba(67, 40, 24, 0.15); width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-weight: bold;
    }
    .clan-modal-body { padding: 20px; overflow-y: auto; }
    .clan-avt-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 10px 0 16px 0; }
    .clan-avt-item { border: 1.5px solid #e6d5c1; border-radius: 14px; padding: 10px 6px; text-align: center; cursor: pointer; background: #ffffff; transition: 0.2s; }
    .clan-avt-item.selected { border: 2px solid #9c6644; background: #f5ebe0; box-shadow: 0 4px 12px rgba(156, 102, 68, 0.18); }
    .clan-avt-item img { width: 46px; height: 46px; border-radius: 50%; object-fit: cover; background: #fff; border: 1.5px solid #e6d5c1; }
    .clan-avt-item div { font-size: 0.72rem; font-weight: 700; margin-top: 5px; color: #432818; }
    .clan-input { width: 100%; padding: 11px 14px; border: 1.5px solid #d5bdaf; border-radius: 12px; font-size: 0.92rem; font-weight: 700; margin-bottom: 12px; background: #ffffff; color: #432818; outline: none; }
    .clan-btn-main { width: 100%; background: linear-gradient(135deg, #9c6644 0%, #7f5539 100%); color: #fdf8f2; border: none; padding: 12px; border-radius: 12px; font-weight: 800; cursor: pointer; font-size: 0.94rem; }
    .clan-list-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; border: 1.5px solid #e6d5c1; border-radius: 14px; margin-bottom: 10px; background: #ffffff; }
    .clan-list-row button { background: #edd7bc !important; color: #432818 !important; border: 1px solid #d5bdaf !important; font-weight: 800 !important; }
    /* Thanh tích lũy GemPoint từ lúc thành lập Clan */
    .clan-progress-box {
      background: #ffffff;
      border: 1.5px solid #e6d5c1;
      border-radius: 14px;
      padding: 12px 14px;
      margin-top: 12px;
      text-align: left;
    }
    .clan-progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.78rem;
      font-weight: 800;
      color: #582f0e;
      margin-bottom: 6px;
    }
    .clan-progress-track {
      width: 100%;
      height: 12px;
      background: #f5ebe0;
      border: 1px solid #d5bdaf;
      border-radius: 99px;
      overflow: hidden;
    }
    .clan-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #d97706 0%, #f59e0b 60%, #fde047 100%);
      border-radius: 99px;
      transition: width 0.5s ease;
    }
    .clan-progress-foot {
      display: flex;
      justify-content: space-between;
      font-size: 0.74rem;
      color: #7f5539;
      font-weight: 700;
      margin-top: 6px;
    }
  `;
  document.head.appendChild(style);

  const modal = document.createElement("div");
  modal.id = "clanSystemModal";
  modal.className = "clan-modal-overlay";
  modal.onclick = function(e) { if (e.target.id === "clanSystemModal") closeClanModal(); };
  modal.innerHTML = `
    <div class="clan-modal-card">
      <div class="clan-modal-head">
        <button class="clan-close-x" onclick="closeClanModal()">✕</button>
        <h3>ĐỒNG MINH GEMCLAN</h3>
        <p>Đoàn kết cày GemPoint • Nâng Rank Clan • Nhận nhân điểm x1.5</p>
      </div>
      <div class="clan-modal-body" id="clanModalBodyContent">GemClan is loading ...</div>
    </div>
  `;
  document.body.appendChild(modal);
})();

// Tính Rank và Tổng GemPoint tích lũy từ lúc thành lập Clan
function calculateClanStats(clanObj, allStudents) {
  const members = clanObj.members || {};
  const totalGem = Math.round(Number(clanObj.accumulatedGem || 0) * 100) / 100;

  let currentRank = CLAN_RANKS.at(0);
  for (let i = CLAN_RANKS.length - 1; i >= 0; i--) {
    if (totalGem >= CLAN_RANKS[i].minGem) {
      currentRank = CLAN_RANKS[i];
      break;
    }
  }
  return { totalGem, rank: currentRank, memberCount: Object.keys(members).length };
}

window.getClanBadgeHTML = function(username) {
  const st = window.allStudentsCache[username];
  if (!st || !st.clanId || !window.allClansCache[st.clanId]) return "";

  const clan = window.allClansCache[st.clanId];
  const stats = calculateClanStats(clan, window.allStudentsCache);
  return `
    <span class="clan-tag-wrap ${stats.rank.cssClass}" title="Rank ${stats.rank.name} (x${stats.rank.mult} Gem)">
      <img src="${clan.avatar}" alt="Clan">
      <span>[${clan.name}]</span>
    </span>
  `;
};
async function syncClanSystemData() {
  try {
    const [resSt, resClans] = await Promise.all([
      fetch(`${CLAN_DB_ROOT}/students.json?t=${Date.now()}`),
      fetch(`${CLAN_DB_ROOT}/clans.json?t=${Date.now()}`)
    ]);
    window.allStudentsCache = (await resSt.json()) || {};
    window.allClansCache = (await resClans.json()) || {};

    if (!clanUser) return;

    // 1. Tự động dò ngược trong danh sách clans nếu students[clanUser].clanId vô tình bị ghi đè mất
    let myClanId = window.allStudentsCache[clanUser]?.clanId || null;
    if (!myClanId || !window.allClansCache[myClanId]) {
      for (const [cid, cObj] of Object.entries(window.allClansCache)) {
        if (cObj && cObj.members && cObj.members[clanUser]) {
          myClanId = cid;
          // Tự động vá lại clanId vào hồ sơ học viên
          fetch(`${CLAN_DB_ROOT}/students/${clanUser}.json`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clanId: cid })
          }).catch(() => {});
          break;
        }
      }
    }

    // 2. Đồng bộ điểm tích lũy và cập nhật hệ số nhân Clan
    if (myClanId && window.allClansCache[myClanId]) {
      const clan = window.allClansCache[myClanId];
      const snapshots = clan.memberSnapshots || {};
      let accGem = Number(clan.accumulatedGem || 0);
      let changed = false;
      const nextSnapshots = { ...snapshots };

      Object.keys(clan.members || {}).forEach(u => {
        const st = window.allStudentsCache[u];
        if (!st) return;
        const curGP = Number(st.gempoint || 0);
        if (nextSnapshots[u] === undefined) {
          nextSnapshots[u] = curGP;
          changed = true;
        } else {
          const earnedDelta = curGP - Number(nextSnapshots[u]);
          if (earnedDelta > 0) {
            accGem = Math.round((accGem + earnedDelta) * 100) / 100;
            nextSnapshots[u] = curGP;
            changed = true;
          } else if (earnedDelta < 0) {
            nextSnapshots[u] = curGP;
            changed = true;
          }
        }
      });

      if (changed) {
        clan.accumulatedGem = accGem;
        clan.memberSnapshots = nextSnapshots;
        await fetch(`${CLAN_DB_ROOT}/clans/${myClanId}.json`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accumulatedGem: accGem, memberSnapshots: nextSnapshots })
        }).catch(() => {});
      }

      const stats = calculateClanStats(clan, window.allStudentsCache);
      window.currentClanMultiplier = stats.rank.mult;
    } else {
      window.currentClanMultiplier = 1.0;
    }
  } catch (e) {
    console.error("Lỗi đồng bộ dữ liệu Clan:", e);
  }
}


let selectedNewClanAvatar = CLAN_AVATARS.at(0).url;

async function openClanModal() {
  if (!clanUser) {
    alert("Vui lòng đăng nhập tài khoản trước khi sử dụng tính năng Clan!");
    return;
  }
  document.getElementById("clanSystemModal").classList.add("open");
  await syncClanSystemData();
  renderClanModalBody();
}

function closeClanModal() {
  document.getElementById("clanSystemModal").classList.remove("open");
}
function renderClanModalBody() {
  const body = document.getElementById("clanModalBodyContent");
  const me = window.allStudentsCache[clanUser] || {};
  const myGem = Number(me.gempoint || 0);
    let myClanId = me.clanId;
  if (!myClanId || !window.allClansCache[myClanId]) {
    for (const [cid, cObj] of Object.entries(window.allClansCache)) {
      if (cObj && cObj.members && cObj.members[clanUser]) {
        myClanId = cid;
        break;
      }
    }
  }


  // TRƯỜNG HỢP 1: ĐÃ GIA NHẬP CLAN -> Hiện thẻ Clan + Thanh tích lũy GemPoint từ lúc thành lập + Rank Clan
  if (myClanId && window.allClansCache[myClanId]) {
    const clan = window.allClansCache[myClanId];
    const stats = calculateClanStats(clan, window.allStudentsCache);
    const isLeader = (clan.leader === clanUser);

    const isMaxRank = (stats.rank.minGem >= 50000);
    const span = stats.rank.maxGem - stats.rank.minGem;
    const progressPct = isMaxRank ? 100 : Math.min(100, Math.max(4, Math.round(((stats.totalGem - stats.rank.minGem) / span) * 100)));
    const progressLabel = isMaxRank
      ? `${stats.totalGem.toLocaleString("vi-VN")} GP (Tối đa)`
      : `${stats.totalGem.toLocaleString("vi-VN")} / ${stats.rank.maxGem.toLocaleString("vi-VN")} GP`;
    const nextRankHint = isMaxRank
      ? "Đã đạt đỉnh cao Huyền Thoại"
      : `Còn ${Math.max(0, Math.round((stats.rank.maxGem - stats.totalGem) * 100) / 100).toLocaleString("vi-VN")} GP lên ${stats.rank.nextName}`;

    let memberHTML = "";
    Object.keys(clan.members || {}).forEach(u => {
      const mInfo = window.allStudentsCache[u] || { name: u, gempoint: 0 };
      memberHTML += `<div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px dashed #e6d5c1; font-size:0.86rem;">
        <span><b>${mInfo.name}</b> ${u === clan.leader ? '(Trưởng Clan)' : ''}</span>
        <span style="color:#b45309; font-weight:700;"> ${mInfo.gempoint || 0}</span>
      </div>`;
    });

    body.innerHTML = `
      <div style="text-align:center; padding:16px; background:#f5ebe0; border-radius:18px; border:1.5px solid #dcc3a6; margin-bottom:14px;">
                <div style="position:relative; display:inline-block;">
          <img id="currentClanAvtImg" src="${clan.avatar}" style="width:68px; height:68px; border-radius:50%; border:2.5px solid #7f5539; object-fit:cover; background:#fff;">
          ${isLeader ? `<button type="button" onclick="toggleChangeClanAvatarBox()" style="display:block; margin:6px auto 0; background:#9c6644; color:#fdf8f2; border:none; padding:4px 12px; border-radius:99px; font-size:0.74rem; font-weight:800; cursor:pointer; box-shadow:0 2px 6px rgba(67,40,24,0.2);">Đổi Avatar Clan</button>` : ''}
        </div>

        ${isLeader ? `
        <div id="changeClanAvatarBox" style="display:none; margin-top:12px; padding:12px; background:#ffffff; border:1.5px dashed #d5bdaf; border-radius:14px;">
          <div style="font-size:0.78rem; font-weight:800; color:#582f0e; margin-bottom:6px;">Chọn Avatar mới cho Clan:</div>
          <div class="clan-avt-grid" style="margin-bottom:0;">
            ${CLAN_AVATARS.map(a => `
              <div class="clan-avt-item ${a.url === clan.avatar ? 'selected' : ''}" onclick="saveChangedClanAvatar('${myClanId}', '${a.url}')">
                <img src="${a.url}" alt="${a.name}">
                <div>${a.name}</div>
              </div>
            `).join("")}
          </div>
        </div>` : ''}

        <div style="margin-top:8px;">${window.getClanBadgeHTML(clanUser)}</div>
        <div style="font-size:0.9rem; font-weight:900; color:#432818; margin-top:6px;">
          Rank hiện tại: <span style="color:#9c6644;">${stats.rank.name}</span> • Quyền lợi: <span style="color:#15803d;">x${stats.rank.mult} GemPoint</span>
        </div>

        <div class="clan-progress-box">
          <div class="clan-progress-header">
            <span>Tích lũy</span>
            <span style="color:#b45309;">${stats.totalGem.toLocaleString("vi-VN")} GemPoint</span>
          </div>
          <div class="clan-progress-track">
            <div class="clan-progress-fill" style="width:${progressPct}%;"></div>
          </div>
          <div class="clan-progress-foot">
            <span>${progressLabel}</span>
            <span>${nextRankHint}</span>
          </div>
        </div>
      </div>

      <div style="font-weight:800; font-size:0.85rem; margin-bottom:6px; color:#432818;">Danh sách thành viên (${stats.memberCount}):</div>
      <div style="background:#fff; border:1.5px solid #e6d5c1; border-radius:12px; padding:10px; margin-bottom:14px;">${memberHTML}</div>
      <button onclick="leaveCurrentClan('${myClanId}', ${isLeader})" style="width:100%; background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; padding:10px; border-radius:12px; font-weight:800; cursor:pointer;">
        ${isLeader ? 'Giải tán Clan' : 'Rời khỏi Clan'}
      </button>
    `;
    return;
  }

  // TRƯỜNG HỢP 2: CHƯA CÓ CLAN
  let avtGrid = "";
  CLAN_AVATARS.forEach(a => {
    const sel = (a.url === selectedNewClanAvatar) ? "selected" : "";
    avtGrid += `<div class="clan-avt-item ${sel}" onclick="pickClanLogo('${a.url}', this)"><img src="${a.url}" alt="${a.name}"><div>${a.name}</div></div>`;
  });

  let existingClansHTML = "";
  const clanKeys = Object.keys(window.allClansCache);
  if (clanKeys.length === 0) {
    existingClansHTML = `<p style="font-size:0.84rem; color:#7f5539; text-align:center;">Chưa có Clan nào được thành lập. Hãy là người đầu tiên!</p>`;
  } else {
    clanKeys.forEach(cId => {
      const c = window.allClansCache[cId];
      const st = calculateClanStats(c, window.allStudentsCache);
      existingClansHTML += `
        <div class="clan-list-row">
          <div style="display:flex; align-items:center; gap:10px;">
            <img src="${c.avatar}" style="width:38px; height:38px; border-radius:50%; object-fit:cover; border:1.5px solid #d5bdaf;">
            <div>
              <div style="font-weight:800; font-size:0.9rem; color:#432818;">${c.name}</div>
              <div style="font-size:0.75rem; color:#7f5539;">Rank ${st.rank.name} (x${st.rank.mult}) • Tích lũy: <b>${st.totalGem.toLocaleString("vi-VN")} GP</b> • ${st.memberCount} TV</div>
            </div>
          </div>
          <button onclick="joinExistingClan('${cId}')" style="padding:7px 14px; border-radius:10px; font-size:0.8rem; cursor:pointer;">Gia nhập</button>
        </div>
      `;
    });
  }

  body.innerHTML = `
    <div style="background:#ffffff; border:1.5px solid #e6d5c1; border-radius:16px; padding:14px; margin-bottom:18px;">
      <div style="font-weight:800; font-size:0.92rem; margin-bottom:6px; color:#432818;">Thành lập GemClan mới</div>
      <div style="font-size:0.8rem; color:#7f5539; margin-bottom:8px;">Số dư hiện tại của bạn: <b>${myGem} GemPoint</b></div>
      <input type="text" id="newClanNameInput" class="clan-input" maxlength="16" placeholder="Tạo tên Clan thật ngầu (tối đa 16 ký tự) ...">
      <div style="font-size:0.78rem; font-weight:700; color:#582f0e;">Chọn Avatar cho Clan:</div>
      <div class="clan-avt-grid">${avtGrid}</div>
      <button class="clan-btn-main" onclick="createNewClan()">Tạo GemClan (500 GemPoint)</button>
    </div>
    <div style="font-weight:800; font-size:0.92rem; margin-bottom:10px; color:#432818;">Gia nhập GemClan có sẵn</div>
    ${existingClansHTML}
  `;
}

function pickClanLogo(url, el) {
  selectedNewClanAvatar = url;
  document.querySelectorAll(".clan-avt-item").forEach(i => i.classList.remove("selected"));
  el.classList.add("selected");
}

async function createNewClan() {
  const nameInput = document.getElementById("newClanNameInput").value.trim();
  if (!nameInput) { alert("Vui lòng nhập tên Clan!"); return; }
  const me = window.allStudentsCache[clanUser] || {};
  const myGem = Number(me.gempoint || 0);
  if (me.clanId) { alert("Bạn đã tham gia một Clan rồi!"); return; }
  if (myGem < CLAN_CREATE_COST) { alert(`Bạn cần đủ ${CLAN_CREATE_COST} GemPoint để thành lập Clan (hiện có ${myGem} GemPoint)!`); return; }
  if (!confirm(`Xác nhận dùng 500 GemPoint để thành lập Clan "${nameInput}"?`)) return;

  const newClanId = "CLAN_" + Date.now();
  const remainingGem = Math.round((myGem - CLAN_CREATE_COST) * 100) / 100;

  await fetch(`${CLAN_DB_ROOT}/clans/${newClanId}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: nameInput, avatar: selectedNewClanAvatar, leader: clanUser,
      createdAt: Date.now(), accumulatedGem: 0,
      memberSnapshots: { [clanUser]: remainingGem },
      members: { [clanUser]: true }
    })
  });
  await fetch(`${CLAN_DB_ROOT}/students/${clanUser}.json`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gempoint: remainingGem, clanId: newClanId })
  });

  const scoreDisplay = document.getElementById("currentScoreDisplay");
  if (scoreDisplay) scoreDisplay.innerText = remainingGem;

  alert(`Clan "${nameInput}" đã được thành lập!`);
  await syncClanSystemData();
  renderClanModalBody();
}

async function joinExistingClan(clanId) {
  const me = window.allStudentsCache[clanUser] || {};
  if (me.clanId) { alert("Mỗi học viên chỉ được tham gia 1 Clan duy nhất!"); return; }
  const myGem = Number(me.gempoint || 0);

  await fetch(`${CLAN_DB_ROOT}/clans/${clanId}/members/${clanUser}.json`, {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(true)
  });
  await fetch(`${CLAN_DB_ROOT}/clans/${clanId}/memberSnapshots/${clanUser}.json`, {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(myGem)
  });
  await fetch(`${CLAN_DB_ROOT}/students/${clanUser}.json`, {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clanId: clanId })
  });

  alert("Gia nhập Clan thành công!");
  await syncClanSystemData();
  renderClanModalBody();
}

async function leaveCurrentClan(clanId, isLeader) {
  const msg = isLeader
    ? "Bạn là Trưởng Clan. Nếu thoát, Clan sẽ bị giải tán vĩnh viễn. Bạn chắc chắn muốn tiếp tục chứ?"
    : "Bạn có chắc muốn rời khỏi Clan này không?";
  if (!confirm(msg)) return;

  if (isLeader) {
    const clan = window.allClansCache[clanId];
    for (const mUser of Object.keys(clan.members || {})) {
      await fetch(`${CLAN_DB_ROOT}/students/${mUser}/clanId.json`, { method: "DELETE" });
    }
    await fetch(`${CLAN_DB_ROOT}/clans/${clanId}.json`, { method: "DELETE" });
  } else {
    await fetch(`${CLAN_DB_ROOT}/clans/${clanId}/members/${clanUser}.json`, { method: "DELETE" });
    await fetch(`${CLAN_DB_ROOT}/clans/${clanId}/memberSnapshots/${clanUser}.json`, { method: "DELETE" });
    await fetch(`${CLAN_DB_ROOT}/students/${clanUser}/clanId.json`, { method: "DELETE" });
  }

  await syncClanSystemData();
  renderClanModalBody();
}

function toggleChangeClanAvatarBox() {
  const box = document.getElementById("changeClanAvatarBox");
  if (box) {
    box.style.display = (box.style.display === "none") ? "block" : "none";
  }
}

async function saveChangedClanAvatar(clanId, newAvatarUrl) {
  if (!clanId || !newAvatarUrl) return;
  try {
    // Lưu trực tiếp avatar mới lên Firebase (PATCH để giữ nguyên toàn bộ dữ liệu Clan)
    await fetch(`${CLAN_DB_ROOT}/clans/${clanId}.json`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatar: newAvatarUrl })
    });

    // Cập nhật ngay trong bộ nhớ tạm và vẽ lại Modal + Bảng Xếp Hạng (nếu đang mở)
    if (window.allClansCache[clanId]) {
      window.allClansCache[clanId].avatar = newAvatarUrl;
    }
    renderClanModalBody();
    if (typeof loadClanLeaderboard === "function") {
      await loadClanLeaderboard();
    }
    if (typeof loadLeaderboard === "function") {
      await loadLeaderboard();
    }
  } catch (e) {
    alert("Lỗi kết nối khi đổi Avatar Clan, vui lòng thử lại!");
  }
}


window.addEventListener("DOMContentLoaded", syncClanSystemData);
