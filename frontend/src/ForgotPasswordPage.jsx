import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Vui lòng nhập email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setStep(2);
      } else {
        setError(data.error || "Không thể xác minh email.");
      }
    } catch (err) {
      console.error("Lỗi kiểm tra email:", err);
      setError("Không thể kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Mật khẩu mới cần tối thiểu 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, new_password: newPassword }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError(data.error || "Đặt lại mật khẩu thất bại.");
      }
    } catch (err) {
      console.error("Lỗi đặt lại mật khẩu:", err);
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
              src="https://images.unsplash.com/photo-1560807707-8cc77767d783?w=500"
              alt="Mèo"
            />
          </div>

          <h2>Quên mật khẩu?</h2>

          <p>
            Đừng lo, chuyện thường thôi.
            <br />
            Xác minh email rồi đặt mật khẩu mới trong chưa đầy một phút.
          </p>
        </div>

        {/* Right Side */}
        <div className="right-panel">
          {success ? (
            <>
              <h1>Đã đặt lại mật khẩu</h1>
              <p className="subtitle">Đang chuyển đến trang đăng nhập...</p>
            </>
          ) : step === 1 ? (
            <>
              <h1>Xác minh email</h1>
              <p className="subtitle">
                Nhập email đã đăng ký, chúng tôi sẽ cho bạn đặt mật khẩu mới.
              </p>

              <form onSubmit={handleVerifyEmail}>
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

                {error && (
                  <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 14 }}>{error}</p>
                )}

                <button className="signin-btn" type="submit" disabled={loading}>
                  {loading ? "Đang kiểm tra..." : "Tiếp tục"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1>Đặt mật khẩu mới</h1>
              <p className="subtitle">
                Cho <b>{email}</b>. Chọn một mật khẩu mới dễ nhớ nhé.
              </p>

              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label>Mật khẩu mới</label>
                  <div className="input-box">
                    <span>🔒</span>
                    <input
                      type="password"
                      placeholder="Tối thiểu 6 ký tự"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Nhập lại mật khẩu mới</label>
                  <div className="input-box">
                    <span>🔒</span>
                    <input
                      type="password"
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
                  {loading ? "Đang lưu..." : "Đặt lại mật khẩu"}
                </button>
              </form>
            </>
          )}

          <p className="signup-text">
            Nhớ ra mật khẩu rồi? <Link to="/login">Quay lại đăng nhập</Link>
          </p>
        </div>
      </div>

      <footer>
        © 2026 Paws &amp; Vitality. Được tạo nên bằng tình yêu cho mỗi cái vẫy đuôi và tiếng gừ gừ.
      </footer>
    </div>
  );
}

export default ForgotPasswordPage;
