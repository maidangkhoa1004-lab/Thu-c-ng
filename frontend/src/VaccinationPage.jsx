import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { getCurrentUser } from "./auth";
import { notifyDueVaccines } from "./notifications";

const API = "http://127.0.0.1:5000";

function getDaysLeft(dueDate) {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.round((due - today) / (1000 * 60 * 60 * 24));
}

const emptyVaccine = {
  vaccine_name: "",
  due_date: new Date().toISOString().slice(0, 10),
  note: "",
};

function VaccinationPage() {
  const location = useLocation();
  const user = getCurrentUser();
  const [pet, setPet] = useState(null);
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVaccine, setNewVaccine] = useState(emptyVaccine);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    try {
      const petsRes = await fetch(`${API}/api/pets?user_id=${user.id}`);
      const allPets = await petsRes.json();

      let petId = location.state?.petId
        ? Number(location.state.petId)
        : Number(localStorage.getItem("currentPetId"));

      let currentPet = allPets.find((p) => p.id === petId);
      if (!currentPet && allPets.length > 0) {
        currentPet = allPets[0];
        localStorage.setItem("currentPetId", currentPet.id);
      }

      setPet(currentPet || null);

      if (currentPet) {
        const vacRes = await fetch(`${API}/api/vaccinations?pet_id=${currentPet.id}`);
        const petVaccines = await vacRes.json();
        setVaccines(Array.isArray(petVaccines) ? petVaccines : []);
      } else {
        setVaccines([]);
      }
    } catch (err) {
      console.error("Lỗi tải dữ liệu vaccine:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, user.id]);

  const handleAddVaccine = async (e) => {
    e.preventDefault();
    if (!pet || !newVaccine.vaccine_name || !newVaccine.due_date) return;

    setSaving(true);
    try {
      const res = await fetch(`${API}/api/vaccinations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pet_id: pet.id,
          vaccine_name: newVaccine.vaccine_name,
          due_date: newVaccine.due_date,
          administered_date: null,
          status: "Upcoming",
          note: newVaccine.note,
        }),
      });

      if (res.ok) {
        setNewVaccine(emptyVaccine);
        setShowAddForm(false);
        await loadData();
      } else {
        alert("Thêm lịch tiêm thất bại");
      }
    } catch (err) {
      console.error("Lỗi thêm lịch tiêm:", err);
      alert("Thêm lịch tiêm thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkDone = async (item) => {
    setUpdatingId(item.id);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const res = await fetch(`${API}/api/vaccinations/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vaccine_name: item.vaccine_name,
          due_date: item.due_date,
          administered_date: today,
          status: "Completed",
          note: item.note,
        }),
      });

      if (res.ok) {
        await loadData();
      } else {
        alert("Cập nhật thất bại");
      }
    } catch (err) {
      console.error("Lỗi cập nhật lịch tiêm:", err);
      alert("Cập nhật thất bại");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Xóa lịch tiêm "${item.vaccine_name}"?`)) return;

    setUpdatingId(item.id);
    try {
      const res = await fetch(`${API}/api/vaccinations/${item.id}`, { method: "DELETE" });
      if (res.ok) {
        await loadData();
      } else {
        alert("Xóa thất bại");
      }
    } catch (err) {
      console.error("Lỗi xóa lịch tiêm:", err);
      alert("Xóa thất bại");
    } finally {
      setUpdatingId(null);
    }
  };

  const withDays = vaccines
    .map((v) => ({ ...v, daysLeft: getDaysLeft(v.due_date) }))
    .sort((a, b) => (a.daysLeft ?? 9999) - (b.daysLeft ?? 9999));

  useEffect(() => {
    if (pet && withDays.length > 0) {
      notifyDueVaccines(withDays, () => pet);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vaccines, pet]);

  const reminderVaccines = withDays.filter(
    (v) => v.status !== "Completed" && v.daysLeft !== null && v.daysLeft <= 7
  );

  const overdueCount = reminderVaccines.filter((v) => v.daysLeft < 0).length;
  const dueTodayCount = reminderVaccines.filter((v) => v.daysLeft === 0).length;
  const dueSoonCount = reminderVaccines.filter((v) => v.daysLeft > 0).length;

  const reminderParts = [];
  if (overdueCount > 0) reminderParts.push(`${overdueCount} mũi đã quá hạn`);
  if (dueTodayCount > 0) reminderParts.push(`${dueTodayCount} mũi đến hạn hôm nay`);
  if (dueSoonCount > 0) reminderParts.push(`${dueSoonCount} mũi sắp đến hạn trong 7 ngày tới`);
  const reminderMessage = reminderParts.join(", ");
  const upToDateCount = withDays.filter(
    (v) => v.status === "Completed" || (v.daysLeft ?? -1) >= 0
  ).length;
  const progressPercent = vaccines.length
    ? Math.round((upToDateCount / vaccines.length) * 100)
    : 0;
  const nextVaccine = withDays.find(
    (v) => v.status !== "Completed" && v.daysLeft !== null && v.daysLeft >= 0
  );

  const filteredVaccines = withDays.filter((v) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return [v.vaccine_name, v.note].filter(Boolean).some((f) => f.toLowerCase().includes(term));
  });

  if (loading) return <p style={{ padding: 40 }}>Đang tải dữ liệu tiêm chủng...</p>;

  if (!pet)
    return (
      <p style={{ padding: 40 }}>
        Chưa có thú cưng nào. Hãy thêm thú cưng ở mục Pets trước.
      </p>
    );

  return (
    <div className="vaccine-page">
      <Sidebar active="vaccines" />

      <main className="vaccine-main">
        <header className="vaccine-topbar">
          <input
            placeholder="🔍 Tìm lịch tiêm theo tên/ghi chú..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div>
            <b>Bảng điều khiển</b>
            <span> 🔔 ☺️</span>
          </div>
        </header>

        {reminderVaccines.length > 0 && (
          <div className="reminder-alert">
            🔔 {pet.name} có {reminderMessage}!
          </div>
        )}

        <section className="journey-card">
          <img
            src={pet.photo || "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=300"}
            alt={pet.name}
          />

          <div className="journey-info">
            <div className="journey-title">
              <h1>Hành trình sức khỏe của {pet.name}</h1>
              <span>{upToDateCount}/{vaccines.length} mũi đủ hạn</span>
            </div>

            <p>
              {pet.name} hiện được bảo vệ {progressPercent}% theo lịch tiêm chủng đã ghi nhận.
            </p>

            <small>Tiến độ hằng năm</small>

            <div className="vaccine-progress">
              <div style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          <div className="next-visit">
            <div>📅</div>
            <h2>{nextVaccine ? `${nextVaccine.daysLeft} ngày` : "Chưa có lịch"}</h2>
            <p>Lịch khám tiếp theo</p>
          </div>
        </section>

        <section className="status-title">
          <h2>Sắp tới &amp; Trạng thái</h2>
          <div>
            <button className="log-btn" type="button" onClick={() => setShowAddForm((v) => !v)}>
              {showAddForm ? "✕ Đóng" : "＋ Thêm lịch tiêm"}
            </button>
          </div>
        </section>

        {showAddForm && (
          <form className="form-card" onSubmit={handleAddVaccine} style={{ maxWidth: 760, margin: "0 auto 30px" }}>
            <div className="form-grid">
              <div className="form-group">
                <label>Tên vaccine</label>
                <input
                  type="text"
                  placeholder="vd. Mũi nhắc phòng dại"
                  value={newVaccine.vaccine_name}
                  onChange={(e) => setNewVaccine((v) => ({ ...v, vaccine_name: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Ngày đến hạn</label>
                <input
                  type="date"
                  value={newVaccine.due_date}
                  onChange={(e) => setNewVaccine((v) => ({ ...v, due_date: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Ghi chú</label>
                <input
                  type="text"
                  placeholder="vd. Cần tiêm nhắc hằng năm"
                  value={newVaccine.note}
                  onChange={(e) => setNewVaccine((v) => ({ ...v, note: e.target.value }))}
                />
              </div>
            </div>

            <div className="btn-group">
              <button className="save-btn" type="submit" disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu lịch tiêm →"}
              </button>
            </div>
          </form>
        )}

        {searchTerm.trim() && filteredVaccines.length === 0 && (
          <p style={{ textAlign: "center", color: "#888" }}>
            Không tìm thấy lịch tiêm nào khớp với "{searchTerm}".
          </p>
        )}

        <section className="vaccine-grid">
          {filteredVaccines.map((item) => {
            const isDone = item.status === "Completed";
            const isOverdue = !isDone && item.daysLeft !== null && item.daysLeft < 0;
            const isSoon = !isDone && item.daysLeft !== null && item.daysLeft >= 0 && item.daysLeft <= 7;

            const iconClass = isDone ? "icon green" : isOverdue ? "icon red" : isSoon ? "icon yellow" : "icon green";
            const badgeClass = isDone
              ? "badge green-badge"
              : isOverdue
              ? "badge red-badge"
              : isSoon
              ? "badge yellow-badge"
              : "badge green-badge";
            const badgeText = isDone ? "Hoàn tất" : isOverdue ? "Quá hạn" : isSoon ? "Sắp tới" : "Đã cập nhật";

            return (
              <div className="vaccine-status-card" key={item.id}>
                <div className="status-row">
                  <span className={iconClass}>{isDone ? "✓" : isOverdue ? "◇" : "◷"}</span>
                  <b className={badgeClass}>{badgeText}</b>
                </div>

                <h3>{item.vaccine_name}</h3>
                <p>{item.note}</p>

                <div className="due-row">
                  <small>Ngày đến hạn</small>
                  <b>{item.due_date}</b>
                </div>

                <p>
                  {isDone
                    ? `Đã tiêm ${item.administered_date || ""}`
                    : item.daysLeft === null
                    ? "Chưa có ngày đến hạn"
                    : item.daysLeft < 0
                    ? `Quá hạn ${Math.abs(item.daysLeft)} ngày`
                    : `Còn ${item.daysLeft} ngày`}
                </p>

                {!isDone && (
                  <button
                    className={item.daysLeft !== null && item.daysLeft <= 7 ? "danger-btn" : "light-btn"}
                    type="button"
                    disabled={updatingId === item.id}
                    onClick={() => handleMarkDone(item)}
                  >
                    {updatingId === item.id ? "Đang lưu..." : "✓ Đánh dấu đã tiêm"}
                  </button>
                )}

                <button
                  className="light-btn"
                  type="button"
                  disabled={updatingId === item.id}
                  onClick={() => handleDelete(item)}
                >
                  🗑 Xóa
                </button>
              </div>
            );
          })}
        </section>

        <section className="nearby-card">
          <div>
            <h2>Tìm phòng khám gần đây</h2>
            <p>
              Quá hạn tiêm phòng? Chúng tôi hợp tác với 12 phòng khám gần bạn
              hỗ trợ đặt lịch khám trong ngày cho người dùng Paws &amp; Vitality.
            </p>
            <div className="nearby-buttons">
              <button>Tìm phòng khám ngay</button>
              <button>Xem bản đồ</button>
            </div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=500"
            alt="Bác sĩ thú y"
          />
        </section>

        <footer className="dash-footer">
          <h3>🐾 Paws &amp; Vitality</h3>
          <p>© 2026 Paws &amp; Vitality Pet Management. Nuôi dưỡng sự gắn kết.</p>
          <div>
            <a>Trung tâm hỗ trợ</a>
            <a>Chính sách bảo mật</a>
            <a>Điều khoản dịch vụ</a>
            <a>Chăm sóc khẩn cấp</a>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default VaccinationPage;
