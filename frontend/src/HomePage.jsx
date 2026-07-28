import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { getCurrentUser } from "./auth";
import { getNotificationPermission, requestNotificationPermission, notifyDueVaccines, sendTestNotification } from "./notifications";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

function getDaysLeft(dueDate) {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.round((due - today) / (1000 * 60 * 60 * 24));
}

function petIcon(type) {
  if (type === "Dog") return "🐶";
  if (type === "Cat") return "🐱";
  return "🐾";
}

function daysLeftLabel(daysLeft) {
  if (daysLeft === null) return "Chưa có ngày";
  if (daysLeft < 0) return `Quá hạn ${Math.abs(daysLeft)} ngày`;
  if (daysLeft === 0) return "Hôm nay";
  return `Còn ${daysLeft} ngày`;
}

function HomePage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [pets, setPets] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [healthLogs, setHealthLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifPermission, setNotifPermission] = useState(getNotificationPermission());
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [petsRes, vacRes, logsRes] = await Promise.all([
          fetch(`${API}/api/pets?user_id=${user.id}`),
          fetch(`${API}/api/vaccinations?user_id=${user.id}`),
          fetch(`${API}/api/health-logs?user_id=${user.id}`),
        ]);
        const myPets = await petsRes.json();

        setPets(myPets);
        setVaccines((await vacRes.json()) || []);
        const logs = await logsRes.json();
        setHealthLogs(Array.isArray(logs) ? logs : []);
      } catch (err) {
        console.error("Lỗi tải dữ liệu dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user.id]);

  const goToPet = (petId) => {
    localStorage.setItem("currentPetId", petId);
    navigate("/pet-profile", { state: { petId } });
  };

  const petById = (id) => pets.find((p) => p.id === id);

  const upcomingVaccines = vaccines
    .filter((v) => v.status !== "Completed")
    .map((v) => ({ ...v, daysLeft: getDaysLeft(v.due_date) }))
    .filter((v) => v.daysLeft !== null)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  useEffect(() => {
    if (upcomingVaccines.length > 0) {
      notifyDueVaccines(upcomingVaccines, petById);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vaccines, pets]);

  const handleEnableNotifications = async () => {
    const result = await requestNotificationPermission();
    setNotifPermission(result);
    if (result === "granted") {
      sendTestNotification();
    }
  };

  const handleTestNotification = () => {
    const ok = sendTestNotification();
    if (!ok) alert("Chưa cấp quyền thông báo hoặc trình duyệt không hỗ trợ.");
  };

  const reminderVaccines = upcomingVaccines.filter((v) => v.daysLeft <= 7);
  const allUpToDate = vaccines.length > 0 && reminderVaccines.length === 0;

  const weights = pets.map((p) => p.weight).filter((w) => w !== null && w !== undefined);
  const avgWeight = weights.length
    ? (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1)
    : null;

  const upToDateVaccineCount = vaccines.filter(
    (v) => v.status === "Completed" || (getDaysLeft(v.due_date) !== null && getDaysLeft(v.due_date) >= 0)
  ).length;
  const vaccineProgress = vaccines.length
    ? Math.round((upToDateVaccineCount / vaccines.length) * 100)
    : 0;

  const latestLog = healthLogs[0] || null;
  const latestLogPet = latestLog ? petById(latestLog.pet_id) : null;

  const filteredUpcomingVaccines = upcomingVaccines.filter((v) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    const vp = petById(v.pet_id);
    return [v.vaccine_name, vp?.name].filter(Boolean).some((f) => f.toLowerCase().includes(term));
  });

  if (loading) return <p style={{ padding: 40 }}>Đang tải bảng điều khiển...</p>;

  return (
    <div className="dashboard">
      <Sidebar active="home" />

      <main className="main-content">
        <header className="topbar">
          <input
            type="text"
            placeholder="🔍 Tìm lịch tiêm theo tên thú cưng/vaccine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="icons">🔔 ☺️</div>
        </header>

        <section className="hero">
          <div>
            <h1>Chào buổi sáng, {(user.full_name || "").split(" ")[0] || "bạn"}!</h1>
            <p>Đây là tình hình của những người bạn lông xù hôm nay.</p>
          </div>

          {vaccines.length === 0 ? (
            <button className="status-btn">🐾 Chưa có lịch tiêm nào</button>
          ) : allUpToDate ? (
            <button className="status-btn">✅ Tất cả thú cưng đều đã cập nhật</button>
          ) : (
            <button className="status-btn" style={{ background: "#ffd7b0" }}>
              🔔 {reminderVaccines.length} lịch tiêm cần chú ý
            </button>
          )}
        </section>

        {notifPermission === "default" && (
          <div className="reminder-alert" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
            <span>🔔 Bật thông báo trình duyệt để không bỏ lỡ lịch tiêm, kể cả khi không mở web.</span>
            <button className="log-btn" type="button" onClick={handleEnableNotifications}>
              Bật thông báo
            </button>
          </div>
        )}

        {notifPermission === "denied" && (
          <div className="reminder-alert" style={{ background: "#ffe0e0", color: "#a8402a" }}>
            🔕 Bạn đã từ chối thông báo trước đó nên trình duyệt sẽ không tự hỏi lại. Muốn bật lại:
            bấm vào biểu tượng 🔒/ⓘ cạnh địa chỉ web trên thanh trình duyệt → mục{" "}
            <b>Thông báo (Notifications)</b> → chọn <b>Cho phép (Allow)</b>, rồi tải lại trang.
          </div>
        )}

        {notifPermission === "granted" && (
          <div className="reminder-alert" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, background: "#d9ffd0", color: "#18a64a" }}>
            <span>✅ Đã bật thông báo trình duyệt.</span>
            <button className="light-btn" type="button" onClick={handleTestNotification}>
              🔔 Gửi thử thông báo
            </button>
          </div>
        )}

        <section className="cards">
          <div className="card">
            <span className="circle orange">⚖️</span>
            <p>Cân nặng trung bình</p>
            <h2>
              {avgWeight ?? "—"} <small>kg</small>
            </h2>
          </div>

          <div className="card">
            <span className="circle yellow">💉</span>
            <p>Tiến độ tiêm chủng</p>
            <h2>
              {vaccineProgress} <small>%</small>
            </h2>
            <div className="progress">
              <div style={{ width: `${vaccineProgress}%` }}></div>
            </div>
          </div>

          <div className="card meal-card">
            <p>Nhật ký gần nhất</p>
            <h2>{latestLog ? (latestLog.meal || latestLog.mood || "Đã ghi nhận") : "Chưa có"}</h2>
            <span>{latestLogPet ? `${petIcon(latestLogPet.type)} ${latestLogPet.name}` : "Thêm nhật ký sức khỏe"}</span>
          </div>
        </section>

        <section className="content-grid">
          <div>
            <h3>Thao tác nhanh</h3>

            <Link to="/book-appointment" className="action-card" style={{ textDecoration: "none", color: "inherit" }}>
              <span>⊕</span>
              <div>
                <h4>Thêm sự kiện</h4>
                <p>Đặt lịch khám hoặc dạo chơi</p>
              </div>
            </Link>

            <Link to="/health-logs" className="action-card green-border" style={{ textDecoration: "none", color: "inherit" }}>
              <span>▣</span>
              <div>
                <h4>Ghi nhận sức khỏe</h4>
                <p>Cập nhật cân nặng hoặc triệu chứng</p>
              </div>
            </Link>

            <Link to="/pets" className="action-card" style={{ textDecoration: "none", color: "inherit" }}>
              <span>📸</span>
              <div>
                <h4>Thêm / Cập nhật thú cưng</h4>
                <p>Lưu lại khoảnh khắc mới</p>
              </div>
            </Link>
          </div>

          <div>
            <div className="section-title">
              <h3>Lịch tiêm sắp tới</h3>
              <Link to="/vaccines">Xem tất cả</Link>
            </div>

            {upcomingVaccines.length === 0 && (
              <div className="add-pet">Chưa có lịch tiêm nào được ghi nhận.</div>
            )}

            {upcomingVaccines.length > 0 && filteredUpcomingVaccines.length === 0 && (
              <div className="add-pet">Không tìm thấy lịch tiêm nào khớp với "{searchTerm}".</div>
            )}

            {filteredUpcomingVaccines.slice(0, 3).map((v) => {
              const vp = petById(v.pet_id);
              return (
                <div
                  className="vaccine-card"
                  key={v.id}
                  onClick={() => vp && goToPet(vp.id)}
                  style={{ cursor: vp ? "pointer" : "default" }}
                >
                  <div className="pet-img">{vp ? petIcon(vp.type) : "🐾"}</div>
                  <div>
                    <h4>{vp ? vp.name : "Thú cưng"}</h4>
                    <p>{v.vaccine_name}</p>
                  </div>
                  <span>{daysLeftLabel(v.daysLeft)}</span>
                </div>
              );
            })}

            <Link to="/pets" className="add-pet" style={{ display: "block", textDecoration: "none" }}>
              ＋ Thêm thú cưng khác để theo dõi...
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomePage;
