// =========================================================================
// 1. DANH SÁCH AVATAR CỦA GEMFAITH (MIỄN PHÍ / MUA GEM / MỐC ĐIỂM LẤP LÁNH)
// =========================================================================
// Ghi chú: 
// - type: "free"      -> Miễn phí, không có hiệu ứng sáng bóng
// - type: "buy"       -> Dùng GemPoint để mua (tự chỉnh giá ở cost), có hiệu ứng lấp lánh (shiny: true)
// - type: "milestone" -> Đạt đủ mốc điểm sẽ mở khóa (tự chỉnh mốc ở minGem), có hiệu ứng lấp lánh (shiny: true)

const AVATAR_LIST = [
  // Nhóm miễn phí (Không hiệu ứng sáng bóng)
  { id: "avt1", name: "Gấu Gemmy", desc: "Cổ điển", url: "avatargaubasic.jpg", type: "free" },
 

  // Nhóm dùng GemPoint để mua (Có hiệu ứng lấp lánh sáng bóng)
  { id: "avt6", name: "Gấu Geminton", desc: "Cao Thủ Cầu Lông", url: "avatargeminton.png", type: "buy", cost: 2000, shiny: true },
   { id: "avt6", name: "Gấu Gem Lo Lắng", desc: "Gem Toshi Densetsu", url: "gaugemlolang.png", type: "buy", cost: 2000, shiny: true },
   { id: "avt6", name: "Gấu GemKnight", desc: "Hiệp Sĩ GemLand", url: "gemknight.png", type: "buy", cost: 2000, shiny: true },
   { id: "avt6", name: "Gấu GemArcher", desc: "Cung Binh GemLand", url: "gemarcher.png", type: "buy", cost: 2000, shiny: true },
  { id: "avt4", name: "Gấu Gemball", desc: "Fan Argentina", url: "gemball.jpg", type: "buy", cost: 2000, shiny: true },
  { id: "avt5", name: "Gấu Gemball", desc: "Fan Portugal", url: "gemball2.jpg", type: "buy", cost: 2000, shiny: true },
  { id: "avt8", name: "Gấu Gemball", desc: "Fan Spain", url: "gemball3.png", type: "buy", cost: 2000, shiny: true },
  { id: "avt15", name: "Gấu GemHue", desc: "Cố Đô Huế", url: "avatargemhue.jpg", type: "buy", cost: 2500, shiny: true },
  { id: "avt14", name: "Gấu GemWest", desc: "Miền Tây Hào Sảng", url: "avatargaugemwest.jpg", type: "buy", cost: 2500, shiny: true },
  { id: "avt9", name: "Cặp Gấu Hạnh Phúc", desc: "Chan Chứa Tình Yêu", url: "gemlove.png", type: "buy", cost: 3000, shiny: true },
   { id: "avt9", name: "Gấu Gemdino", desc: "Khủng Long Xanh", url: "gemdino.jpg", type: "buy", cost: 3000, shiny: true },
   { id: "avt9", name: "Gấu Gemen", desc: "Ghiền Ramen", url: "avatargemen.png", type: "buy", cost: 3000, shiny: true },

  // Nhóm mở khóa theo mốc điểm (Có hiệu ứng lấp lánh sáng bóng)
   { id: "avt3", name: "Gấu Lowkey", desc: "Hướng Nội", url: "avatarlowkey.png", type: "free", type: "milestone", minGem: 1000 , shiny: true},
  { id: "avt7", name: "Cozy Christmas", desc: "Christmas 2026", url: "Christmas.png", type: "milestone", minGem: 3000, shiny: true },
  { id: "avt10", name: "Gấu Gempling", desc: "Ghiền Há Cảo", url: "gempling.jpg", type: "milestone", minGem: 5000, shiny: true },
   { id: "avt11", name: "Gấu Gemchick", desc: "Ghiền McDonald's", url: "gemchick.jpg", type: "milestone", minGem: 7000, shiny: true },
     { id: "avt2", name: "Gấu Dracula", desc: "Halloween 2026", url: "avatarhalloween2026.jpg", type: "milestone", minGem: 10000, shiny: true  }
];

