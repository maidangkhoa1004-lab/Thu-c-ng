import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
function HomePage() {
    const navigate = useNavigate();
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div>
          <h2>Pawsitive</h2>
          <p>Pet Care Dashboard</p>

          <nav>
                <Link to="/home" className="active">🏠 Home</Link>
                <Link to="/pets">🐾 Pets</Link>
                <Link to="/vaccines">💉 Vaccines</Link>
                <Link to="/health-logs">📋 Health Logs</Link>
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
          <input type="text" placeholder="🔍 Search pet health logs..." />
          <div className="icons">🔔 ☺️</div>
        </header>

        <section className="hero">
          <div>
            <h1>Good morning, Alex!</h1>
            <p>Here's how your furry friends are doing today.</p>
          </div>

          <button className="status-btn">✅ All pets are up-to-date</button>
        </section>

        <section className="cards">
          <div className="card">
            <span className="circle orange">▣</span>
            <p>Average Weight</p>
            <h2>12.4 <small>kg</small></h2>
          </div>

          <div className="card">
            <span className="circle yellow">🏃</span>
            <p>Daily Activity</p>
            <h2>4,230 <small>steps</small></h2>
            <div className="progress">
              <div></div>
            </div>
          </div>

          <div className="card meal-card">
            <p>Next Meal</p>
            <h2>12:30 PM</h2>
            <span>Chicken & Rice Mix</span>
          </div>
        </section>

        <section className="content-grid">
          <div>
            <h3>Quick Actions</h3>

            <div className="action-card">
              <span>⊕</span>
              <div>
                <h4>Add Event</h4>
                <p>Schedule vet or park visit</p>
              </div>
            </div>

            <div className="action-card green-border">
              <span>▣</span>
              <div>
                <h4>Log Health</h4>
                <p>Update weight or symptoms</p>
              </div>
            </div>

            <div className="action-card">
              <span>📸</span>
              <div>
                <h4>Update Photo</h4>
                <p>Capture a new memory</p>
              </div>
            </div>
          </div>

          <div>
            <div className="section-title">
              <h3>Upcoming Vaccinations</h3>
              <a>View All</a>
            </div>

            <div className="vaccine-card">
              <div className="pet-img">🐶</div>
              <div>
                <h4>Cooper</h4>
                <p>Rabies Booster</p>
              </div>
              <span>In 4 Days</span> 
            </div>

            <div className="vaccine-card">
              <div className="pet-img">🐱</div>
              <div>
                <h4>Luna</h4> 
                <p>FVRCP Vaccination</p>
              </div><span>In 12 Days</span></div>
            <div className="add-pet">＋ Add another pet to track...</div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomePage;