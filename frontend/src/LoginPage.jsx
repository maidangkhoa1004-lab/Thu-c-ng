import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="login-container">

        {/* Left Side */}
        <div className="left-panel">
          <div className="logo">
            🐾 <span>Paws & Vitality</span>
          </div>

          <div className="image-box">
            <img
              src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500"
              alt="Dog"
            />
          </div>

          <h2>Nurturing the bond</h2>

          <p>
            Manage your pet's vitality with a digital hug.
            <br />
            Simple care for the ones who love you most.
          </p>
        </div>

        {/* Right Side */}
        <div className="right-panel">
          <h1>Welcome back</h1>

          <p className="subtitle">
            Sign in to continue caring for your pets.
          </p>

          <div className="form-group">
              <div className="Email">
            <label>Email Address</label>
              </div>
            <div className="input-box">
              <span>✉️</span>
              <input
                type="email"
                placeholder="hello@petowner.com"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="password-header">
              <label>Password</label>
              <a href="#">Forgot Password?</a>
            </div>

            <div className="input-box">
              <span>🔒</span>

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
              />

              <button
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                👁️
              </button>
            </div>
          </div>

            <button
                className="signin-btn"
                 onClick={() => navigate("/home")}
            >
                 Sign In
            </button>

          <div className="divider">
            <span>OR CONTINUE WITH</span>
          </div>

          <div className="social-buttons">
            <button>Google</button>
            <button>Facebook</button>
          </div>

          <p className="signup-text">
            Don't have an account? <a href="#">Create a free profile</a>
          </p>
        </div>
      </div>

      <footer>
        © 2024 Paws & Vitality. Designed with love for every wag and purr.
      </footer>
    
    
    </div>
  );
}

export default LoginPage;