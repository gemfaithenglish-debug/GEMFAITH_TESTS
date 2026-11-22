 // =========================================================================
// HỆ THỐNG NHẬN LỜI MỜI ĐẤU GEMSPHERE TRỰC TIẾP TRÊN MỌI TRANG
// =========================================================================
const INVITE_DB_URL = "https://" + "tich-luy-gempoint-default-rtdb" + ".asia-southeast1." + "firebasedatabase.app";
const currentLoggedUser = localStorage.getItem("currentUsername");

// 1. Chèn CSS & Khung thông báo lời mời góc trên màn hình
(function initInvitePopupUI() {
  const style = document.createElement("style");
  style.innerHTML = `
    .gs-invite-toast {
      position: fixed;
      top: 18px;
      left: 50%;
      transform: translateX(-50%) translateY(-150%);
      width: 92%;
      max-width: 420px;
      background: linear-gradient(135deg, #2e1065 0%, #5b21b6 100%);
      color: #ffffff;
      border: 2px solid #fde047;
      border-radius: 18px;
      padding: 14px 16px;
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
      z-index: 99999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .gs-invite-toast.show {
      transform: translateX(-50%) translateY(0);
    }
    .gs-invite-title {
      font-size: 0.92rem;
      font-weight: 800;
      color: #fde047;
      margin-bottom: 4px;
    }
    .gs-invite-desc {
      font-size: 0.85rem;
      color: #f3e8ff;
      margin-bottom: 12px;
      line-height: 1.4;
    }
    .gs-invite-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
    .gs-btn-decline {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 6px 14px;
      border-radius: 10px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
    }
    .gs-btn-accept {
      background: linear-gradient(135deg, #fde047 0%, #facc15 100%);
      color: #0f172a;
      border: none;
      padding: 6px 16px;
      border-radius: 10px;
      font-size: 0.82rem;
      font-weight: 800;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  const toast = document.createElement("div");
  toast.id = "gsInviteToast";
  toast.className = "gs-invite-toast";
  toast.innerHTML = `
    <div class="gs-invite-title">LỜI MỜI VÀO ĐẤU TRƯỜNG GEMSPHERE!</div>
    <div class="gs-invite-desc" id="gsInviteText">...</div>
    <div class="gs-invite-actions">
      <button class="gs-btn-decline" onclick="declineInvite()">Từ chối</button>
      <button class="gs-btn-accept" id="gsAcceptBtn">Vào đấu trường ngay →</button>
    </div>
  `;
  document.body.appendChild(toast);
})();

let activeInviteRoom = null;

// 2. Quét hộp thư lời mời trên Firebase mỗi 2.5 giây
async function checkIncomingInvites() {
  if (!currentLoggedUser) return;
  // Không hiện thông báo nếu đang ở sẵn trong trang đấu trường gemsphere.html
  if (window.location.pathname.includes("gemsphere.html")) return;

  try {
    const res = await fetch(`${INVITE_DB_URL}/gemsphere_invites/${currentLoggedUser}.json?t=${Date.now()}`);
    const invite = await res.json();

    if (invite && invite.roomId && (Date.now() - invite.timestamp < 120000)) {
      // Lời mời còn hiệu lực (trong vòng 2 phút)
      activeInviteRoom = invite.roomId;
      document.getElementById("gsInviteText").innerHTML = `<b>${invite.fromName}</b> đang mời bạn vào Đấu trường GemSphere!`;
      document.getElementById("gsInviteToast").classList.add("show");
      document.getElementById("gsAcceptBtn").onclick = function() {
        acceptInvite(invite.roomId);
      };
    } else {
      document.getElementById("gsInviteToast").classList.remove("show");
    }
  } catch (e) {}
}

// Chấp nhận lời mời -> Xóa thông báo và bay thẳng vào phòng đấu
async function acceptInvite(roomId) {
  await fetch(`${INVITE_DB_URL}/gemsphere_invites/${currentLoggedUser}.json`, { method: "DELETE" });
  window.location.href = `gemsphere.html?join=${roomId}`;
}

// Từ chối lời mời -> Xóa thông báo
async function declineInvite() {
  document.getElementById("gsInviteToast").classList.remove("show");
  if (currentLoggedUser) {
    await fetch(`${INVITE_DB_URL}/gemsphere_invites/${currentLoggedUser}.json`, { method: "DELETE" });
  }
}

setInterval(checkIncomingInvites, 2500);
