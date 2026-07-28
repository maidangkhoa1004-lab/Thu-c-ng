import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { getCurrentUser } from "./auth";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

const MOOD_OPTIONS = [
  { value: "Tốt", dot: "green" },
  { value: "Bình thường", dot: "yellow" },
  { value: "Mệt / Kém", dot: "orange" },
];

function moodDot(mood) {
  const found = MOOD_OPTIONS.find((m) => m.value === mood);
  return found ? found.dot : "yellow";
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("vi-VN");
}

function WeightTrendChart({ logs }) {
  const points = logs
    .filter((l) => l.weight != null)
    .slice()
    .sort((a, b) => new Date(a.log_date) - new Date(b.log_date));

  if (points.length < 2) return null;

  const weights = points.map((p) => p.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min || 1;
  const width = 300;
  const height = 70;
  const stepX = width / (points.length - 1);

  const coords = points.map((p, i) => {
    const x = i * stepX;
    const y = height - ((p.weight - min) / range) * height;
    return `${x},${y}`;
  });

  return (
    <div className="form-card" style={{ marginBottom: 20 }}>
      <h3 style={{ marginTop: 0 }}>Xu hướng cân nặng</h3>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="80" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke="#24b34b"
          strokeWidth="2"
          points={coords.join(" ")}
        />
        {points.map((p, i) => (
          <circle key={p.id} cx={i * stepX} cy={height - ((p.weight - min) / range) * height} r="3" fill="#24b34b" />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#888" }}>
        <span>{formatDate(points[0].log_date)} · {points[0].weight} kg</span>
        <span>{formatDate(points[points.length - 1].log_date)} · {points[points.length - 1].weight} kg</span>
      </div>
    </div>
  );
}

const emptyForm = {
  log_date: new Date().toISOString().slice(0, 10),
  weight: "",
  meal: "",
  activity_steps: "",
  mood: "Tốt",
  symptoms: "",
};

function HealthLogPage() {
  const location = useLocation();
  const user = getCurrentUser();
  const [pet, setPet] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

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
        const logsRes = await fetch(`${API}/api/health-logs?pet_id=${currentPet.id}`);
        const petLogs = await logsRes.json();
        setLogs(Array.isArray(petLogs) ? petLogs : []);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error("Lỗi tải nhật ký sức khỏe:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, user.id]);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pet) return;

    setSaving(true);
    try {
      const res = await fetch(`${API}/api/health-logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pet_id: pet.id,
          log_date: form.log_date,
          weight: form.weight ? Number(form.weight) : null,
          meal: form.meal,
          activity_steps: form.activity_steps ? Number(form.activity_steps) : null,
          mood: form.mood,
          symptoms: form.symptoms,
        }),
      });

      if (res.ok) {
        setForm({ ...emptyForm, log_date: new Date().toISOString().slice(0, 10) });
        await loadData();
      } else {
        alert("Lưu nhật ký thất bại");
      }
    } catch (err) {
      console.error("Lỗi lưu nhật ký:", err);
      alert("Lưu nhật ký thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API}/api/health-logs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLogs((prev) => prev.filter((l) => l.id !== id));
      }
    } catch (err) {
      console.error("Lỗi xóa nhật ký:", err);
    }
  };

  const handleStartEdit = (log) => {
    setEditingId(log.id);
    setEditForm({
      log_date: log.log_date || "",
      weight: log.weight ?? "",
      meal: log.meal || "",
      activity_steps: log.activity_steps ?? "",
      mood: log.mood || "Tốt",
      symptoms: log.symptoms || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleEditChange = (field) => (e) =>
    setEditForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const res = await fetch(`${API}/api/health-logs/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          log_date: editForm.log_date,
          weight: editForm.weight ? Number(editForm.weight) : null,
          meal: editForm.meal,
          activity_steps: editForm.activity_steps ? Number(editForm.activity_steps) : null,
          mood: editForm.mood,
          symptoms: editForm.symptoms,
        }),
      });

      if (res.ok) {
        setEditingId(null);
        setEditForm(null);
        await loadData();
      } else {
        alert("Cập nhật nhật ký thất bại");
      }
    } catch (err) {
      console.error("Lỗi cập nhật nhật ký:", err);
      alert("Cập nhật nhật ký thất bại");
    } finally {
      setSavingEdit(false);
    }
  };

  const latestLog = logs[0] || null;

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return [log.meal, log.mood, log.symptoms]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(term));
  });

  if (loading) return <p style={{ padding: 40 }}>Đang tải nhật ký sức khỏe...</p>;

  if (!pet)
    return (
      <p style={{ padding: 40 }}>
        Chưa có thú cưng nào. Hãy thêm thú cưng ở mục Pets trước.
      </p>
    );

  return (
    <div className="vaccine-page">
      <Sidebar active="health-logs" />

      <main className="vaccine-main">
        <header className="topbar">
          <input
            placeholder="🔍 Tìm nhật ký (bữa ăn, tâm trạng, triệu chứng)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="icons">🔔 ☺️</div>
        </header>

        <section className="hero">
          <div>
            <h1>Nhật ký sức khỏe &amp; ăn uống</h1>
            <p>Theo dõi cân nặng, bữa ăn và tâm trạng hằng ngày của {pet.name}.</p>
          </div>
        </section>

        <section className="cards">
          <div className="card">
            <span className="circle orange">⚖️</span>
            <p>Cân nặng gần nhất</p>
            <h2>
              {latestLog?.weight ?? pet.weight ?? "—"} <small>kg</small>
            </h2>
          </div>

          <div className="card">
            <span className="circle yellow">🍖</span>
            <p>Bữa ăn gần nhất</p>
            <h2 style={{ fontSize: 18 }}>{latestLog?.meal || "Chưa có ghi nhận"}</h2>
          </div>

          <div className="card meal-card">
            <p>Tâm trạng gần nhất</p>
            <h2>{latestLog?.mood || "Chưa có"}</h2>
            <span>{latestLog ? formatDate(latestLog.log_date) : "—"}</span>
          </div>
        </section>

        <section className="content-grid">
          <div>
            <h3>Thêm nhật ký mới</h3>

            <form className="form-card" onSubmit={handleSubmit} style={{ width: "100%" }}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Ngày</label>
                  <input
                    type="date"
                    value={form.log_date}
                    onChange={handleChange("log_date")}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Cân nặng (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="vd. 12.4"
                    value={form.weight}
                    onChange={handleChange("weight")}
                  />
                </div>

                <div className="form-group">
                  <label>Bữa ăn / Chế độ ăn</label>
                  <input
                    type="text"
                    placeholder="vd. Cơm gà, 2 bữa"
                    value={form.meal}
                    onChange={handleChange("meal")}
                  />
                </div>

                <div className="form-group">
                  <label>Vận động (số bước)</label>
                  <input
                    type="number"
                    placeholder="vd. 4230"
                    value={form.activity_steps}
                    onChange={handleChange("activity_steps")}
                  />
                </div>

                <div className="form-group">
                  <label>Tâm trạng</label>
                  <select value={form.mood} onChange={handleChange("mood")}>
                    {MOOD_OPTIONS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.value}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Triệu chứng / Ghi chú</label>
                  <input
                    type="text"
                    placeholder="Triệu chứng, quan sát khác..."
                    value={form.symptoms}
                    onChange={handleChange("symptoms")}
                  />
                </div>
              </div>

              <div className="btn-group">
                <button className="save-btn" type="submit" disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu nhật ký →"}
                </button>
              </div>
            </form>
          </div>

          <div>
            <WeightTrendChart logs={logs} />

            <div className="section-title">
              <h3>Nhật ký gần đây</h3>
              <span>{filteredLogs.length} bản ghi</span>
            </div>

            {logs.length === 0 && (
              <div className="add-pet">Chưa có nhật ký nào. Hãy thêm bản ghi đầu tiên.</div>
            )}

            {logs.length > 0 && filteredLogs.length === 0 && (
              <div className="add-pet">Không tìm thấy nhật ký nào khớp với "{searchTerm}".</div>
            )}

            {filteredLogs.map((log) =>
              editingId === log.id ? (
                <form className="form-card" key={log.id} onSubmit={handleSaveEdit} style={{ marginBottom: 16 }}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Ngày</label>
                      <input type="date" value={editForm.log_date} onChange={handleEditChange("log_date")} required />
                    </div>
                    <div className="form-group">
                      <label>Cân nặng (kg)</label>
                      <input type="number" step="0.1" value={editForm.weight} onChange={handleEditChange("weight")} />
                    </div>
                    <div className="form-group">
                      <label>Bữa ăn / Chế độ ăn</label>
                      <input type="text" value={editForm.meal} onChange={handleEditChange("meal")} />
                    </div>
                    <div className="form-group">
                      <label>Vận động (số bước)</label>
                      <input type="number" value={editForm.activity_steps} onChange={handleEditChange("activity_steps")} />
                    </div>
                    <div className="form-group">
                      <label>Tâm trạng</label>
                      <select value={editForm.mood} onChange={handleEditChange("mood")}>
                        {MOOD_OPTIONS.map((m) => (
                          <option key={m.value} value={m.value}>{m.value}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Triệu chứng / Ghi chú</label>
                      <input type="text" value={editForm.symptoms} onChange={handleEditChange("symptoms")} />
                    </div>
                  </div>
                  <div className="btn-group">
                    <button className="save-btn" type="submit" disabled={savingEdit}>
                      {savingEdit ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                    <button type="button" onClick={handleCancelEdit}>Hủy</button>
                  </div>
                </form>
              ) : (
                <div className="record" key={log.id}>
                  <div className={`dot ${moodDot(log.mood)}`}></div>
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
                    {log.symptoms && <p>📝 {log.symptoms}</p>}
                    <button type="button" onClick={() => handleStartEdit(log)}>
                      ✎ Sửa
                    </button>
                    <button type="button" onClick={() => handleDelete(log.id)}>
                      🗑 Xóa
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
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

export default HealthLogPage;
