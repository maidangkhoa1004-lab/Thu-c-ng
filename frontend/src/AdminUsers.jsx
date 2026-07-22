import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { getCurrentUser } from "./auth";
import "./Admin.css";

const API = "http://127.0.0.1:5000";
const PAGE_SIZE = 8;

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("vi-VN");
}

function initials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function AdminUsers() {
  const me = getCurrentUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadUsers = async () => {
    try {
      const res = await fetch(`${API}/api/users?admin_id=${me.id}`);
      setUsers((await res.json()) || []);
    } catch (err) {
      console.error("Lỗi tải danh sách người dùng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me.id]);

  const totalAdmins = users.filter((u) => u.role === "admin").length;
  const totalRegular = users.length - totalAdmins;
  const totalPetsManaged = users.reduce((sum, u) => sum + (u.pet_count || 0), 0);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) =>
        (u.full_name && u.full_name.toLowerCase().includes(term)) ||
        (u.email && u.email.toLowerCase().includes(term))
    );
  }, [users, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const pageUsers = useMemo(
    () => filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredUsers, page]
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleToggleRole = async (u) => {
    const nextRole = u.role === "admin" ? "user" : "admin";
    if (u.id === me.id && nextRole === "user") {
      if (!window.confirm("Bạn sẽ tự bỏ quyền admin của chính mình. Tiếp tục?")) return;
    }

    setUpdatingId(u.id);
    try {
      const res = await fetch(`${API}/api/users/${u.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_id: me.id, role: nextRole }),
      });

      if (res.ok) {
        await loadUsers();
      } else {
        alert("Cập nhật vai trò thất bại");
      }
    } catch (err) {
      console.error("Lỗi cập nhật vai trò:", err);
      alert("Cập nhật vai trò thất bại");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError("");

    const target = users.find(
      (u) => u.email.toLowerCase() === inviteEmail.trim().toLowerCase()
    );

    if (!target) {
      setInviteError("Không tìm thấy người dùng với email này. Họ cần tạo tài khoản trước ở trang Đăng ký.");
      return;
    }

    if (target.role === "admin") {
      setInviteError("Người dùng này đã là admin rồi.");
      return;
    }

    setUpdatingId(target.id);
    try {
      const res = await fetch(`${API}/api/users/${target.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_id: me.id, role: "admin" }),
      });

      if (res.ok) {
        setInviteEmail("");
        setShowInvite(false);
        await loadUsers();
      } else {
        setInviteError("Cập nhật thất bại, thử lại sau.");
      }
    } catch (err) {
      console.error("Lỗi mời admin:", err);
      setInviteError("Không thể kết nối máy chủ.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <p style={{ padding: 40 }}>Đang tải danh sách người dùng...</p>;

  return (
    <div className="dashboard">
      <AdminSidebar active="users" />

      <main className="main-content">
        <header className="topbar">
          <input type="text" placeholder="🔍 Tìm theo tên, email..." value={searchTerm} onChange={handleSearchChange} />
          <div className="icons">🔔 ☺️</div>
        </header>

        <section className="hero">
          <div>
            <h1>Quản lý người dùng</h1>
            <p>Quản lý toàn bộ chủ nuôi &amp; quản trị viên đang sử dụng hệ thống.</p>
          </div>
          <button className="status-btn" onClick={() => setShowInvite((v) => !v)}>
            {showInvite ? "✕ Đóng" : "+ Mời Admin"}
          </button>
        </section>

        {showInvite && (
          <form
            className="form-card"
            onSubmit={handleInvite}
            style={{ maxWidth: 520, margin: "0 auto 30px" }}
          >
            <div className="form-group">
              <label>Email người dùng đã đăng ký</label>
              <input
                type="email"
                placeholder="hello@petowner.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </div>

            {inviteError && (
              <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 14 }}>{inviteError}</p>
            )}

            <div className="btn-group">
              <button className="save-btn" type="submit">
                Cấp quyền Admin →
              </button>
            </div>
          </form>
        )}

        <section className="cards">
          <div className="card">
            <span className="circle orange">👥</span>
            <p>Tổng người dùng</p>
            <h2>{users.length}</h2>
          </div>

          <div className="card">
            <span className="circle yellow">🛠️</span>
            <p>Quản trị viên</p>
            <h2>{totalAdmins}</h2>
          </div>

          <div className="card">
            <span className="circle orange">🙋</span>
            <p>Người dùng thường</p>
            <h2>{totalRegular}</h2>
          </div>

          <div className="card meal-card">
            <p>Tổng thú cưng quản lý</p>
            <h2>{totalPetsManaged}</h2>
            <span>Trên toàn hệ thống</span>
          </div>
        </section>

        <div className="adm-table-wrap" style={{ marginTop: 30 }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Email</th>
                <th>Thú cưng</th>
                <th>Ngày tham gia</th>
                <th>Vai trò</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "#888" }}>
                    Không tìm thấy người dùng nào khớp với "{searchTerm}".
                  </td>
                </tr>
              )}
              {pageUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="adm-user-cell">
                      <div className="adm-avatar">{initials(u.full_name)}</div>
                      <span>{u.full_name}{u.id === me.id ? " (bạn)" : ""}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.pet_count}</td>
                  <td>{formatDate(u.created_at)}</td>
                  <td>
                    <span className={`adm-role-badge ${u.role}`}>
                      {u.role === "admin" ? "Quản trị" : "Người dùng"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="adm-link-btn"
                      disabled={updatingId === u.id}
                      onClick={() => handleToggleRole(u)}
                    >
                      {updatingId === u.id
                        ? "Đang lưu..."
                        : u.role === "admin"
                        ? "Bỏ quyền Admin"
                        : "Cấp quyền Admin"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="adm-pagination">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹</button>
          <span>Trang {page}/{totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>›</button>
        </div>
      </main>
    </div>
  );
}

export default AdminUsers;
