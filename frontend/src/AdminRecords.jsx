import { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { getCurrentUser } from "./auth";
import "./Admin.css";

const API = "http://127.0.0.1:5000";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("vi-VN");
}

function petIcon(type) {
  if (type === "Dog") return "🐶";
  if (type === "Cat") return "🐱";
  return "🐾";
}

const emptyForm = {
  pet_id: "",
  title: "",
  record_date: new Date().toISOString().slice(0, 10),
  description: "",
};

const RECORD_STATUS_LABEL = {
  Pending: "Đang chờ",
  Approved: "Đã duyệt",
  Rejected: "Đã từ chối",
};

function AdminRecords() {
  const me = getCurrentUser();
  const [pets, setPets] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    try {
      const [petsRes, recRes] = await Promise.all([
        fetch(`${API}/api/pets`),
        fetch(`${API}/api/medical-records?admin_id=${me.id}`),
      ]);
      setPets(await petsRes.json());
      const recs = (await recRes.json()) || [];
      setRecords(recs);
      setSelectedId((prev) => prev ?? recs[0]?.id ?? null);
    } catch (err) {
      console.error("Lỗi tải hồ sơ:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me.id]);

  const selected = records.find((r) => r.id === selectedId) || null;
  const pendingCount = records.filter((r) => r.status === "Pending").length;

  const filteredRecords = records.filter((r) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return [r.pet_name, r.title, r.owner_name]
      .filter(Boolean)
      .some((f) => f.toLowerCase().includes(term));
  });

  const handleDecision = async (status) => {
    if (!selected) return;
    setUpdating(true);
    try {
      const res = await fetch(`${API}/api/medical-records/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_id: me.id, status }),
      });

      if (res.ok) {
        await loadData();
      } else {
        alert("Cập nhật thất bại");
      }
    } catch (err) {
      console.error("Lỗi duyệt hồ sơ:", err);
      alert("Cập nhật thất bại");
    } finally {
      setUpdating(false);
    }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    if (!form.pet_id || !form.title) return;

    setSaving(true);
    try {
      const res = await fetch(`${API}/api/medical-records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin_id: me.id,
          pet_id: Number(form.pet_id),
          title: form.title,
          record_date: form.record_date,
          description: form.description,
          file_url: null,
          status: "Pending",
        }),
      });

      if (res.ok) {
        setForm(emptyForm);
        setShowForm(false);
        await loadData();
      } else {
        alert("Thêm hồ sơ thất bại");
      }
    } catch (err) {
      console.error("Lỗi thêm hồ sơ:", err);
      alert("Thêm hồ sơ thất bại");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ padding: 40 }}>Đang tải hàng đợi duyệt hồ sơ...</p>;

  return (
    <div className="dashboard">
      <AdminSidebar active="records" />

      <main className="main-content">
        <header className="topbar">
          <input
            type="text"
            placeholder="🔍 Tìm hồ sơ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="icons">🔔 ☺️</div>
        </header>

        <section className="hero">
          <div>
            <h1>Hàng đợi hồ sơ sức khỏe</h1>
            <p>{pendingCount} hồ sơ đang chờ admin xác nhận &amp; ký duyệt.</p>
          </div>
          <button className="status-btn" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "✕ Đóng" : "+ Thêm hồ sơ"}
          </button>
        </section>

        {showForm && (
          <form className="form-card" onSubmit={handleAddRecord} style={{ maxWidth: 760, margin: "0 auto 30px" }}>
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
                <label>Tiêu đề hồ sơ</label>
                <input
                  type="text"
                  placeholder="vd. Kết quả xét nghiệm máu"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Ngày ghi nhận</label>
                <input
                  type="date"
                  value={form.record_date}
                  onChange={(e) => setForm((f) => ({ ...f, record_date: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>

            <div className="btn-group">
              <button className="save-btn" type="submit" disabled={saving}>
                {saving ? "Đang lưu..." : "Gửi vào hàng đợi duyệt →"}
              </button>
            </div>
          </form>
        )}

        <section className="content-grid">
          <div>
            <h3>Hàng đợi</h3>

            {records.length === 0 && (
              <div className="add-pet">Chưa có hồ sơ nào cần duyệt.</div>
            )}

            {records.length > 0 && filteredRecords.length === 0 && (
              <div className="add-pet">Không tìm thấy hồ sơ nào khớp với "{searchTerm}".</div>
            )}

            {filteredRecords.map((r) => (
              <div
                className={`adm-queue-item ${selectedId === r.id ? "selected" : ""}`}
                key={r.id}
                onClick={() => setSelectedId(r.id)}
              >
                <div className="pet-img">{petIcon(r.pet_type)}</div>
                <div style={{ flex: 1 }}>
                  <h4>{r.pet_name || "Thú cưng"} — {r.title}</h4>
                  <p>{r.owner_name || "—"} · {formatDate(r.record_date)}</p>
                </div>
                <b
                  className={
                    r.status === "Approved"
                      ? "green-text"
                      : r.status === "Rejected"
                      ? "due-row"
                      : ""
                  }
                  style={{ fontSize: 12 }}
                >
                  {RECORD_STATUS_LABEL[r.status] || r.status}
                </b>
              </div>
            ))}
          </div>

          <div>
            <h3>Chi tiết hồ sơ</h3>

            {!selected ? (
              <div className="adm-empty-state">Chọn một hồ sơ ở danh sách bên trái để xem chi tiết.</div>
            ) : (
              <div className="adm-detail-panel">
                <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 18 }}>
                  <img
                    src={selected.pet_photo || "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200"}
                    alt={selected.pet_name}
                    style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }}
                  />
                  <div>
                    <h2 style={{ margin: 0, fontSize: 18 }}>{selected.pet_name}</h2>
                    <p style={{ margin: 0, color: "#8a7f74", fontSize: 13 }}>
                      {selected.pet_breed || selected.pet_type} · Chủ: {selected.owner_name || "—"}
                    </p>
                  </div>
                </div>

                <div className="adm-detail-row">
                  <span>Tiêu đề</span>
                  <b>{selected.title}</b>
                </div>
                <div className="adm-detail-row">
                  <span>Ngày ghi nhận</span>
                  <b>{formatDate(selected.record_date)}</b>
                </div>
                <div className="adm-detail-row">
                  <span>Trạng thái</span>
                  <b>{RECORD_STATUS_LABEL[selected.status] || selected.status}</b>
                </div>
                <div className="adm-detail-row" style={{ borderBottom: "none" }}>
                  <span>Mô tả</span>
                </div>
                <p style={{ color: "#4f4a45", fontSize: 14, margin: "0 0 20px" }}>
                  {selected.description || "Không có mô tả."}
                </p>

                <div className="btn-group">
                  <button
                    className="draft-btn"
                    disabled={updating}
                    onClick={() => handleDecision("Rejected")}
                  >
                    Từ chối hồ sơ
                  </button>
                  <button
                    className="save-btn"
                    disabled={updating}
                    onClick={() => handleDecision("Approved")}
                  >
                    Duyệt hồ sơ
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminRecords;
