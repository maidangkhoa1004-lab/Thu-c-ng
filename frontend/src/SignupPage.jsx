import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu cần tối thiểu 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 1200);
      } else {
        setError(data.error || "Tạo tài khoản thất bại. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Lỗi tạo tài khoản:", err);
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
              src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500"
              alt="Mèo và chó"
            />
          </div>

          <h2>Gia nhập cộng đồng</h2>

          <p>
            Tạo hồ sơ miễn phí để bắt đầu quản lý sức khỏe,
            <br />
            lịch tiêm chủng và nhật ký ăn uống cho thú cưng của bạn.
          </p>
        </div>

        {/* Right Side */}
        <div className="right-panel">
          <h1>Tạo tài khoản</h1>

          <p className="subtitle">
            Chỉ mất chưa đầy một phút để bắt đầu chăm sóc thú cưng thông minh hơn.
          </p>

          {success ? (
            <p style={{ color: "#18a64a", fontWeight: "bold" }}>
              ✅ Tạo tài khoản thành công! Đang chuyển đến trang đăng nhập...
            </p>
          ) : (
            <form onSubmit={handleSignUp}>
              <div className="form-group">
                <label>Họ và tên</label>
                <div className="input-box">
                  <span>🧑</span>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

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
                <label>Mật khẩu</label>
                <div className="input-box">
                  <span>🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Tối thiểu 6 ký tự"
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

              <div className="form-group">
                <label>Nhập lại mật khẩu</label>
                <div className="input-box">
                  <span>🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 14 }}>{error}</p>
              )}

              <button className="signin-btn" type="submit" disabled={loading}>
                {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
              </button>
            </form>
          )}

          <p className="signup-text">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </div>
      </div>

      <footer>
        © 2026 Paws &amp; Vitality. Được tạo nên bằng tình yêu cho mỗi cái vẫy đuôi và tiếng gừ gừ.
      </footer>
    </div>
  );
}

export default SignupPage;
