 // =========================================================================
// 1. CẤU HÌNH LOGO CLAN & HỆ THỐNG RANK CLAN (TỰ ĐỘNG NHÂN ĐIỂM)
// =========================================================================
const CLAN_AVATARS = [
  { id: "clan1", name: "Hiệp sĩ bình minh Gemland", url: "hiepsibinhminhgemland.png" },
  { id: "clan2", name: "Địa ngục la vọng Gemhell", url: "dianguclavonggemhell.png" },
  { id: "clan3", name: "Đất nước Việt", url: "datnuocviet.png" },
  { id: "clan4", name: "Quỷ lùn Rừng Gemeval", url: "quylunrunggemeval.png" },
  { id: "clan5", name: "Bộ tộc Chiến binh Gemeval", url: "botocchienbinhgemeval.png" }
 
];

// Bảng Rank Clan tính theo TỔNG GEMPOINT của tất cả thành viên trong Clan
const CLAN_RANKS = [
  { minGem: 0,    name: "Tân Binh",     mult: 1.0, cssClass: "clan-rank-0" },
  { minGem: 1000, name: "Chiến Binh",   mult: 1.1, cssClass: "clan-rank-1" },
  { minGem: 2500, name: "Tinh Anh",     mult: 1.2, cssClass: "clan-rank-2" },
  { minGem: 5000, name: "Huyền Thoại",  mult: 1.3, cssClass: "clan-rank-3" } // Tối đa x1.3
];

const CLAN_CREATE_COST = 500;
const CLAN_DB_ROOT = "https://" + "tich-luy-gempoint-default-rtdb" + ".asia-southeast1." + "firebasedatabase.app";
const clanUser = localStorage.getItem("currentUsername");
const clanUserName = localStorage.getItem("currentStudentName") || clanUser;

// Biến toàn cục để các trang Quiz / Scramble đọc được hệ số nhân của Clan hiện tại
window.currentClanMultiplier = 1.0;
window.allClansCache = {};
window.allStudentsCache = {};

// 2. Chèn CSS Hiệu ứng chữ Rank Clan & Giao diện Cửa sổ Quản lý Clan


 // 2. Chèn CSS Hiệu ứng chữ Rank Clan & Giao diện Modal Tông Trà Sữa Sang Trọng
