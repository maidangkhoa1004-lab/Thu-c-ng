import { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { getCurrentUser } from "./auth";
import "./Admin.css";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const STATUS_LABEL = {
  Requested: "Đang chờ",
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

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const emptyForm = {
  pet_id: "",
  title: "",
  appointment_date: "",
  location: "",
  note: "",
};

function AdminAppointments() {
  const me = getCurrentUser();
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [viewDate, setViewDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    try {
      const [petsRes, apptRes] = await Promise.all([
        fetch(`${API}/api/pets`),
        fetch(`${API}/api/appointments?admin_id=${me.id}`),
      ]);
      setPets(await petsRes.json());
      setAppointments((await apptRes.json()) || []);
    } catch (err) {
      console.error("Lỗi tải lịch hẹn:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me.id]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.pet_id || !form.title || !form.appointment_date) return;

    setSaving(true);
    try {
      const res = await fetch(`${API}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin_id: me.id,
          pet_id: Number(form.pet_id),
          title: form.title,
          appointment_date: form.appointment_date,
          location: form.location,
          note: form.note,
          status: "Confirmed",
        }),
      });

      if (res.ok) {
        setForm(emptyForm);
        setShowForm(false);
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

  const handleStatusChange = async (appt, status) => {
    setUpdatingId(appt.id);
    try {
      const res = await fetch(`${API}/api/appointments/${appt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin_id: me.id,
          title: appt.title,
          appointment_date: appt.appointment_date,
          location: appt.location,
          note: appt.note,
          status,
        }),
      });

      if (res.ok) {
        await loadData();
      } else {
        alert("Cập nhật thất bại");
      }
    } catch (err) {
      console.error("Lỗi cập nhật lịch hẹn:", err);
      alert("Cập nhật thất bại");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return [a.pet_name, a.title, a.owner_name, a.location]
      .filter(Boolean)
      .some((f) => f.toLowerCase().includes(term));
  });

  const requestList = filteredAppointments.filter((a) => a.status === "Requested");

  const confirmedOrDone = appointments.filter((a) => a.status === "Confirmed" || a.status === "Completed");
  const clinicPulse = appointments.length
    ? Math.round((confirmedOrDone.length / appointments.length) * 100)
    : 0;

  // ---- Simple month calendar ----
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const apptDatesInMonth = appointments
    .filter((a) => a.appointment_date)
    .map((a) => new Date(a.appointment_date))
    .filter((d) => !isNaN(d) && d.getFullYear() === year && d.getMonth() === month);

  const hasApptOnDay = (day) => apptDatesInMonth.some((d) => d.getDate() === day);

  const calCells = [];
  for (let i = 0; i < startWeekday; i++) calCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calCells.push(d);

  const monthLabel = viewDate.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });

  if (loading) return <p style={{ padding: 40 }}>Đang tải lịch hẹn...</p>;

  return (
    <div className="dashboard">
      <AdminSidebar active="appointments" />

      <main className="main-content">
        <header className="topbar">
          <input
            type="text"
            placeholder="🔍 Tìm lịch hẹn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="icons">🔔 ☺️</div>
        </header>

        <section className="hero">
          <div>
            <h1>Quản lý lịch hẹn</h1>
            <p>Quản lý lịch hẹn khám &amp; tiêm chủng của toàn bộ khách hàng.</p>
          </div>
          <button className="status-btn" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "✕ Đóng" : "+ Đặt lịch mới"}
          </button>
        </section>

        {showForm && (
          <form className="form-card" onSubmit={handleCreate} style={{ maxWidth: 760, margin: "0 auto 30px" }}>
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
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Loại lịch hẹn</label>
                <input
                  type="text"
                  placeholder="vd. Khám tổng quát"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Thời gian</label>
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
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                />
              </div>
            </div>

            <div className="btn-group">
              <button className="save-btn" type="submit" disabled={saving}>
                {saving ? "Đang lưu..." : "Xác nhận đặt lịch →"}
              </button>
            </div>
          </form>
        )}

        <section className="content-grid">
          <div>
            <h3>Danh sách yêu cầu</h3>

            {requestList.length === 0 && (
              <div className="add-pet">Không có yêu cầu đặt lịch nào đang chờ.</div>
            )}

            {requestList.map((a) => (
              <div className="adm-queue-item" key={a.id}>
                <div className="pet-img">🐾</div>
                <div style={{ flex: 1 }}>
                  <h4>{a.pet_name || "Thú cưng"} — {a.title}</h4>
                  <p>{a.owner_name || "—"} · {formatDateTime(a.appointment_date)}</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="save-btn"
                    style={{ padding: "8px 14px", fontSize: 12 }}
                    disabled={updatingId === a.id}
                    onClick={() => handleStatusChange(a, "Confirmed")}
                  >
                    ✓
                  </button>
                  <button
                    className="draft-btn"
                    style={{ padding: "8px 14px", fontSize: 12 }}
                    disabled={updatingId === a.id}
                    onClick={() => handleStatusChange(a, "Cancelled")}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            <h3 style={{ marginTop: 30 }}>Tất cả lịch hẹn</h3>
            {appointments.length === 0 && (
              <div className="add-pet">Chưa có lịch hẹn nào.</div>
            )}
            {appointments.length > 0 && filteredAppointments.length === 0 && (
              <div className="add-pet">Không tìm thấy lịch hẹn nào khớp với "{searchTerm}".</div>
            )}
            {filteredAppointments.map((a) => (
              <div className="vaccine-card" key={`all-${a.id}`}>
                <div className="pet-img">🐾</div>
                <div>
                  <h4>{a.pet_name || "Thú cưng"}</h4>
                  <p>{a.title} · {a.owner_name || "—"}</p>
                </div>
                <span>{STATUS_LABEL[a.status] || a.status}</span>
              </div>
            ))}
          </div>

          <div>
            <div className="adm-calendar">
              <div className="adm-cal-header">
                <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))}>‹</button>
                <b style={{ textTransform: "capitalize" }}>{monthLabel}</b>
                <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))}>›</button>
              </div>

              <div className="adm-cal-grid">
                {WEEKDAYS.map((w) => (
                  <div className="adm-cal-dow" key={w}>{w}</div>
                ))}

                {calCells.map((day, idx) => {
                  if (day === null) return <div className="adm-cal-day empty" key={`e-${idx}`}></div>;
                  const cellDate = new Date(year, month, day);
                  const isToday = sameDay(cellDate, today);
                  return (
                    <div className={`adm-cal-day ${isToday ? "today" : ""}`} key={day}>
                      {day}
                      {hasApptOnDay(day) && <span className="adm-cal-dot"></span>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card meal-card" style={{ width: "100%", marginTop: 20 }}>
              <p>Nhịp độ phòng khám</p>
              <h2>
                {clinicPulse} <small>%</small>
              </h2>
              <span>Tỷ lệ lịch hẹn đã xác nhận / hoàn tất</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminAppointments;
