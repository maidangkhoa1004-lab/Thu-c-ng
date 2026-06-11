import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaPaw,
  FaSyringe,
  FaCog,
  FaCamera,
  FaBell,
  FaUserCircle,
} from "react-icons/fa";


function AddPet() {
    const [birthday, setBirthday] = useState("");

  const handleBirthday = (e) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 8) {
      value = value.slice(0, 8);
    }

    let day = value.slice(0, 2);
    let month = value.slice(2, 4);
    let year = value.slice(4, 8);

    // Giới hạn ngày 01-31
    if (day.length === 2) {
      let d = parseInt(day);
      if (d < 1) day = "01";
      if (d > 31) day = "31";
    }

    // Giới hạn tháng 01-12
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
const navigate = useNavigate();
  return (
    <div className="addpet-page">
<aside className="sidebar">
  <div>
    <h2>Pawsitive</h2>
    <p>Pet Care Dashboard</p>

    <nav>
      <Link to="/home">🏠 Home</Link>
      <Link to="/pets" className="active">🐾 Pets</Link>
      <Link to="/vaccines">💉 Vaccines</Link>
      <a>⚙️ Settings</a>
    </nav>
  </div>

  <div className="user-box">
    <span>🐶</span>
    <div>
      <b>Alex Rivera</b>
      <p>Pet Parent</p>
    </div>
  </div>
</aside>

      <main className="main-content">
        <header className="topbar">
          <h2>Dashboard</h2>

          <input
            type="text"
            placeholder="Search pets or records..."
            className="search"
          />

          <div className="top-icons">
            <FaBell />
            <FaUserCircle />
          </div>
        </header>

        <section className="step-section">
          <div className="step active-step">
            <span>1</span>
            <p>Basic Info</p>
          </div>

          <div className="line"></div>

          <div className="step">
            <span>2</span>
            <p>Health Records</p>
          </div>

          <div className="line"></div>

          <div className="step">
            <span>3</span>
            <p>Confirmation</p>
          </div>
        </section>

        <section className="form-card">
          <h1>Tell us about your new pet</h1>
          <p className="subtitle">
            We'll help you keep track of their health, vaccines, and daily joy.
          </p>

          <label className="label">Pet Portrait</label>

          <div className="upload-box">
            <div className="camera-circle">
              <FaCamera />
            </div>
            <p>Click to upload photo</p>
            <small>High quality JPG or PNG, max 5MB</small>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Pet Name</label>
              <input type="text" placeholder="e.g. Luna" />
            </div>

            <div className="form-group">
              <label>Pet Type</label>
              <div className="pet-type">
                <button className="selected">🐶 Dog</button>
                <button>🐱 Cat</button>
                <button>—</button>
              </div>
            </div>

            <div className="form-group">
              <label>Breed</label>
              <select>
                <option>Select breed</option>
                <option>Golden Retriever</option>
                <option>Poodle</option>
                <option>Husky</option>
              </select>
            </div>

<div className="form-group">
  <label>Birthday</label>

  <input
    type="text"
    placeholder="DD/MM/YYYY"
    value={birthday}
    onChange={handleBirthday}
    maxLength="10"
  />
</div>
          </div>

          <div className="btn-group">
            <button className="save-btn"onClick={() => navigate("/pet-profile")}>Save Pet →</button>
            <button className="draft-btn">Discard Draft</button>
          </div>
        </section>

        <footer>
          <strong>Pawsitive</strong>
          <div>
            <a>Help Center</a>
            <a>Privacy Policy</a>
            <a>Terms of Service</a>
            <a>Emergency Care</a>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default AddPet;