(function initClanUI() {
  const style = document.createElement("style");
  style.innerHTML = `
    /* --- HIỆU ỨNG CHỮ TÊN CLAN THEO TỪNG BẬC RANK --- */
    .clan-tag-wrap {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 8px;
      font-size: 0.72rem;
      font-weight: 800;
      vertical-align: middle;
    }
    .clan-tag-wrap img {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      object-fit: cover;
      background: #fff;
    }

    /* Rank 0: Tân Binh (x1.0) - Tông trà sữa nhẹ */
    .clan-rank-0 {
      background: #faf5ef;
      color: #6f4e37;
      border: 1px solid #d6c7b2;
    }
    /* Rank 1: Chiến Binh (x1.1) - Xanh ngọc trầm */
    .clan-rank-1 {
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #34d399;
      box-shadow: 0 0 6px rgba(16, 185, 129, 0.2);
    }
    /* Rank 2: Tinh Anh (x1.2) - Vàng caramel ánh kim */
    .clan-rank-2 {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      color: #92400e;
      border: 1px solid #f59e0b;
      box-shadow: 0 0 10px rgba(245, 158, 11, 0.35);
    }
    /* Rank 3: Huyền Thoại (x1.3) - Nền nâu espresso viền vàng chạy sáng */
    .clan-rank-3 {
      background: linear-gradient(135deg, #3e2723 0%, #5d4037 100%);
      border: 1.5px solid #facc15;
      box-shadow: 0 0 12px rgba(250, 204, 21, 0.65);
    }
    .clan-rank-3 span {
      background: linear-gradient(90deg, #fef08a, #f59e0b, #fef08a);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: clanLegendShine 2.5s linear infinite;
    }
    @keyframes clanLegendShine {
      to { background-position: 200% center; }
    }

    /* --- CỬA SỔ MODAL QUẢN LÝ CLAN TÔNG TRÀ SỮA --- */
    .clan-modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(67, 40, 24, 0.55); 
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: none; justify-content: center; align-items: center;
      padding: 16px; z-index: 10020;
    }
    .clan-modal-overlay.open { display: flex; }
    
    .clan-modal-card {
      background: #fdf8f2; /* Nền kem trà sữa chủ đạo */
      width: 100%; max-width: 490px; max-height: 88vh;
      display: flex; flex-direction: column; border-radius: 26px; overflow: hidden;
      box-shadow: 0 25px 55px rgba(67, 40, 24, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.6) inset; 
      border: 2px solid #e6d5c1;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #432818;
      animation: clanPop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes clanPop { from { transform: scale(0.93); opacity: 0; } to { transform: scale(1); opacity: 1; } }

    /* Header vàng nhạt trà sữa chuyển sắc */
    .clan-modal-head {
      background: linear-gradient(135deg, #f7ead9 0%, #edd7bc 60%, #e3c49e 100%);
      color: #432818; 
      padding: 20px 22px; 
      text-align: center; 
      position: relative;
      border-bottom: 1.5px solid #dcc3a6;
    }
    .clan-modal-head h3 {
      font-size: 1.22rem;
      font-weight: 900;
      letter-spacing: 0.4px;
      color: #3e2723;
      text-transform: uppercase;
    }
    .clan-modal-head p {
      font-size: 0.82rem;
      color: #7f5539;
      margin-top: 4px;
      font-weight: 700;
    }
    .clan-close-x {
      position: absolute; top: 14px; right: 14px; 
      background: rgba(67, 40, 24, 0.1);
      color: #432818; border: 1px solid rgba(67, 40, 24, 0.15); 
      width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-weight: bold;
      transition: 0.2s;
    }
    .clan-close-x:hover { background: rgba(67, 40, 24, 0.2); }

    .clan-modal-body { padding: 20px; overflow-y: auto; }
    
    /* Lưới chọn Avatar Clan */
    .clan-avt-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 10px 0 16px 0; }
    .clan-avt-item {
      border: 1.5px solid #e6d5c1; border-radius: 14px; padding: 10px 6px; 
      text-align: center; cursor: pointer; background: #ffffff;
      transition: all 0.2s ease;
    }
    .clan-avt-item:hover { border-color: #b08968; transform: translateY(-2px); }
    .clan-avt-item.selected { 
      border: 2px solid #9c6644; 
      background: #f5ebe0; 
      box-shadow: 0 4px 12px rgba(156, 102, 68, 0.18); 
    }
    .clan-avt-item img { width: 46px; height: 46px; border-radius: 50%; object-fit: cover; background: #fff; border: 1.5px solid #e6d5c1; }
    .clan-avt-item div { font-size: 0.72rem; font-weight: 700; margin-top: 5px; color: #432818; }
    
    /* Ô nhập tên Clan */
    .clan-input { 
      width: 100%; padding: 11px 14px; 
      border: 1.5px solid #d5bdaf; border-radius: 12px; 
      font-size: 0.92rem; font-weight: 700; margin-bottom: 12px; 
      background: #ffffff; color: #432818; outline: none;
    }
    .clan-input:focus { border-color: #9c6644; box-shadow: 0 0 0 3px rgba(156, 102, 68, 0.15); }

    /* Nút bấm chính tông nâu caramel sang trọng */
    .clan-btn-main { 
      width: 100%; 
      background: linear-gradient(135deg, #9c6644 0%, #7f5539 100%); 
      color: #fdf8f2; border: none; padding: 12px; border-radius: 12px; 
      font-weight: 800; cursor: pointer; font-size: 0.94rem; 
      box-shadow: 0 6px 16px rgba(127, 85, 57, 0.25);
      transition: 0.2s;
    }
    .clan-btn-main:hover { background: linear-gradient(135deg, #7f5539 0%, #582f0e 100%); transform: translateY(-1px); }

    /* Danh sách các Clan có sẵn */
    .clan-list-row { 
      display: flex; justify-content: space-between; align-items: center; 
      padding: 12px 14px; border: 1.5px solid #e6d5c1; border-radius: 14px; 
      margin-bottom: 10px; background: #ffffff; 
      box-shadow: 0 3px 10px rgba(67, 40, 24, 0.04);
    }
    .clan-list-row button {
      background: #edd7bc !important;
      color: #432818 !important;
      border: 1px solid #d5bdaf !important;
      font-weight: 800 !important;
      transition: 0.2s;
    }
    .clan-list-row button:hover {
      background: #9c6644 !important;
      color: #ffffff !important;
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
        <p>Đoàn kết cày GemPoint • Nâng Rank Clan • Nhận nhân điểm x1.3</p>
      </div>
      <div class="clan-modal-body" id="clanModalBodyContent">GemClan is loading ...</div>
    </div>
  `;
  document.body.appendChild(modal);
})();


