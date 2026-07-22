import { Link } from "react-router-dom";
import "./Landing.css";

function LandingPage() {
  return (
    <div className="lp-page">
      <nav className="lp-nav">
        <div className="lp-logo">
          🐾 <span>Paws &amp; Vitality</span>
        </div>

        <div className="lp-nav-links">
          <a href="#home">Trang chủ</a>
          <a href="#how">Dịch vụ</a>
          <a href="#features">Tính năng</a>
          <a href="#about">Giới thiệu</a>
        </div>

        <div className="lp-nav-actions">
          <Link to="/login" className="lp-btn-ghost">
            Đăng nhập
          </Link>
          <Link to="/signup" className="lp-btn-primary">
            Tạo tài khoản
          </Link>
        </div>
      </nav>

      <header className="lp-hero" id="home">
        <div className="lp-hero-text">
          <span className="lp-badge">🐾 Được hàng ngàn chủ nuôi tin dùng</span>
          <h1>
            Chăm sóc an tâm cho <span className="lp-accent">người bạn lông xù</span> của bạn
          </h1>
          <p>
            Quản lý hồ sơ thú cưng, lịch tiêm chủng và nhật ký sức khỏe / ăn uống chỉ
            trong một nơi duy nhất — đơn giản, tự động và đầy yêu thương.
          </p>
          <div className="lp-hero-actions">
            <Link to="/login" className="lp-btn-primary lp-btn-lg">
              📅 Đặt lịch ngay
            </Link>
            <a href="#how" className="lp-btn-ghost lp-btn-lg">
              Xem cách hoạt động
            </a>
          </div>
        </div>

        <div className="lp-hero-media">
          <img
            src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=700"
            alt="Chó đang được chăm sóc"
          />
          <div className="lp-float-card">
            <span className="lp-float-dot" />
            <div>
              <b>Lịch hôm nay</b>
              <p>2:30 PM · Tiêm phòng dại</p>
            </div>
          </div>
        </div>
      </header>

      <section className="lp-how" id="how">
        <span className="lp-eyebrow">QUY TRÌNH ĐƠN GIẢN</span>
        <h2>Cách thức hoạt động</h2>

        <div className="lp-steps">
          <div className="lp-step">
            <span className="lp-step-num">1</span>
            <h3>Chọn thú cưng</h3>
            <p>Tạo hồ sơ chi tiết cho từng bé thú cưng của bạn.</p>
          </div>

          <div className="lp-step">
            <span className="lp-step-num">2</span>
            <h3>Chọn dịch vụ &amp; bác sĩ</h3>
            <p>Đặt khám, tiêm phòng hoặc ghi nhật ký sức khỏe.</p>
          </div>

          <div className="lp-step">
            <span className="lp-step-num">3</span>
            <h3>Chọn thời gian</h3>
            <p>Xác nhận lịch hẹn chỉ trong vài giây.</p>
          </div>
        </div>
      </section>

      <section className="lp-features" id="features">
        <div className="lp-feature-card">
          <span className="lp-feature-icon">🩺</span>
          <h3>Bác sĩ có chứng chỉ</h3>
          <p>Đội ngũ thú y giàu kinh nghiệm, tận tâm với từng thú cưng.</p>
        </div>

        <div className="lp-feature-card">
          <span className="lp-feature-icon">🔔</span>
          <h3>Nhắc lịch tự động</h3>
          <p>Tự động nhắc lịch tiêm chủng, không bao giờ bỏ lỡ mũi tiêm.</p>
        </div>

        <div className="lp-feature-card">
          <span className="lp-feature-icon">📋</span>
          <h3>Hồ sơ sức khỏe</h3>
          <p>Lưu trữ đầy đủ lịch sử khám, tiêm chủng và cân nặng.</p>
        </div>

        <div className="lp-feature-card">
          <span className="lp-feature-icon">💬</span>
          <h3>Hỗ trợ 24/7</h3>
          <p>Luôn sẵn sàng khi bạn cần tư vấn khẩn cấp.</p>
        </div>
      </section>

      <section className="lp-split" id="about">
        <div className="lp-split-media">
          <img
            src="https://images.unsplash.com/photo-1544568100-847a948585b9?w=700"
            alt="Bác sĩ thú y đang khám cho mèo"
          />
        </div>

        <div className="lp-split-text">
          <span className="lp-eyebrow">CHĂM SÓC TOÀN DIỆN</span>
          <h2>Chăm sóc vượt ra ngoài phòng khám</h2>
          <p>
            Paws &amp; Vitality đồng hành cùng bạn mỗi ngày, không chỉ trong những lần
            đến phòng khám.
          </p>

          <ul className="lp-checklist">
            <li>
              <span>✔</span> Nhắc lịch tiêm chủng tự động
            </li>
            <li>
              <span>✔</span> Nhật ký sức khỏe &amp; ăn uống hằng ngày
            </li>
            <li>
              <span>✔</span> Theo dõi cân nặng &amp; hồ sơ thú cưng đầy đủ
            </li>
          </ul>
        </div>
      </section>

      <section className="lp-cta">
        <h2>Bắt đầu nuôi dưỡng tình yêu thương hôm nay</h2>
        <p>
          Tham gia cùng cộng đồng chủ nuôi đang chăm sóc thú cưng thông minh hơn mỗi ngày.
        </p>
        <div className="lp-cta-actions">
          <Link to="/signup" className="lp-btn-primary lp-btn-lg">
            Tạo tài khoản miễn phí
          </Link>
          <a href="#features" className="lp-btn-outline lp-btn-lg">
            Xem tính năng
          </a>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-logo">
          🐾 <span>Paws &amp; Vitality</span>
        </div>
        <p>© 2026 Paws &amp; Vitality. Nuôi dưỡng sự gắn kết.</p>
        <div className="lp-footer-links">
          <a href="#home">Điều khoản</a>
          <a href="#home">Bảo mật</a>
          <a href="#home">Liên hệ</a>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
