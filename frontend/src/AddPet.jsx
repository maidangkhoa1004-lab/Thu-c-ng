import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { getCurrentUser } from "./auth";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

const PET_TYPE_OPTIONS = [
  { value: "Dog", label: "🐶 Chó" },
  { value: "Cat", label: "🐱 Mèo" },
  { value: "Bird", label: "🐦 Chim" },
  { value: "Rabbit", label: "🐰 Thỏ" },
];

function AddPet() {
  const user = getCurrentUser();
  const [birthday, setBirthday] = useState("");
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("Dog");
  const [breed, setBreed] = useState("");
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();
  const handleSavePet = async () => {
    const res = await fetch(`${API}/api/pets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: user.id,
        name: petName,
        type: petType,
        breed: breed,
        birthday: birthday,
        weight: null,
        photo: preview,
      }),
    });

    if (res.ok) {
      const result = await res.json();
      localStorage.setItem("currentPetId", result.id);

      navigate("/pet-profile", {
        state: { petId: result.id },
      });
    } else {
      alert("Lưu thất bại");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleChooseFile = (e) => {
    const file = e.target.files[0];

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleBirthday = (e) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 8) {
      value = value.slice(0, 8);
    }

    let day = value.slice(0, 2);
    let month = value.slice(2, 4);
    let year = value.slice(4, 8);

    if (day.length === 2) {
      let d = parseInt(day);
      if (d < 1) day = "01";
      if (d > 31) day = "31";
    }

    if (month.length === 2) {
      let m = parseInt(month);
      if (m < 1) month = "01";
      if (m > 12) month = "12";
    }

    let formatted = day;

    if (month) formatted += "/" + month;
    if (year) formatted += "/" + year;

    setBirthday(formatted);
  };
  const handleDiscardDraft = () => {
    setPetName("");
    setPetType("Dog");
    setBreed("");
    setBirthday("");
    setPreview(null);
  };

  return (
    <div className="addpet-page">
      <Sidebar active="pets" />

      <main className="main-content">
        <header className="topbar">
          <h2>Bảng điều khiển</h2>

          <input
            type="text"
            placeholder="Tìm thú cưng hoặc hồ sơ..."
            className="search"
          />

          <div className="top-icons">
            <span>🔔</span>
            <span>☺️</span>
          </div>
        </header>

        <section className="step-section">
          <div className="step active-step">
            <span>1</span>
            <p>Thông tin cơ bản</p>
          </div>

          <div className="line"></div>

          <div className="step">
            <span>2</span>
            <p>Hồ sơ sức khỏe</p>
          </div>

          <div className="line"></div>

          <div className="step">
            <span>3</span>
            <p>Xác nhận</p>
          </div>
        </section>

        <section className="form-card">
          <h1>Hãy cho chúng tôi biết về thú cưng mới của bạn</h1>
          <p className="subtitle">
            Chúng tôi sẽ giúp bạn theo dõi sức khỏe, lịch tiêm chủng và niềm vui hằng ngày của bé.
          </p>

          <label className="label">Ảnh đại diện thú cưng</label>

          <div className="upload-box" onClick={handleUploadClick}>
            {preview ? (
              <img src={preview} alt="Thú cưng" className="preview-img" />
            ) : (
              <>
                <div className="camera-circle">📷</div>
                <p>Bấm để tải ảnh lên</p>
                <small>Ảnh chất lượng cao định dạng JPG hoặc PNG, tối đa 5MB</small>
              </>
            )}

            <input
              type="file"
              accept="image/png, image/jpeg"
              ref={fileInputRef}
              onChange={handleChooseFile}
              style={{ display: "none" }}
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Tên thú cưng</label>
              <input
                type="text"
                placeholder="vd. Luna"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Loài</label>
              <div className="pet-type">
                {PET_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPetType(opt.value)}
                    className={petType === opt.value ? "selected" : ""}
                  >
                    {opt.label}
                  </button>
                ))}
                <button
                  type="button"
                  className={!PET_TYPE_OPTIONS.some((o) => o.value === petType) ? "selected" : ""}
                  onClick={() =>
                    setPetType((t) => (PET_TYPE_OPTIONS.some((o) => o.value === t) ? "" : t))
                  }
                >
                  Khác
                </button>
              </div>
              {!PET_TYPE_OPTIONS.some((o) => o.value === petType) && (
                <input
                  type="text"
                  placeholder="Nhập loài khác..."
                  value={petType}
                  onChange={(e) => setPetType(e.target.value)}
                  style={{ marginTop: 8 }}
                />
              )}
            </div>

            <div className="form-group">
              <label>Giống</label>
              <select value={breed} onChange={(e) => setBreed(e.target.value)}>
                <option value="">Chọn giống</option>
                <option value="Golden Retriever">Golden Retriever</option>
                <option value="Poodle">Poodle</option>
                <option value="Husky">Husky</option>
              </select>
            </div>

            <div className="form-group">
              <label>Ngày sinh</label>
              <input
                type="text"
                placeholder="NN/TT/NNNN"
                value={birthday}
                onChange={handleBirthday}
                maxLength="10"
              />
            </div>
          </div>

          <div className="btn-group">
            <button
              className="save-btn"
              onClick={handleSavePet}
            >
              Lưu thú cưng →
            </button>
            <button
              className="draft-btn"
              onClick={handleDiscardDraft}
            >
              Hủy bản nháp
            </button>
          </div>
        </section>

        <footer>
          <strong>🐾 Paws &amp; Vitality</strong>
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

export default AddPet;