// Tính Rank và Tổng điểm của một Clan dựa trên toàn bộ thành viên
function calculateClanStats(clanObj, allStudents) {
  let totalGem = 0;
  const members = clanObj.members || {};
  Object.keys(members).forEach(u => {
    if (allStudents[u] && typeof allStudents[u].gempoint === "number") {
      totalGem += allStudents[u].gempoint;
    }
  });
  totalGem = Math.round(totalGem * 100) / 100;

  let currentRank = CLAN_RANKS;
  for (let i = CLAN_RANKS.length - 1; i >= 0; i--) {
    if (totalGem >= CLAN_RANKS[i].minGem) {
      currentRank = CLAN_RANKS[i];
      break;
    }
  }
  return { totalGem, rank: currentRank, memberCount: Object.keys(members).length };
}

// Hàm tạo thẻ HTML hiển thị [Logo Clan + Tên Clan hiệu ứng Rank] dùng cho BXH & GemSphere
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

// Tải dữ liệu Clan và cập nhật hệ số nhân điểm của người chơi hiện tại
async function syncClanSystemData() {
  try {
    const [resSt, resClans] = await Promise.all([
      fetch(`${CLAN_DB_ROOT}/students.json?t=${Date.now()}`),
      fetch(`${CLAN_DB_ROOT}/clans.json?t=${Date.now()}`)
    ]);
    window.allStudentsCache = (await resSt.json()) || {};
    window.allClansCache = (await resClans.json()) || {};

    if (clanUser && window.allStudentsCache[clanUser]) {
      const myClanId = window.allStudentsCache[clanUser].clanId;
      if (myClanId && window.allClansCache[myClanId]) {
        const stats = calculateClanStats(window.allClansCache[myClanId], window.allStudentsCache);
        window.currentClanMultiplier = stats.rank.mult;
      } else {
        window.currentClanMultiplier = 1.0;
      }
    }
  } catch (e) {
    console.error("Lỗi đồng bộ dữ liệu Clan:", e);
  }
}

