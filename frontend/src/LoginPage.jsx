import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { saveCurrentUser } from "./auth";

const API = "http://127.0.0.1:5000";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        saveCurrentUser(data);
        navigate(data.role === "admin" ? "/admin" : "/home");
      } else {
        setError(data.error || "Email hoặc mật khẩu không đúng.");
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      setError("Không thể kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="login-container">

        {/* Left Side */}
        <div className="left-panel">
          <Link to="/" className="logo">
            🐾 <span>Paws & Vitality</span>
          </Link>

          <div className="image-box">
            <img
              src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500"
              alt="Chó"
            />
          </div>

          <h2>Nuôi dưỡng sự gắn kết</h2>

          <p>
            Chăm sóc sức khỏe thú cưng chỉ bằng một cái chạm.
            <br />
            Đơn giản cho những người bạn bạn yêu thương nhất.
          </p>
        </div>

        {/* Right Side */}
        <div className="right-panel">
          <h1>Chào mừng trở lại</h1>

          <p className="subtitle">
            Đăng nhập để tiếp tục chăm sóc thú cưng của bạn.
          </p>

          <form onSubmit={handleSignIn}>
            <div className="form-group">
              <label>Địa chỉ Email</label>
              <div className="input-box">
                <span>✉️</span>
                <input
                  type="email"
                  placeholder="hello@petowner.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="password-header">
                <label>Mật khẩu</label>
                <Link to="/forgot-password">Quên mật khẩu?</Link>
              </div>

              <div className="input-box">
                <span>🔒</span>

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  👁️
                </button>
              </div>
            </div>

            {error && (
              <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 14 }}>{error}</p>
            )}

            <button className="signin-btn" type="submit" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="divider">
            <span>HOẶC TIẾP TỤC VỚI</span>
          </div>

          <div className="social-buttons">
            <button type="button">Google</button>
            <button type="button">Facebook</button>
          </div>

          <p className="signup-text">
            Chưa có tài khoản? <Link to="/signup">Tạo tài khoản miễn phí</Link>
          </p>
        </div>
      </div>

      <footer>
        © 2026 Paws &amp; Vitality. Được tạo nên bằng tình yêu cho mỗi cái vẫy đuôi và tiếng gừ gừ.
      </footer>
    </div>
  );
}

export default LoginPage;