const DEFAULT_AVATAR = AVATAR_LIST[0].url;
const AVT_DB_URL = "https://" + "tich-luy-gempoint-default-rtdb" + ".asia-southeast1." + "firebasedatabase.app/students";

let userCurrentGem = 0;
// Tự động lấy danh sách các avatar "free" làm mặc định đã sở hữu
let ownedAvatarsList = AVATAR_LIST.filter(a => a.type === "free").map(a => a.url);

// =========================================================================
// 2. CHÈN CSS HIỆU ỨNG LẤP LÁNH & POPUP KHO GEMAVATAR
// =========================================================================
(function initCustomAvatarShopUI() {
  const style = document.createElement("style");
  style.innerHTML = `
    .avt-circle-clip {
      border-radius: 50%;
      overflow: hidden;
      position: relative;
      border: 1.5px solid #cbd5e1;
      background: #ffffff;
      display: inline-block;
      flex-shrink: 0;
    }

    .avt-circle-clip img.base-avt {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    /* HIỆU ỨNG HÀO QUANG TRẮNG SÁNG BÓNG */
    .avt-circle-clip.shiny-avt {
      border: 2px solid #ffffff;
      box-shadow: 0 0 12px rgba(255, 255, 255, 0.95), 0 0 22px rgba(226, 232, 240, 0.85);
      animation: shinyPulse 2.2s infinite alternate;
    }

    .avt-circle-clip.shiny-avt::after {
      content: "";
      position: absolute;
      top: -20%;
      left: -130%;
      width: 70%;
      height: 140%;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.35) 35%,
        rgba(255, 255, 255, 0.98) 50%,
        rgba(255, 255, 255, 0.35) 65%,
        transparent 100%
      );
      transform: skewX(-25deg);
      animation: avtShimmer 2.6s infinite;
      pointer-events: none;
    }
    @keyframes avtShimmer {
      0%, 50% { left: -130%; }
      100% { left: 160%; }
    }
    @keyframes shinyPulse {
      from { 
        box-shadow: 0 0 8px rgba(255, 255, 255, 0.75), 0 0 14px rgba(203, 213, 225, 0.6); 
      }
      to { 
        box-shadow: 0 0 16px rgba(255, 255, 255, 1), 0 0 26px rgba(255, 255, 255, 0.9); 
      }
    }

    /* Popup Modal */
    .avt-modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: none; justify-content: center; align-items: center;
      padding: 16px; z-index: 10010;
    }
    .avt-modal-overlay.open { display: flex; }
    .avt-modal-card {
      background: #ffffff; width: 100%; max-width: 460px; max-height: 88vh;
      display: flex; flex-direction: column; border-radius: 24px; overflow: hidden;
      box-shadow: 0 25px 50px rgba(0,0,0,0.28); border: 2px solid #cbd5e1;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .avt-modal-head {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
      color: #ffffff; padding: 18px 20px; text-align: center; position: relative;
    }
    .avt-modal-head h3 { font-size: 1.15rem; font-weight: 800; }
    .avt-modal-head p { font-size: 0.85rem; color: #fde047; margin-top: 4px; font-weight: 700; }
    .avt-close-btn {
      position: absolute; top: 14px; right: 14px; background: rgba(255,255,255,0.18);
      color: #ffffff; border: none; width: 28px; height: 28px; border-radius: 50%;
      font-weight: bold; cursor: pointer;
    }
    .avt-scroll-body { padding: 18px; overflow-y: auto; }
    .avt-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .avt-option {
      display: flex; flex-direction: column; align-items: center; gap: 5px;
      padding: 12px 6px; border-radius: 14px; border: 2px solid transparent;
      cursor: pointer; transition: all 0.2s ease; background: #f8fafc;
    }
    .avt-option:hover:not(.locked) { background: #eff6ff; border-color: #93c5fd; transform: translateY(-2px); }
    .avt-option.selected { background: #fef9c3; border-color: #eab308; box-shadow: 0 4px 12px rgba(234, 179, 8, 0.25); }
    .avt-option.locked { opacity: 0.65; background: #f1f5f9; }
    .avt-option span.avt-title { font-size: 0.74rem; font-weight: 700; color: #0f172a; text-align: center; }
    .avt-option small { font-size: 0.64rem; font-weight: 600; color: #64748b; text-align: center; }
    
    .tag-buy { font-size: 0.66rem; background: #fef3c7; color: #b45309; border: 1px solid #f59e0b; padding: 2px 7px; border-radius: 8px; font-weight: 800; }
    .tag-lock { font-size: 0.65rem; background: #334155; color: #fde047; padding: 2px 7px; border-radius: 8px; font-weight: 700; }
    .tag-owned { font-size: 0.65rem; color: #16a34a; font-weight: 700; }
  `;

  document.head.appendChild(style);

  const modal = document.createElement("div");
  modal.id = "avatarPickerModal";
  modal.className = "avt-modal-overlay";
  modal.onclick = function(e) { if (e.target.id === "avatarPickerModal") closeAvatarPicker(); };
  modal.innerHTML = `
    <div class="avt-modal-card">
      <div class="avt-modal-head">
        <button class="avt-close-btn" onclick="closeAvatarPicker()">✕</button>
        <h3>Kho GemAvatar</h3>
        <p id="modalUserGemInfo">Số dư của bạn: 0 GemPoint</p>
      </div>
      <div class="avt-scroll-body">
        <div class="avt-grid" id="avtGridContainer"></div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
})();

// Kiểm tra xem URL Avatar này có hiệu ứng lấp lánh (shiny) không
function isAvatarShiny(avtUrl) {
  const found = AVATAR_LIST.find(a => a.url === avtUrl);
  return found && found.shiny === true;
}

// Hàm tạo HTML hiển thị Avatar (tự động gắn hiệu ứng lấp lánh nếu thuộc nhóm buy/milestone)
function buildAvatarHTML(avtUrl, sizePx, extraAttrs = "") {
  const shinyClass = isAvatarShiny(avtUrl) ? "shiny-avt" : "";
  return `
    <div class="avt-circle-clip ${shinyClass}" style="width:${sizePx}px; height:${sizePx}px;" ${extraAttrs}>
      <img src="${avtUrl}" class="base-avt" alt="Avatar">
    </div>
  `;
}

// Vẽ danh sách Avatar trong cửa sổ chọn
function renderAvatarOptions() {
  const savedAvt = localStorage.getItem("currentUserAvatar") || DEFAULT_AVATAR;
  document.getElementById("modalUserGemInfo").innerText = `Số dư hiện có: ${userCurrentGem} GemPoint`;

  const avtGrid = document.getElementById("avtGridContainer");
  avtGrid.innerHTML = "";

  AVATAR_LIST.forEach(item => {
    const isSel = (item.url === savedAvt) ? "selected" : "";
    let statusHTML = "";
    let lockClass = "";

    if (item.type === "free") {
      statusHTML = `<span class="tag-owned">Miễn phí</span>`;
    } else if (item.type === "buy") {
      const isBought = ownedAvatarsList.includes(item.url);
      if (isBought) {
        statusHTML = `<span class="tag-owned">✓ Đã sở hữu</span>`;
      } else {
        statusHTML = `<span class="tag-buy">Trị giá ${item.cost} Gem</span>`;
        if (userCurrentGem < item.cost) lockClass = "locked";
      }
    } else if (item.type === "milestone") {
      const isUnlocked = userCurrentGem >= item.minGem;
      if (isUnlocked) {
        statusHTML = `<span class="tag-owned">Đã mở khóa</span>`;
      } else {
        statusHTML = `<span class="tag-lock">🔒 Mốc ${item.minGem} Gem</span>`;
        lockClass = "locked";
      }
    }

    avtGrid.innerHTML += `
      <div class="avt-option ${isSel} ${lockClass}" onclick="handleAvatarClick('${item.id}')">
        ${buildAvatarHTML(item.url, 58)}
        <span class="avt-title">${item.shiny ? ' ' : ''}${item.name}</span>
        <small>${item.desc || ''}</small>
        ${statusHTML}
      </div>
    `;
  });
}

// Xử lý khi học viên bấm chọn hoặc mua Avatar
async function handleAvatarClick(avtId) {
  const item = AVATAR_LIST.find(a => a.id === avtId);
  if (!item) return;

  if (item.type === "buy" && !ownedAvatarsList.includes(item.url)) {
    if (userCurrentGem < item.cost) {
      alert(`Bạn không đủ GemPoint để đổi "${item.name}"!\nCần ${item.cost} GemPoint (bạn đang có ${userCurrentGem} GemPoint).`);
      return;
    }
    const confirmBuy = confirm(`Dùng ${item.cost} GemPoint để mua Avatar "${item.name}"?\nSố dư còn lại: ${Math.round((userCurrentGem - item.cost) * 100) / 100} GemPoint.`);
    if (!confirmBuy) return;

    userCurrentGem = Math.round((userCurrentGem - item.cost) * 100) / 100;
    ownedAvatarsList.push(item.url);

    const navScore = document.getElementById("navGemScore");
    if (navScore) navScore.innerText = userCurrentGem;
    const hubScore = document.getElementById("currentScoreDisplay");
    if (hubScore) hubScore.innerText = userCurrentGem;

    await saveProfileToDB({
      gempoint: userCurrentGem,
      ownedAvatars: ownedAvatarsList,
      avatar: item.url
    });
  } else if (item.type === "milestone" && userCurrentGem < item.minGem) {
    alert(`🔒 Avatar lấp lánh "${item.name}" sẽ mở khóa khi bạn đạt mốc ${item.minGem} GemPoint!\nHiện tại bạn có ${userCurrentGem} GemPoint.`);
    return;
  } else {
    await saveProfileToDB({ avatar: item.url });
  }

  localStorage.setItem("currentUserAvatar", item.url);
  applyAvatarToDOM(item.url);
  renderAvatarOptions();

  // Đồng bộ Avatar mới vào bộ nhớ tạm và vẽ lại Bảng Xếp Hạng ngay lập tức
  const curUser = localStorage.getItem("currentUsername");
  if (curUser && window.allStudentsCache && window.allStudentsCache[curUser]) {
    window.allStudentsCache[curUser].avatar = item.url;
  }
  if (typeof loadLeaderboard === "function") {
    await loadLeaderboard();
  }
}

function openAvatarPicker() {
  if (!localStorage.getItem("currentUsername")) {
    alert("Vui lòng đăng nhập tài khoản để mở Kho GemAvatar!");
    return;
  }
  syncMyAvatar().then(() => {
    renderAvatarOptions();
    document.getElementById("avatarPickerModal").classList.add("open");
  });
}

function closeAvatarPicker() {
  document.getElementById("avatarPickerModal").classList.remove("open");
}

function applyAvatarToDOM(avtUrl) {
  document.querySelectorAll(".user-avatar-slot").forEach(slot => {
    const size = slot.getAttribute("data-size") || 32;
    slot.innerHTML = buildAvatarHTML(avtUrl, size);
  });
}

async function saveProfileToDB(payload) {
  const user = localStorage.getItem("currentUsername");
  const name = localStorage.getItem("currentStudentName") || user;
  if (!user) return;
  try {
    await fetch(`${AVT_DB_URL}/${user}.json`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name, ...payload })
    });
  } catch (err) {
    console.error("Lỗi lưu Avatar:", err);
  }
}

async function syncMyAvatar() {
  const user = localStorage.getItem("currentUsername");
  let currentAvt = localStorage.getItem("currentUserAvatar") || DEFAULT_AVATAR;
  applyAvatarToDOM(currentAvt);

  if (user) {
    try {
      const res = await fetch(`${AVT_DB_URL}/${user}.json?t=${Date.now()}`);
      const data = await res.json();
      if (data) {
        if (typeof data.gempoint === "number") userCurrentGem = data.gempoint;
        if (data.ownedAvatars && Array.isArray(data.ownedAvatars)) {
          ownedAvatarsList = Array.from(new Set([...ownedAvatarsList, ...data.ownedAvatars]));
        }
        if (data.avatar) {
          currentAvt = data.avatar;
          localStorage.setItem("currentUserAvatar", currentAvt);
        } else if (currentAvt && currentAvt !== DEFAULT_AVATAR) {
          await saveProfileToDB({ avatar: currentAvt });
        }
        applyAvatarToDOM(currentAvt);
      }
    } catch (err) {}
  }
}

window.addEventListener("DOMContentLoaded", syncMyAvatar);


