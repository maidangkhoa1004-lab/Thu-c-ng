import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { getCurrentUser } from "./auth";

const API = "http://127.0.0.1:5000";

const SERVICES = [
  { icon: "🩺", name: "Khám tổng quát", desc: "Kiểm tra sức khỏe định kỳ" },
  { icon: "💉", name: "Tiêm phòng", desc: "Vắc-xin theo lịch tiêm chủng" },
  { icon: "🦷", name: "Khám răng miệng", desc: "Vệ sinh & kiểm tra răng" },
  { icon: "✂️", name: "Cắt tỉa lông", desc: "Chăm sóc ngoại hình" },
  { icon: "🧪", name: "Xét nghiệm", desc: "Xét nghiệm máu, nước tiểu" },
  { icon: "🥗", name: "Tư vấn dinh dưỡng", desc: "Chế độ ăn phù hợp" },
];

const STATUS_LABEL = {
  Requested: "Đang chờ xác nhận",
  Confirmed: "Đã xác nhận",
  Completed: "Đã hoàn tất",
  Cancelled: "Đã hủy",
};

function formatDateTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
}

const emptyForm = {
  pet_id: "",
  title: "",
  appointment_date: "",
  location: "",
  note: "",
};

function BookAppointment() {
  const user = getCurrentUser();
  const [pets, setPets] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    try {
      const [petsRes, apptRes] = await Promise.all([
        fetch(`${API}/api/pets?user_id=${user.id}`),
        fetch(`${API}/api/my-appointments?user_id=${user.id}`),
      ]);
      setPets(await petsRes.json());
      setMyAppointments((await apptRes.json()) || []);
    } catch (err) {
      console.error("Lỗi tải lịch hẹn:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const handlePickService = (name) => {
    setForm((f) => ({ ...f, title: name }));
  };

  const filteredServices = SERVICES.filter((s) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return s.name.toLowerCase().includes(term) || s.desc.toLowerCase().includes(term);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.pet_id || !form.title || !form.appointment_date) return;

    setSaving(true);
    try {
      const res = await fetch(`${API}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pet_id: Number(form.pet_id),
          title: form.title,
          appointment_date: form.appointment_date,
          location: form.location,
          note: form.note,
          status: "Requested",
        }),
      });

      if (res.ok) {
        setForm(emptyForm);
        await loadData();
      } else {
        alert("Đặt lịch thất bại");
      }
    } catch (err) {
      console.error("Lỗi đặt lịch:", err);
      alert("Đặt lịch thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Hủy lịch hẹn này?")) return;

    setCancellingId(id);
    try {
      const res = await fetch(`${API}/api/appointments/${id}`, { method: "DELETE" });
      if (res.ok) {
        await loadData();
      } else {
        alert("Hủy lịch thất bại");
      }
    } catch (err) {
      console.error("Lỗi hủy lịch:", err);
      alert("Hủy lịch thất bại");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <p style={{ padding: 40 }}>Đang tải trang đặt lịch...</p>;

  if (pets.length === 0)
    return (
      <div className="dashboard">
        <Sidebar active="book" />
        <main className="main-content">
          <p style={{ padding: 40 }}>
            Chưa có thú cưng nào. Hãy thêm thú cưng ở mục Pets trước khi đặt lịch.
          </p>
        </main>
      </div>
    );

  return (
    <div className="dashboard">
      <Sidebar active="book" />

      <main className="main-content">
        <header className="topbar">
          <input
            type="text"
            placeholder="🔍 Tìm dịch vụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="icons">🔔 ☺️</div>
        </header>

        <section className="hero">
          <div>
            <h1>Đặt lịch hẹn</h1>
            <p>Chọn dịch vụ, thú cưng và thời gian phù hợp — đội ngũ sẽ xác nhận sớm nhất.</p>
          </div>
        </section>

        <h3>Dịch vụ</h3>
        {filteredServices.length === 0 && (
          <p style={{ color: "#888" }}>Không tìm thấy dịch vụ nào khớp với "{searchTerm}".</p>
        )}
        <div className="care-grid" style={{ marginBottom: 30 }}>
          {filteredServices.map((s) => (
            <div
              className={`care-card ${form.title === s.name ? "green-border" : ""}`}
              key={s.name}
              style={{ cursor: "pointer" }}
              onClick={() => handlePickService(s.name)}
            >
              <span>{s.icon}</span>
              <div>
                <h3>{s.name}</h3>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <form className="form-card" onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 760, margin: "0 auto 30px" }}>
          <div className="form-grid">
            <div className="form-group">
              <label>Thú cưng</label>
              <select
                value={form.pet_id}
                onChange={(e) => setForm((f) => ({ ...f, pet_id: e.target.value }))}
                required
              >
                <option value="">Chọn thú cưng</option>
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Dịch vụ</label>
              <input
                type="text"
                placeholder="Chọn ở danh sách trên hoặc tự nhập"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Thời gian mong muốn</label>
              <input
                type="datetime-local"
                value={form.appointment_date}
                onChange={(e) => setForm((f) => ({ ...f, appointment_date: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Địa điểm</label>
              <input
                type="text"
                placeholder="vd. Phòng khám trung tâm"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label>Ghi chú</label>
              <input
                type="text"
                placeholder="Triệu chứng, yêu cầu riêng..."
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              />
            </div>
          </div>

          <div className="btn-group">
            <button className="save-btn" type="submit" disabled={saving}>
              {saving ? "Đang gửi..." : "Gửi yêu cầu đặt lịch →"}
            </button>
          </div>
        </form>

        <h3>Lịch hẹn của tôi</h3>
        {myAppointments.length === 0 && (
          <div className="add-pet">Bạn chưa có lịch hẹn nào.</div>
        )}
        {myAppointments.map((a) => (
          <div className="vaccine-card" key={a.id}>
            <div className="pet-img">🐾</div>
            <div>
              <h4>{a.pet_name} — {a.title}</h4>
              <p>{formatDateTime(a.appointment_date)} {a.location ? `· ${a.location}` : ""}</p>
            </div>
            <span>{STATUS_LABEL[a.status] || a.status}</span>
            {(a.status === "Requested" || a.status === "Confirmed") && (
              <button
                className="light-btn"
                style={{ marginLeft: 12 }}
                disabled={cancellingId === a.id}
                onClick={() => handleCancel(a.id)}
              >
                {cancellingId === a.id ? "..." : "Hủy"}
              </button>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}

export default BookAppointment;
