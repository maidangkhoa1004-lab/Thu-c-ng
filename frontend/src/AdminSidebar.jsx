import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "./auth";

function AdminSidebar({ active }) {
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
          <p>Bảng điều khiển Admin</p>

          <nav onClick={closeSidebar}>
            <Link to="/admin" className={active === "dashboard" ? "active" : ""}>🏠 Tổng quan</Link>
            <Link to="/admin/appointments" className={active === "appointments" ? "active" : ""}>📅 Lịch hẹn</Link>
            <Link to="/admin/users" className={active === "users" ? "active" : ""}>👥 Người dùng</Link>
            <Link to="/admin/records" className={active === "records" ? "active" : ""}>📋 Hồ sơ sức khỏe</Link>
            <Link to="/home">↩ Trang người dùng</Link>
            <a onClick={handleLogout} style={{ cursor: "pointer" }}>🚪 Đăng xuất</a>
          </nav>
        </div>

        <div className="user-box">
          <span>🛠️</span>
          <div>
            <b>{user?.full_name || "Admin"}</b>
            <p>Quản trị viên</p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
