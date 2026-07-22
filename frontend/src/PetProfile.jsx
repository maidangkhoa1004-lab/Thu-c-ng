import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { getCurrentUser } from "./auth";

const API = "http://127.0.0.1:5000";

function calculateAge(birthday) {
  if (!birthday) return "Chưa rõ";
  const birth = new Date(birthday);
  if (isNaN(birth)) return "Chưa rõ";
  const diffMs = Date.now() - birth.getTime();
  const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  return years < 1 ? `${Math.round(years * 12)} tháng` : `${Math.floor(years)} năm`;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("vi-VN");
}

const PET_TYPE_OPTIONS = [
  { value: "Dog", label: "🐶 Chó" },
  { value: "Cat", label: "🐱 Mèo" },
  { value: "Bird", label: "🐦 Chim" },
  { value: "Rabbit", label: "🐰 Thỏ" },
];

function petTypeLabel(type) {
  if (type === "Dog") return "Chó";
  if (type === "Cat") return "Mèo";
  if (type === "Bird") return "Chim";
  if (type === "Rabbit") return "Thỏ";
  return type;
}

function PetProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [pet, setPet] = useState(null);
  const [nextVaccine, setNextVaccine] = useState(null);
  const [vaccines, setVaccines] = useState([]);
  const [healthLogs, setHealthLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    try {
      // Nếu vừa lưu pet mới từ AddPet, ưu tiên dùng state để hiện ngay,
      // đồng thời lưu petId để các lần sau (F5, vào thẳng URL) vẫn còn.
      if (location.state?.petId) {
        localStorage.setItem("currentPetId", location.state.petId);
      }

      const petId = Number(localStorage.getItem("currentPetId"));

      const petsRes = await fetch(`${API}/api/pets?user_id=${user.id}`);
      const allPets = await petsRes.json();
      const currentPet =
        allPets.find((p) => p.id === petId) || allPets[0] || null;

      setPet(currentPet);

      if (currentPet) {
        const [vacRes, logsRes] = await Promise.all([
          fetch(`${API}/api/vaccinations?pet_id=${currentPet.id}`),
          fetch(`${API}/api/health-logs?pet_id=${currentPet.id}`),
        ]);

        const petVaccines = await vacRes.json();
        setVaccines(Array.isArray(petVaccines) ? petVaccines : []);

        const upcoming = petVaccines
          .filter((v) => v.due_date && v.status !== "Completed")
          .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
          .find((v) => new Date(v.due_date) >= new Date());
        setNextVaccine(upcoming || null);

        const petLogs = await logsRes.json();
        setHealthLogs(Array.isArray(petLogs) ? petLogs : []);
      } else {
        setVaccines([]);
        setHealthLogs([]);
      }
    } catch (err) {
      console.error("Lỗi tải hồ sơ thú cưng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, user.id]);

  const latestLog = healthLogs[0] || null;

  const upToDateVaccines = vaccines.filter((v) => {
    if (v.status === "Completed") return true;
    if (!v.due_date) return false;
    return new Date(v.due_date) >= new Date();
  }).length;
  const healthPercent = vaccines.length
    ? Math.round((upToDateVaccines / vaccines.length) * 100)
    : 100;

  const startEditing = () => {
    setEditForm({
      name: pet.name || "",
      type: pet.type || "Dog",
      breed: pet.breed || "",
      birthday: pet.birthday || "",
      weight: pet.weight ?? "",
    });
    setEditing(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/pets/${pet.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          type: editForm.type,
          breed: editForm.breed,
          birthday: editForm.birthday,
          weight: editForm.weight ? Number(editForm.weight) : null,
          photo: pet.photo,
        }),
      });

      if (res.ok) {
        setEditing(false);
        await loadData();
      } else {
        alert("Cập nhật hồ sơ thất bại");
      }
    } catch (err) {
      console.error("Lỗi cập nhật hồ sơ:", err);
      alert("Cập nhật hồ sơ thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePet = async () => {
    if (!window.confirm(`Xóa vĩnh viễn hồ sơ của ${pet.name}? Toàn bộ lịch tiêm và nhật ký sức khỏe liên quan cũng sẽ bị xóa.`)) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`${API}/api/pets/${pet.id}`, { method: "DELETE" });

      if (res.ok) {
        localStorage.removeItem("currentPetId");
        navigate("/home");
      } else {
        alert("Xóa thất bại");
      }
    } catch (err) {
      console.error("Lỗi xóa thú cưng:", err);
      alert("Xóa thất bại");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <p style={{ padding: 40 }}>Đang tải hồ sơ...</p>;

  if (!pet)
    return (
      <p style={{ padding: 40 }}>
        Chưa có thú cưng nào. Hãy thêm thú cưng ở mục Pets trước.
      </p>
    );

  return (
    <div className="pet-page">
      <Sidebar active="pets" />

      <main className="pet-main">
        <div className="pet-header">
          <h3>← Bảng điều khiển</h3>
          <div>🔔 ☺️</div>
        </div>

        <div className="pet-layout">
          <section className="pet-left">
            <div className="pet-card">
              <img
                src={
                  pet.photo ||
                  "https://images.unsplash.com/photo-1612195583950-b8fd34c87093?w=500"
                }
                alt={pet.name}
              />

              <div className="pet-name-row">
                <div>
                  <h1>{pet.name}</h1>
                  <span>{petTypeLabel(pet.type)}</span>
                </div>
                <button className="edit-icon" onClick={() => (editing ? setEditing(false) : startEditing())}>
                  {editing ? "✕" : "✎"}
                </button>
              </div>
            </div>

            {editing ? (
              <form className="info-card" onSubmit={handleSaveEdit}>
                <h3>Chỉnh sửa hồ sơ</h3>

                <div className="form-group">
                  <label>Tên</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Loài</label>
                  <div className="pet-type">
                    {PET_TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={editForm.type === opt.value ? "selected" : ""}
                        onClick={() => setEditForm((f) => ({ ...f, type: opt.value }))}
                      >
                        {opt.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      className={!PET_TYPE_OPTIONS.some((o) => o.value === editForm.type) ? "selected" : ""}
                      onClick={() =>
                        setEditForm((f) => ({
                          ...f,
                          type: PET_TYPE_OPTIONS.some((o) => o.value === f.type) ? "" : f.type,
                        }))
                      }
                    >
                      Khác
                    </button>
                  </div>
                  {!PET_TYPE_OPTIONS.some((o) => o.value === editForm.type) && (
                    <input
                      type="text"
                      placeholder="Nhập loài khác..."
                      value={editForm.type}
                      onChange={(e) => setEditForm((f) => ({ ...f, type: e.target.value }))}
                      style={{ marginTop: 8 }}
                    />
                  )}
                </div>

                <div className="form-group">
                  <label>Giống</label>
                  <input
                    type="text"
                    value={editForm.breed}
                    onChange={(e) => setEditForm((f) => ({ ...f, breed: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Ngày sinh</label>
                  <input
                    type="date"
                    value={editForm.birthday}
                    onChange={(e) => setEditForm((f) => ({ ...f, birthday: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Cân nặng (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.weight}
                    onChange={(e) => setEditForm((f) => ({ ...f, weight: e.target.value }))}
                  />
                </div>

                <div className="btn-group">
                  <button className="save-btn" type="submit" disabled={saving}>
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>

                <button
                  type="button"
                  className="danger-btn"
                  style={{ width: "100%", marginTop: 12 }}
                  disabled={deleting}
                  onClick={handleDeletePet}
                >
                  {deleting ? "Đang xóa..." : "🗑 Xóa thú cưng"}
                </button>
              </form>
            ) : (
              <div className="info-card">
                <h3>Chỉ số quan trọng</h3>

                <div className="stat-row">
                  <span>🏷️ Giống</span>
                  <b>{pet.breed || "Chưa cập nhật"}</b>
                </div>

                <div className="stat-row">
                  <span>🎂 Tuổi</span>
                  <b>{calculateAge(pet.birthday)}</b>
                </div>

                <div className="stat-row">
                  <span>⚖️ Cân nặng</span>
                  <b>{pet.weight ? `${pet.weight} kg` : "Chưa cập nhật"}</b>
                </div>
              </div>
            )}

            <div className="health-card">
              <div>
                <h3>Sức khỏe tổng quan</h3>
                <b>{vaccines.length ? `${healthPercent}%` : "—"}</b>
              </div>
              <div className="health-bar">
                <div style={{ width: `${vaccines.length ? healthPercent : 0}%` }}></div>
              </div>
              <p>
                {vaccines.length
                  ? `${upToDateVaccines}/${vaccines.length} mũi tiêm đủ hạn. `
                  : "Chưa có dữ liệu tiêm chủng. "}
                {nextVaccine
                  ? `Lịch tiêm kế tiếp: ${nextVaccine.vaccine_name} vào ${nextVaccine.due_date}`
                  : "Chưa có lịch tiêm sắp tới."}
              </p>
            </div>
          </section>

          <section className="pet-right">
            <div className="active-care-title">
              <h2>Chăm sóc hiện tại</h2>
              <Link to="/health-logs">＋ Ghi sự kiện</Link>
            </div>

            <div className="care-grid">
              <div className="care-card">
                <span>💉</span>
                <div>
                  <p>Sắp tới</p>
                  <h3>{nextVaccine ? nextVaccine.vaccine_name : "Không có"}</h3>
                  <small>{nextVaccine ? `Đến hạn ${nextVaccine.due_date}` : "—"}</small>
                </div>
              </div>

              <div className="care-card">
                <span>🍽️</span>
                <div>
                  <p>Việc hằng ngày</p>
                  <h3>{latestLog?.meal || (latestLog?.activity_steps ? `${latestLog.activity_steps} bước` : "Chưa có nhật ký")}</h3>
                  <small>
                    {latestLog ? `Ghi nhận ${formatDate(latestLog.log_date)}` : "Thêm ở Nhật ký sức khỏe"}
                  </small>
                </div>
              </div>
            </div>

            <div className="history-card">
              <div className="history-title">
                <h2>Lịch sử y tế</h2>
                <Link to="/health-logs">Xem tất cả</Link>
              </div>

              {healthLogs.length === 0 && (
                <p style={{ color: "#999", fontSize: 13 }}>
                  Chưa có nhật ký sức khỏe. Hãy thêm ở mục Nhật ký sức khỏe.
                </p>
              )}

              {healthLogs.slice(0, 3).map((log) => (
                <div className="record" key={log.id}>
                  <div
                    className={`dot ${
                      log.mood === "Tốt" ? "green" : log.mood === "Bình thường" ? "yellow" : "orange"
                    }`}
                  ></div>
                  <div className="record-box">
                    <div className="record-head">
                      <h3>{log.mood || "Nhật ký"}</h3>
                      <span>{formatDate(log.log_date)}</span>
                    </div>
                    <p>
                      {log.weight ? `⚖️ ${log.weight} kg · ` : ""}
                      {log.meal ? `🍖 ${log.meal} · ` : ""}
                      {log.activity_steps ? `🏃 ${log.activity_steps} bước` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default PetProfile;