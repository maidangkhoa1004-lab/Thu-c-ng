import { Link } from "react-router-dom";
function PetProfile() {
  return (
    <div className="pet-page">
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

      <main className="pet-main">
        <div className="pet-header">
          <h3>← Dashboard</h3>
          <div>🔔 ☺️</div>
        </div>

        <div className="pet-layout">
          <section className="pet-left">
            <div className="pet-card">
              <img
                src="https://images.unsplash.com/photo-1612195583950-b8fd34c87093?w=500"
                alt="LuLu"
              />

              <div className="pet-name-row">
                <div>
                  <h1>LuLu</h1>
                  <span>Dog</span>
                  <span className="senior">Senior</span>
                </div>
                <button className="edit-icon">✎</button>
              </div>
            </div>

            <div className="info-card">
              <h3>Vital Stats</h3>

              <div className="stat-row">
                <span>🏷️ Breed</span>
                <b>Cocker Spaniel</b>
              </div>

              <div className="stat-row">
                <span>🎂 Age</span>
                <b>8 Years</b>
              </div>

              <div className="stat-row">
                <span>⚖️ Weight</span>
                <b>12.4 kg</b>
              </div>
            </div>

            <div className="health-card">
              <div>
                <h3>Overall Health</h3>
                <b>●</b>
              </div>

              <div className="health-bar">
                <div></div>
              </div>

              <p>
                LuLu is in excellent shape! Next checkup in 2 months.
              </p>
            </div>
          </section>

          <section className="pet-right">
            <div className="active-care-title">
              <h2>Active Care</h2>
              <button>＋ Log Event</button>
            </div>

            <div className="care-grid">
              <div className="care-card">
                <span>💉</span>
                <div>
                  <p>Upcoming</p>
                  <h3>Annual Vaccine</h3>
                  <small>Due Oct 15, 2024</small>
                </div>
              </div>

              <div className="care-card">
                <span>🍽️</span>
                <div>
                  <p>Daily Task</p>
                  <h3>Hip Supplement</h3>
                  <small>AM & PM with meals</small>
                </div>
              </div>
            </div>

            <div className="history-card">
              <div className="history-title">
                <h2>Medical History</h2>
                <div>☰ 🔍</div>
              </div>

              <div className="record">
                <div className="dot green"></div>
                <div className="record-box">
                  <div className="record-head">
                    <h3>Dental Cleaning</h3>
                    <span>Aug 12, 2024</span>
                  </div>
                  <p>
                    Routine dental prophylaxis and tartar removal. No extractions required.
                  </p>
                  <button>📄 Summary.pdf</button>
                  <button>🩻 X-Ray.jpg</button>
                </div>
              </div>

              <div className="record">
                <div className="dot orange"></div>
                <div className="record-box">
                  <div className="record-head">
                    <h3>Rabies Vaccination</h3>
                    <span>May 05, 2024</span>
                  </div>
                  <p>
                    3-year booster administered. LuLu tolerated the injection well.
                  </p>
                  <button>📄 Certificate.pdf</button>
                </div>
              </div>

              <div className="record">
                <div className="dot yellow"></div>
                <div className="record-box">
                  <div className="record-head">
                    <h3>Bi-Annual Wellness Exam</h3>
                    <span>Jan 20, 2024</span>
                  </div>
                  <p>
                    Full body exam. Bloodwork and urinalysis within normal range.
                  </p>
                  <button>📄 Lab_Report.pdf</button>
                </div>
              </div>

              <button className="view-records">
                View Older Records
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default PetProfile;