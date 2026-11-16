// =========================================================================
// DANH SÁCH AVATAR CHO HỌC VIÊN CHỌN (Bạn có thể thêm/sửa link ảnh tại đây)
// =========================================================================
const AVATAR_LIST = [
  { id: "avt1", name: "Gấu Gemmy", desc: "Cổ điển", url: "avatargaubasic.jpg" },
  { id: "avt2", name: "Gấu Dracula", desc: "Halloween 2026", url: "avatarhalloween2026.jpg" },
  { id: "avt3", name: "Gấu Lowkey", desc: "Hướng Nội", url: "avatarlowkey.png" },
  { id: "avt4", name: "Gấu Gemball", desc: "Fan Argentina", url: "gemball.jpg" },
  { id: "avt5", name: "Gấu Gemball", desc: "Fan Portugal", url: "gemball2.jpg" },
  { id: "avt6", name: "Gấu Geminton", desc: "Cao thủ Cầu lông", url: "avatargeminton.png" },
  { id: "avt7", name: "Cozy Christmas", desc: "Christmas 2026", url: "Christmas.png" }
];

const DEFAULT_AVATAR = AVATAR_LIST[0].url;
const AVT_DB_URL = "https://" + "tich-luy-gempoint-default-rtdb" + ".asia-southeast1." + "firebasedatabase.app/students";

// 1. Tự động chèn CSS và Cửa sổ chọn Avatar vào trang
(function initAvatarUI() {
  const style = document.createElement("style");
  style.innerHTML = `
    .avt-modal-overlay {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: none;
      justify-content: center;
      align-items: center;
      padding: 16px;
      z-index: 10010;
    }
    .avt-modal-overlay.open { display: flex; }
    .avt-modal-card {
      background: #ffffff;
      width: 100%;
      max-width: 440px;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 25px 50px rgba(0,0,0,0.25);
      border: 2px solid #cbd5e1;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: avtPop 0.22s ease;
    }
    @keyframes avtPop { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }

    .avt-modal-head {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
      color: #ffffff;
      padding: 18px 20px;
      text-align: center;
      position: relative;
    }
    .avt-modal-head h3 { font-size: 1.15rem; font-weight: 800; }
    .avt-modal-head p { font-size: 0.84rem; color: #cbd5e1; margin-top: 4px; }
    .avt-close-btn {
      position: absolute; top: 14px; right: 14px;
      background: rgba(255,255,255,0.18); color: #ffffff;
      border: none; width: 28px; height: 28px; border-radius: 50%;
      font-weight: bold; cursor: pointer;
    }

    .avt-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      padding: 20px;
    }
    .avt-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 8px 4px;
      border-radius: 14px;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.2s ease;
      background: #f8fafc;
    }
    .avt-option:hover {
      background: #eff6ff;
      border-color: #93c5fd;
      transform: translateY(-2px);
    }
    .avt-option.selected {
      background: #fef9c3;
      border-color: #eab308;
      box-shadow: 0 4px 12px rgba(234, 179, 8, 0.25);
    }
    .avt-option img {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    .avt-option span {
      font-size: 0.72rem;
      font-weight: 700;
      color: #334155;
      text-align: center;
    }
	    .avt-option small {
      font-size: 0.64rem;
      font-weight: 500;
      color: #64748b;
      text-align: center;
      line-height: 1.2;
      display: block;
    }

  `;
  document.head.appendChild(style);

  const modal = document.createElement("div");
  modal.id = "avatarPickerModal";
  modal.className = "avt-modal-overlay";
  modal.onclick = function(e) { if (e.target.id === "avatarPickerModal") closeAvatarPicker(); };

  let gridHTML = "";
  const savedAvt = localStorage.getItem("currentUserAvatar") || DEFAULT_AVATAR;

  AVATAR_LIST.forEach(item => {
    const isSel = (item.url === savedAvt) ? "selected" : "";
    gridHTML += `
      <div class="avt-option ${isSel}" onclick="selectNewAvatar('${item.url}', this)">
        <img src="${item.url}" alt="${item.name}">
        <span>${item.name}</span>
		 <small>${item.desc || ''}</small>
      </div>
    `;
  });

  modal.innerHTML = `
    <div class="avt-modal-card">
      <div class="avt-modal-head">
        <button class="avt-close-btn" onclick="closeAvatarPicker()">✕</button>
        <h3>Chọn Avatar Trong Kho GemAvatar</h3>
        <p>Ảnh đại diện sẽ hiển thị trên Trang chủ & Bảng xếp hạng</p>
      </div>
      <div class="avt-grid" id="avtGridContainer">
        ${gridHTML}
      </div>
    </div>
  `;
  document.body.appendChild(modal);
})();

function openAvatarPicker() {
  const user = localStorage.getItem("currentUsername");
  if (!user) {
    alert("Vui lòng đăng nhập tài khoản để đổi Avatar nhé!");
    return;
  }
  document.getElementById("avatarPickerModal").classList.add("open");
}

function closeAvatarPicker() {
  document.getElementById("avatarPickerModal").classList.remove("open");
}

// Lưu Avatar đã chọn vào bộ nhớ và đồng bộ lên Firebase
async function selectNewAvatar(avatarUrl, el) {
  document.querySelectorAll(".avt-option").forEach(opt => opt.classList.remove("selected"));
  el.classList.add("selected");

  localStorage.setItem("currentUserAvatar", avatarUrl);

  // Cập nhật ngay lập tức tất cả thẻ ảnh avatar trên trang hiện tại
  document.querySelectorAll(".user-avatar-img").forEach(img => {
    img.src = avatarUrl;
  });

  const user = localStorage.getItem("currentUsername");
  const name = localStorage.getItem("currentStudentName") || user;

  if (user) {
    try {
      await fetch(`${AVT_DB_URL}/${user}.json`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          avatar: avatarUrl
        })
      });
    } catch (err) {
      console.error("Lỗi lưu avatar:", err);
    }
  }

  setTimeout(closeAvatarPicker, 250);
}

// Tải Avatar của người dùng từ Firebase khi mở trang
async function syncMyAvatar() {
  const user = localStorage.getItem("currentUsername");
  let currentAvt = localStorage.getItem("currentUserAvatar") || DEFAULT_AVATAR;

  document.querySelectorAll(".user-avatar-img").forEach(img => {
    img.src = currentAvt;
  });

  if (user) {
    try {
      const res = await fetch(`${AVT_DB_URL}/${user}.json?t=${Date.now()}`);
      const data = await res.json();
      if (data && data.avatar) {
        localStorage.setItem("currentUserAvatar", data.avatar);
        document.querySelectorAll(".user-avatar-img").forEach(img => {
          img.src = data.avatar;
        });
      }
    } catch (err) {}
  }
}

window.addEventListener("DOMContentLoaded", syncMyAvatar);
