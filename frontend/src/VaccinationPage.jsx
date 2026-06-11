import { Link } from "react-router-dom";

function VaccinationPage() {
  return (
    <div className="vaccine-page">
      <aside className="sidebar">
        <div>
          <h2>Pawsitive</h2>
          <p>Pet Care Dashboard</p>

          <nav>
            <Link to="/home">🏠 Home</Link>
            <Link to="/pets">🐾 Pets</Link>
            <Link to="/vaccines" className="active">💉 Vaccines</Link>
            <a>⚙️ Settings</a>
          </nav>
        </div>

        <div className="user-box">
          <span>🐶</span>
          <div>
            <b>Dr. Julian</b>
            <p>Premium Care</p>
          </div>
        </div>
      </aside>

      <main className="vaccine-main">
        <header className="vaccine-topbar">
          <input placeholder="🔍 Search records..." />
          <div>
            <b>Dashboard</b>
            <span> 🔔 ☺️</span>
          </div>
        </header>

        <section className="journey-card">
          <img
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=300"
            alt="Mochi"
          />

          <div className="journey-info">
            <div className="journey-title">
              <h1>Mochi's Health Journey</h1>
              <span>Excellent Condition</span>
            </div>

            <p>
              Mochi is 85% protected against common pet illnesses. Only two doses
              remaining to reach full annual immunity.
            </p>

            <small>Annual Progress</small>

            <div className="vaccine-progress">
              <div></div>
            </div>
          </div>

          <div className="next-visit">
            <div>📅</div>
            <h2>Sept 12</h2>
            <p>Next Vet Visit</p>
          </div>
        </section>

        <section className="status-title">
          <h2>Upcoming & Status</h2>

          <div>
            <button className="filter-btn">☰ Filter</button>
            <button className="log-btn">＋ Log Dose</button>
          </div>
        </section>

        <section className="vaccine-grid">
          <div className="vaccine-status-card">
            <div className="status-row">
              <span className="icon red">◇</span>
              <b className="badge red-badge">Overdue</b>
            </div>

            <h3>Rabies Core</h3>
            <p>
              Annual booster required for local licensing and legal compliance.
            </p>

            <div className="due-row">
              <small>Due Date</small>
              <b>Aug 15, 2024</b>
            </div>

            <button className="danger-btn">Schedule Emergency</button>
          </div>

          <div className="vaccine-status-card">
            <div className="status-row">
              <span className="icon yellow">◷</span>
              <b className="badge yellow-badge">Upcoming</b>
            </div>

            <h3>Bordetella</h3>
            <p>
              Protects against kennel cough. Recommended for social environments.
            </p>

            <div className="due-row">
              <small>Due Date</small>
              <b>Sep 20, 2024</b>
            </div>

            <button className="light-btn">☞ Set Reminder</button>
          </div>

          <div className="vaccine-status-card">
            <div className="status-row">
              <span className="icon green">●</span>
              <b className="badge green-badge">Completed</b>
            </div>

            <h3>DHPP Core</h3>
            <p>
              Distemper, Hepatitis, Parainfluenza, and Parvovirus combo.
            </p>

            <div className="due-row">
              <small>Administered</small>
              <b className="green-text">Jan 10, 2024</b>
            </div>

            <button className="light-btn">View Record</button>
          </div>
        </section>

        <section className="nearby-card">
          <div>
            <h2>Find Nearby Pet Care</h2>
            <p>
              Overdue for Rabies? We've partnered with 12 local clinics in your
              area that offer same-day walk-in appointments for Pawsitive users.
            </p>

            <div className="nearby-buttons">
              <button>Find Clinic Now</button>
              <button>View Map</button>
            </div>
          </div>

          <img
            src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=500"
            alt="Vet"
          />
        </section>

        <footer className="dash-footer">
          <h3>Pawsitive</h3>
          <p>© 2024 Pawsitive Pet Management. Nurturing the bond.</p>
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

export default VaccinationPage;