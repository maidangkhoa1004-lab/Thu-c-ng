import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "./auth";

const ROLE_LABELS = {
  user: "Chủ nuôi",
  admin: "Quản trị viên",
};

function Sidebar({ active }) {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeSidebar = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        className="sidebar-toggle"
        onClick={() => setOpen(true)}
        aria-label="Mở menu"
      >
        ☰
      </button>

      {open && <div className="sidebar-backdrop" onClick={closeSidebar}></div>}

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div>
          <div className="sidebar-head">
            <h2>🐾 Paws &amp; Vitality</h2>
            <button
              type="button"
              className="sidebar-close"
              onClick={closeSidebar}
              aria-label="Đóng menu"
            >
              ✕
            </button>
          </div>
          <p>Ứng dụng chăm sóc thú cưng</p>

          <nav onClick={closeSidebar}>
            <Link to="/home" className={active === "home" ? "active" : ""}>🏠 Trang chủ</Link>
            <Link to="/pets" className={active === "pets" ? "active" : ""}>🐾 Thú cưng</Link>
            <Link to="/vaccines" className={active === "vaccines" ? "active" : ""}>💉 Tiêm chủng</Link>
            <Link to="/health-logs" className={active === "health-logs" ? "active" : ""}>📋 Nhật ký sức khỏe</Link>
            <Link to="/book-appointment" className={active === "book" ? "active" : ""}>📅 Đặt lịch</Link>
            {user?.role === "admin" && <Link to="/admin">🛠️ Trang Admin</Link>}
            <a onClick={handleLogout} style={{ cursor: "pointer" }}>🚪 Đăng xuất</a>
          </nav>
        </div>

        <div className="user-box">
          <span>🐶</span>
          <div>
            <b>{user?.full_name || "Khách"}</b>
            <p>{ROLE_LABELS[user?.role] || "Chủ nuôi"}</p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