let selectedNewClanAvatar = CLAN_AVATARS.url;

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
  const myClanId = me.clanId;

  // TRƯỜNG HỢP 1: Học viên ĐÃ CÓ CLAN -> Hiện thông tin Clan, Rank, thành viên và nút Rời Clan
  if (myClanId && window.allClansCache[myClanId]) {
    const clan = window.allClansCache[myClanId];
    const stats = calculateClanStats(clan, window.allStudentsCache);
    const isLeader = (clan.leader === clanUser);

    let memberHTML = "";
    Object.keys(clan.members || {}).forEach(u => {
      const mInfo = window.allStudentsCache[u] || { name: u, gempoint: 0 };
      memberHTML += `<div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px dashed #e2e8f0; font-size:0.86rem;">
        <span><b>${mInfo.name}</b> ${u === clan.leader ? '(Trưởng Clan)' : ''}</span>
		        <span style="color:#b45309; font-weight:700;"> ${mInfo.gempoint || 0}</span>
      </div>`;
    });

    body.innerHTML = `
      <div style="text-align:center; padding:14px; background:#f8fafc; border-radius:16px; border:1.5px solid #cbd5e1; margin-bottom:14px;">
        <img src="${clan.avatar}" style="width:64px; height:64px; border-radius:50%; border:2px solid #0f172a; object-fit:cover; background:#fff;">
        <div style="margin-top:8px;">${window.getClanBadgeHTML(clanUser)}</div>
        <div style="font-size:0.88rem; font-weight:800; color:#1e3a8a; margin-top:6px;">
          Rank: ${stats.rank.name} • Quyền lợi: <span style="color:#16a34a;">x${stats.rank.mult} GemPoint</span>
        </div>
        <div style="font-size:0.82rem; color:#475569; margin-top:2px;">Tổng điểm Clan: <b>${stats.totalGem} GemPoint</b></div>
      </div>
      <div style="font-weight:800; font-size:0.85rem; margin-bottom:6px;">Danh sách thành viên (${stats.memberCount}):</div>
      <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:10px; margin-bottom:14px;">${memberHTML}</div>
      <button onclick="leaveCurrentClan('${myClanId}', ${isLeader})" style="width:100%; background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; padding:10px; border-radius:12px; font-weight:800; cursor:pointer;">
        ${isLeader ? '⚠️ Giải tán Clan' : '🚪 Rời khỏi Clan'}
      </button>
    `;
    return;
  }

  // TRƯỜNG HỢP 2: Học viên CHƯA CÓ CLAN -> Hiện khung Tạo Clan mới (500 Gem) & Danh sách Clan để gia nhập
  let avtGrid = "";
  CLAN_AVATARS.forEach(a => {
    const sel = (a.url === selectedNewClanAvatar) ? "selected" : "";
    avtGrid += `
      <div class="clan-avt-item ${sel}" onclick="pickClanLogo('${a.url}', this)">
        <img src="${a.url}" alt="${a.name}">
        <div>${a.name}</div>
      </div>
    `;
  });

  let existingClansHTML = "";
  const clanKeys = Object.keys(window.allClansCache);
  if (clanKeys.length === 0) {
    existingClansHTML = `<p style="font-size:0.84rem; color:#64748b; text-align:center;">Chưa có Clan nào được thành lập. Hãy là người đầu tiên!</p>`;
  } else {
    clanKeys.forEach(cId => {
      const c = window.allClansCache[cId];
      const st = calculateClanStats(c, window.allStudentsCache);
      existingClansHTML += `
        <div class="clan-list-row">
          <div style="display:flex; align-items:center; gap:10px;">
            <img src="${c.avatar}" style="width:38px; height:38px; border-radius:50%; object-fit:cover; border:1px solid #cbd5e1;">
            <div>
              <div style="font-weight:800; font-size:0.9rem;">${c.name}</div>
              <div style="font-size:0.75rem; color:#475569;">Rank ${st.rank.name} (x${st.rank.mult}) • ${st.memberCount} thành viên</div>
            </div>
          </div>
          <button onclick="joinExistingClan('${cId}')" style="background:#1e3a8a; color:#fff; border:none; padding:7px 14px; border-radius:10px; font-weight:700; font-size:0.8rem; cursor:pointer;">Gia nhập</button>
        </div>
      `;
    });
  }

  body.innerHTML = `
    <div style="background:#fffbeb; border:1.5px solid #fde68a; border-radius:16px; padding:14px; margin-bottom:18px;">
      <div style="font-weight:800; font-size:0.92rem; margin-bottom:8px;">Thành lập GemClan mới</div>
      <div style="font-size:0.8rem; color:#475569; margin-bottom:8px;">Số dư hiện tại của bạn: <b>${myGem} GemPoint</b></div>
      <input type="text" id="newClanNameInput" class="clan-input" maxlength="16" placeholder="Tạo tên Clan thật ngầu (tối đa 16 ký tự) ...">
      <div style="font-size:0.78rem; font-weight:700;">Chọn Avatar cho Clan:</div>
      <div class="clan-avt-grid">${avtGrid}</div>
      <button class="clan-btn-main" onclick="createNewClan()">Tạo GemClan (500 GemPoint)</button>
    </div>

    <div style="font-weight:800; font-size:0.92rem; margin-bottom:10px;">Gia nhập GemClan có sẵn</div>
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
  if (!nameInput) {
    alert("Vui lòng nhập tên Clan!");
    return;
  }
  const me = window.allStudentsCache[clanUser] || {};
  const myGem = Number(me.gempoint || 0);
  if (me.clanId) {
    alert("Bạn đã tham gia một Clan rồi!");
    return;
  }
  if (myGem < CLAN_CREATE_COST) {
    alert(`Bạn cần đủ ${CLAN_CREATE_COST} GemPoint để thành lập Clan (hiện có ${myGem} GemPoint)!`);
    return;
  }

  const confirmCreate = confirm(`Xác nhận dùng 500 GemPoint để thành lập Clan "${nameInput}"?`);
  if (!confirmCreate) return;

  const newClanId = "CLAN_" + Date.now();
  const remainingGem = Math.round((myGem - CLAN_CREATE_COST) * 100) / 100;

  await fetch(`${CLAN_DB_ROOT}/clans/${newClanId}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: nameInput,
      avatar: selectedNewClanAvatar,
      leader: clanUser,
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

  alert(`Yahoo! Clan "${nameInput}" đã được thành lập và ra khơi!`);
  await syncClanSystemData();
  renderClanModalBody();
}

async function joinExistingClan(clanId) {
  const me = window.allStudentsCache[clanUser] || {};
  if (me.clanId) {
    alert("Mỗi học viên chỉ được tham gia 1 Clan duy nhất!");
    return;
  }

  await fetch(`${CLAN_DB_ROOT}/clans/${clanId}/members/${clanUser}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(true)
  });

  await fetch(`${CLAN_DB_ROOT}/students/${clanUser}.json`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clanId: clanId })
  });

  alert("✅ Gia nhập Clan thành công!");
  await syncClanSystemData();
  renderClanModalBody();
}

async function leaveCurrentClan(clanId, isLeader) {
  const msg = isLeader 
    ? "Bạn là Trưởng Clan. Nếu thoát, Clan sẽ bị giải tán vĩnh viễn. Bạn chắc chắn muốn trở nên vô trách nhiệm chứ?" 
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
    await fetch(`${CLAN_DB_ROOT}/students/${clanUser}/clanId.json`, { method: "DELETE" });
  }

  await syncClanSystemData();
  renderClanModalBody();
}

window.addEventListener("DOMContentLoaded", syncClanSystemData);

