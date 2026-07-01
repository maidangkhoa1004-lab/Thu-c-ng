import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaCamera,
  FaBell,
  FaUserCircle,
} from "react-icons/fa";

function AddPet() {
  const [birthday, setBirthday] = useState("");
  const [petName, setPetName] = useState("");
const [petType, setPetType] = useState("Dog");
const [breed, setBreed] = useState("");
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();
  const handleSavePet = async () => {
  const res = await fetch("http://127.0.0.1:5000/api/pets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: 1,
      name: petName,
      type: petType,
      breed: breed,
      birthday: birthday,
      weight: null,
      photo: preview,
    }),
  });

  if (res.ok) {
    navigate("/pet-profile", {
      state: {
    petImage: preview,
    petName: petName,
    petType: petType,
    breed: breed,
      },
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

          <div className="upload-box" onClick={handleUploadClick}>
            {preview ? (
              <img src={preview} alt="Pet" className="preview-img" />
            ) : (
              <>
                <div className="camera-circle">
                  <FaCamera />
                </div>
                <p>Click to upload photo</p>
                <small>High quality JPG or PNG, max 5MB</small>
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
              <label>Pet Name</label>
              <input
                type="text"
                placeholder="e.g. Luna"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                />
            </div>

            <div className="form-group">
              <label>Pet Type</label>
              <div className="pet-type">
                <button onClick={() => setPetType("Dog")} className={petType === "Dog" ? "selected" : ""}>🐶 Dog</button>
                <button onClick={() => setPetType("Cat")} className={petType === "Cat" ? "selected" : ""}>🐱 Cat</button>
                <button>—</button>
              </div>
            </div>

            <div className="form-group">
              <label>Breed</label>
                <select value={breed} onChange={(e) => setBreed(e.target.value)}>
                   <option value="">Select breed</option>
                   <option value="Golden Retriever">Golden Retriever</option>
                    <option value="Poodle">Poodle</option>
                    <option value="Husky">Husky</option>
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
            <button
               className="save-btn"
                onClick={handleSavePet}
              >
               Save Pet →
            </button>
            <button
            className="draft-btn"
            onClick={handleDiscardDraft}
            >
               Discard Draft
            </button>
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