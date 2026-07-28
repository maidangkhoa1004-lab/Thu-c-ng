import { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { getCurrentUser } from "./auth";
import "./Admin.css";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("vi-VN");
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

function AdminDashboard() {
  const user = getCurrentUser();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, logsRes, vacRes, apptRes] = await Promise.all([
          fetch(`${API}/api/admin/stats?admin_id=${user.id}`),
          fetch(`${API}/api/health-logs`),
          fetch(`${API}/api/vaccinations`),
          fetch(`${API}/api/appointments?admin_id=${user.id}`),
        ]);

        setStats(await statsRes.json());

        const logs = (await logsRes.json()) || [];
        const vaccines = (await vacRes.json()) || [];
        const appointments = (await apptRes.json()) || [];

        const logActivity = logs.slice(0, 8).map((l) => ({
          id: `log-${l.id}`,
          date: l.log_date,
          dot: l.mood === "Tốt" ? "green" : l.mood === "Bình thường" ? "yellow" : "orange",
          text: `Nhật ký sức khỏe được ghi nhận${l.meal ? `: ${l.meal}` : ""}`,
        }));

        const vacActivity = vaccines
          .filter((v) => v.status === "Completed" && v.administered_date)
          .slice(0, 8)
          .map((v) => ({
            id: `vac-${v.id}`,
            date: v.administered_date,
            dot: "green",
            text: `Đã tiêm ${v.vaccine_name}`,
          }));

        const merged = [...logActivity, ...vacActivity]
          .filter((a) => a.date)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 6);
        setActivity(merged);

        setTodaySchedule(appointments.filter((a) => isToday(a.appointment_date)));
      } catch (err) {
        console.error("Lỗi tải dashboard admin:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const term = searchTerm.trim().toLowerCase();
  const filteredActivity = term
    ? activity.filter((a) => a.text.toLowerCase().includes(term))
    : activity;
  const filteredSchedule = term
    ? todaySchedule.filter((a) =>
        [a.pet_name, a.title, a.owner_name].filter(Boolean).some((f) => f.toLowerCase().includes(term))
      )
    : todaySchedule;

  if (loading) return <p style={{ padding: 40 }}>Đang tải bảng điều khiển admin...</p>;

  return (
    <div className="dashboard">
      <AdminSidebar active="dashboard" />

      <main className="main-content">
        <header className="topbar">
          <input
            type="text"
            placeholder="🔍 Tìm hoạt động, lịch hẹn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="icons">🔔 ☺️</div>
        </header>

        <section className="hero">
          <div>
            <h1>Chào buổi sáng, {(user.full_name || "").split(" ")[0] || "Admin"}! 👋</h1>
            <p>Đây là những gì đang diễn ra tại Paws &amp; Vitality hôm nay.</p>
          </div>
        </section>

        <section className="cards">
          <div className="card">
            <span className="circle orange">👥</span>
            <p>Tổng người dùng</p>
            <h2>{stats?.total_users ?? "—"}</h2>
          </div>

          <div className="card">
            <span className="circle yellow">🐾</span>
            <p>Thú cưng đang hoạt động</p>
            <h2>{stats?.total_pets ?? "—"}</h2>
          </div>

          <div className="card">
            <span className="circle orange">📅</span>
            <p>Lịch hẹn hôm nay</p>
            <h2>{stats?.today_appointments ?? "—"}</h2>
          </div>

          <div className="card meal-card">
            <p>Hồ sơ chờ duyệt</p>
            <h2>{stats?.pending_records ?? "—"}</h2>
            <span>Cần admin duyệt</span>
          </div>
        </section>

        <section className="content-grid">
          <div>
            <h3>Hoạt động gần đây</h3>

            {activity.length === 0 && (
              <div className="add-pet">Chưa có hoạt động nào được ghi nhận.</div>
            )}

            {activity.length > 0 && filteredActivity.length === 0 && (
              <div className="add-pet">Không tìm thấy hoạt động nào khớp với "{searchTerm}".</div>
            )}

            {filteredActivity.map((a) => (
              <div className="record" key={a.id}>
                <div className={`dot ${a.dot}`}></div>
                <div className="record-box">
                  <div className="record-head">
                    <h3 style={{ fontSize: 14 }}>{a.text}</h3>
                    <span>{formatDate(a.date)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="section-title">
              <h3>Lịch hôm nay</h3>
              <span>{todaySchedule.length} lịch hẹn</span>
            </div>

            {todaySchedule.length === 0 && (
              <div className="add-pet">Hôm nay chưa có lịch hẹn nào.</div>
            )}

            {todaySchedule.length > 0 && filteredSchedule.length === 0 && (
              <div className="add-pet">Không tìm thấy lịch hẹn nào khớp với "{searchTerm}".</div>
            )}

            {filteredSchedule.map((a) => (
              <div className="vaccine-card" key={a.id}>
                <div className="pet-img">🐾</div>
                <div>
                  <h4>{a.pet_name || "Thú cưng"}</h4>
                  <p>{a.title} · {a.owner_name || "—"}</p>
                </div>
                <span>{formatTime(a.appointment_date)}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
