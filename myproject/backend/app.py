import os
from functools import wraps

from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import psycopg2
from psycopg2.extras import NamedTupleCursor
from datetime import datetime

app = Flask(__name__)
CORS(app)

DATABASE_URL = os.environ.get("DATABASE_URL")


def get_connection():
    if DATABASE_URL:
        # Production (Neon/Postgres cloud) — connection string đầy đủ
        return psycopg2.connect(DATABASE_URL, cursor_factory=NamedTupleCursor)

    # Local dev — Postgres chạy trên máy, cấu hình qua các biến riêng lẻ
    return psycopg2.connect(
        host=os.environ.get("DB_HOST", "localhost"),
        port=os.environ.get("DB_PORT", "5432"),
        dbname=os.environ.get("DB_NAME", "petcaredb"),
        user=os.environ.get("DB_USER", "postgres"),
        password=os.environ.get("DB_PASSWORD", "postgres"),
        cursor_factory=NamedTupleCursor,
    )


def format_birthday(birthday):
    if not birthday:
        return None

    try:
        # Nhận từ React dạng DD/MM/YYYY
        return datetime.strptime(birthday, "%d/%m/%Y").strftime("%Y-%m-%d")
    except:
        return birthday


def format_appointment_date(value):
    """Chuẩn hoá chuỗi ngày giờ về dạng TIMESTAMP mà Postgres chấp nhận
    được. React <input type=datetime-local> gửi dạng 'YYYY-MM-DDTHH:MM',
    còn giá trị đọc lại từ DB là str(datetime) 6 chữ số mili-giây
    ('YYYY-MM-DD HH:MM:SS.ffffff') — cả hai đều cần được làm sạch trước
    khi ghi lại vào DB."""
    if not value:
        return None

    for fmt in ("%Y-%m-%dT%H:%M", "%Y-%m-%d %H:%M:%S.%f", "%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S"):
        try:
            return datetime.strptime(value, fmt).strftime("%Y-%m-%d %H:%M:%S")
        except ValueError:
            continue

    return value


def get_admin_id():
    """Lấy admin_id do frontend gửi lên — query string cho GET, body JSON
    cho các phương thức còn lại."""
    if request.method == "GET":
        return request.args.get("admin_id")
    data = request.get_json(silent=True) or {}
    return data.get("admin_id")


def require_admin(view_func):
    """Chặn các endpoint chỉ dành cho admin ở phía server, không chỉ dựa
    vào việc ẩn nút trên giao diện. Frontend phải gửi kèm admin_id (id của
    người đang đăng nhập) — server tra lại role thật trong DB, không tin
    tưởng role do client tự khai."""

    @wraps(view_func)
    def wrapper(*args, **kwargs):
        admin_id = get_admin_id()
        if not admin_id:
            return jsonify({"error": "Thiếu thông tin xác thực admin"}), 401

        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT role FROM users WHERE id=%s", (admin_id,))
            row = cursor.fetchone()
            conn.close()
        except Exception as e:
            return jsonify({"error": str(e)}), 500

        if not row or row.role != "admin":
            return jsonify({"error": "Bạn không có quyền admin"}), 403

        return view_func(*args, **kwargs)

    return wrapper


@app.route("/api/message", methods=["GET"])
def message():
    return jsonify({"message": "Hello from Flask"})


@app.route("/api/register", methods=["POST"])
def register():
    try:
        data = request.json
        full_name = (data.get("full_name") or "").strip()
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""

        if not full_name or not email or not password:
            return jsonify({"error": "Vui lòng nhập đầy đủ họ tên, email và mật khẩu"}), 400

        if len(password) < 6:
            return jsonify({"error": "Mật khẩu cần tối thiểu 6 ký tự"}), 400

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            conn.close()
            return jsonify({"error": "Email này đã được đăng ký"}), 409

        password_hash = generate_password_hash(password)

        cursor.execute("""
            INSERT INTO users (full_name, email, password, role, created_at)
            VALUES (%s, %s, %s, %s, %s)
        """, (full_name, email, password_hash, "user", datetime.now()))

        conn.commit()
        conn.close()

        return jsonify({"message": "Tạo tài khoản thành công"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/login", methods=["POST"])
def login():
    try:
        data = request.json
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""

        if not email or not password:
            return jsonify({"error": "Vui lòng nhập email và mật khẩu"}), 400

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT id, full_name, email, password, role FROM users WHERE email = %s",
            (email,),
        )
        row = cursor.fetchone()
        conn.close()

        if not row or not check_password_hash(row.password, password):
            return jsonify({"error": "Email hoặc mật khẩu không đúng"}), 401

        return jsonify({
            "id": row.id,
            "full_name": row.full_name,
            "email": row.email,
            "role": row.role,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/check-email", methods=["POST"])
def check_email():
    try:
        data = request.json
        email = (data.get("email") or "").strip().lower()

        if not email:
            return jsonify({"error": "Vui lòng nhập email"}), 400

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        row = cursor.fetchone()
        conn.close()

        if not row:
            return jsonify({"error": "Email này chưa được đăng ký"}), 404

        return jsonify({"message": "OK"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/reset-password", methods=["POST"])
def reset_password():
    try:
        data = request.json
        email = (data.get("email") or "").strip().lower()
        new_password = data.get("new_password") or ""

        if not email or not new_password:
            return jsonify({"error": "Vui lòng nhập email và mật khẩu mới"}), 400

        if len(new_password) < 6:
            return jsonify({"error": "Mật khẩu cần tối thiểu 6 ký tự"}), 400

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({"error": "Email này chưa được đăng ký"}), 404

        password_hash = generate_password_hash(new_password)
        cursor.execute("UPDATE users SET password = %s WHERE email = %s", (password_hash, email))

        conn.commit()
        conn.close()

        return jsonify({"message": "Đặt lại mật khẩu thành công"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/pets", methods=["GET"])
def get_pets():
    try:
        user_id = request.args.get("user_id")

        conn = get_connection()
        cursor = conn.cursor()

        if user_id:
            cursor.execute("""
                SELECT id, user_id, name, type, breed, birthday, weight, photo
                FROM pets
                WHERE user_id = %s
            """, (user_id,))
        else:
            cursor.execute("""
                SELECT id, user_id, name, type, breed, birthday, weight, photo
                FROM pets
            """)

        pets = []

        for row in cursor.fetchall():
            pets.append({
                "id": row.id,
                "user_id": row.user_id,
                "name": row.name,
                "type": row.type,
                "breed": row.breed,
                "birthday": str(row.birthday) if row.birthday else None,
                "weight": float(row.weight) if row.weight else None,
                "photo": row.photo
            })

        conn.close()
        return jsonify(pets)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/pets", methods=["POST"])
def add_pet():
    try:
        data = request.json

        user_id = data.get("user_id") or 1
        name = data.get("name")
        pet_type = data.get("type")
        breed = data.get("breed")
        birthday = format_birthday(data.get("birthday"))
        weight = data.get("weight")
        photo = data.get("photo")

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO pets (user_id, name, type, breed, birthday, weight, photo)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            user_id,
            name,
            pet_type,
            breed,
            birthday,
            weight,
            photo
        ))

        new_id = cursor.fetchone()[0]
        conn.commit()
        conn.close()

        return jsonify({"message": "Thêm thú cưng thành công", "id": new_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/pets/<int:pet_id>", methods=["PUT"])
def update_pet(pet_id):
    try:
        data = request.json

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE pets
            SET name=%s, type=%s, breed=%s, birthday=%s, weight=%s, photo=%s
            WHERE id=%s
        """, (
            data.get("name"),
            data.get("type"),
            data.get("breed"),
            format_birthday(data.get("birthday")),
            data.get("weight"),
            data.get("photo"),
            pet_id
        ))

        conn.commit()
        conn.close()

        return jsonify({"message": "Cập nhật thú cưng thành công"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/pets/<int:pet_id>", methods=["DELETE"])
def delete_pet(pet_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Các bảng liên quan không có ON DELETE CASCADE trong DB, nên phải
        # tự xóa dữ liệu con trước để tránh lỗi ràng buộc khóa ngoại.
        cursor.execute("DELETE FROM health_logs WHERE pet_id=%s", (pet_id,))
        cursor.execute("DELETE FROM vaccinations WHERE pet_id=%s", (pet_id,))
        cursor.execute("DELETE FROM medical_records WHERE pet_id=%s", (pet_id,))
        cursor.execute("DELETE FROM appointments WHERE pet_id=%s", (pet_id,))
        cursor.execute("DELETE FROM pets WHERE id=%s", (pet_id,))

        conn.commit()
        conn.close()

        return jsonify({"message": "Xóa thú cưng thành công"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/vaccinations", methods=["GET"])
def get_vaccinations():
    pet_id = request.args.get("pet_id")
    user_id = request.args.get("user_id")

    conn = get_connection()
    cursor = conn.cursor()

    if pet_id:
        cursor.execute("""
            SELECT id, pet_id, vaccine_name, due_date, administered_date, status, note
            FROM vaccinations
            WHERE pet_id = %s
        """, (pet_id,))
    elif user_id:
        cursor.execute("""
            SELECT v.id, v.pet_id, v.vaccine_name, v.due_date, v.administered_date, v.status, v.note
            FROM vaccinations v
            JOIN pets p ON v.pet_id = p.id
            WHERE p.user_id = %s
        """, (user_id,))
    else:
        cursor.execute("""
            SELECT id, pet_id, vaccine_name, due_date, administered_date, status, note
            FROM vaccinations
        """)

    data = []
    for row in cursor.fetchall():
        data.append({
            "id": row.id,
            "pet_id": row.pet_id,
            "vaccine_name": row.vaccine_name,
            "due_date": str(row.due_date),
            "administered_date": str(row.administered_date) if row.administered_date else None,
            "status": row.status,
            "note": row.note
        })

    conn.close()
    return jsonify(data)

@app.route("/api/vaccinations", methods=["POST"])
def add_vaccination():
    data = request.json

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO vaccinations (pet_id, vaccine_name, due_date, administered_date, status, note)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id
    """, (
        data.get("pet_id"),
        data.get("vaccine_name"),
        data.get("due_date"),
        data.get("administered_date"),
        data.get("status") or "Upcoming",
        data.get("note")
    ))

    new_id = cursor.fetchone()[0]
    conn.commit()
    conn.close()

    return jsonify({"message": "Thêm lịch tiêm thành công", "id": new_id}), 201


@app.route("/api/vaccinations/<int:vaccination_id>", methods=["PUT"])
def update_vaccination(vaccination_id):
    try:
        data = request.json

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE vaccinations
            SET vaccine_name=%s, due_date=%s, administered_date=%s, status=%s, note=%s
            WHERE id=%s
        """, (
            data.get("vaccine_name"),
            data.get("due_date"),
            data.get("administered_date"),
            data.get("status"),
            data.get("note"),
            vaccination_id
        ))

        conn.commit()
        conn.close()

        return jsonify({"message": "Cập nhật lịch tiêm thành công"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/vaccinations/<int:vaccination_id>", methods=["DELETE"])
def delete_vaccination(vaccination_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM vaccinations WHERE id=%s", (vaccination_id,))

        conn.commit()
        conn.close()

        return jsonify({"message": "Xóa lịch tiêm thành công"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/health-logs", methods=["GET"])
def get_health_logs():
    try:
        pet_id = request.args.get("pet_id")
        user_id = request.args.get("user_id")

        conn = get_connection()
        cursor = conn.cursor()

        if pet_id:
            cursor.execute("""
                SELECT id, pet_id, log_date, weight, activity_steps, meal, mood, symptoms
                FROM health_logs
                WHERE pet_id = %s
                ORDER BY log_date DESC, id DESC
            """, (pet_id,))
        elif user_id:
            cursor.execute("""
                SELECT h.id, h.pet_id, h.log_date, h.weight, h.activity_steps, h.meal, h.mood, h.symptoms
                FROM health_logs h
                JOIN pets p ON h.pet_id = p.id
                WHERE p.user_id = %s
                ORDER BY h.log_date DESC, h.id DESC
            """, (user_id,))
        else:
            cursor.execute("""
                SELECT id, pet_id, log_date, weight, activity_steps, meal, mood, symptoms
                FROM health_logs
                ORDER BY log_date DESC, id DESC
            """)

        logs = []
        for row in cursor.fetchall():
            logs.append({
                "id": row.id,
                "pet_id": row.pet_id,
                "log_date": str(row.log_date) if row.log_date else None,
                "weight": float(row.weight) if row.weight else None,
                "activity_steps": row.activity_steps,
                "meal": row.meal,
                "mood": row.mood,
                "symptoms": row.symptoms
            })

        conn.close()
        return jsonify(logs)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/health-logs", methods=["POST"])
def add_health_log():
    try:
        data = request.json

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO health_logs (pet_id, log_date, weight, activity_steps, meal, mood, symptoms)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            data.get("pet_id"),
            data.get("log_date") or datetime.now().strftime("%Y-%m-%d"),
            data.get("weight"),
            data.get("activity_steps"),
            data.get("meal"),
            data.get("mood"),
            data.get("symptoms")
        ))

        conn.commit()
        conn.close()

        return jsonify({"message": "Thêm nhật ký sức khỏe thành công"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/health-logs/<int:log_id>", methods=["PUT"])
def update_health_log(log_id):
    try:
        data = request.json

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE health_logs
            SET log_date=%s, weight=%s, activity_steps=%s, meal=%s, mood=%s, symptoms=%s
            WHERE id=%s
        """, (
            data.get("log_date"),
            data.get("weight"),
            data.get("activity_steps"),
            data.get("meal"),
            data.get("mood"),
            data.get("symptoms"),
            log_id
        ))

        conn.commit()
        conn.close()

        return jsonify({"message": "Cập nhật nhật ký sức khỏe thành công"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/health-logs/<int:log_id>", methods=["DELETE"])
def delete_health_log(log_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM health_logs WHERE id=%s", (log_id,))

        conn.commit()
        conn.close()

        return jsonify({"message": "Xóa nhật ký thành công"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/admin/stats", methods=["GET"])
@require_admin
def admin_stats():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM users")
        total_users = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM pets")
        total_pets = cursor.fetchone()[0]

        cursor.execute("""
            SELECT COUNT(*) FROM appointments
            WHERE CAST(appointment_date AS DATE) = CURRENT_DATE
        """)
        today_appointments = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM medical_records WHERE status='Pending'")
        pending_records = cursor.fetchone()[0]

        conn.close()

        return jsonify({
            "total_users": total_users,
            "total_pets": total_pets,
            "today_appointments": today_appointments,
            "pending_records": pending_records,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/users", methods=["GET"])
@require_admin
def get_users():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT u.id, u.full_name, u.email, u.role, u.created_at,
                   (SELECT COUNT(*) FROM pets p WHERE p.user_id = u.id) AS pet_count
            FROM users u
            ORDER BY u.created_at DESC
        """)

        users = []
        for row in cursor.fetchall():
            users.append({
                "id": row.id,
                "full_name": row.full_name,
                "email": row.email,
                "role": row.role,
                "created_at": str(row.created_at) if row.created_at else None,
                "pet_count": row.pet_count,
            })

        conn.close()
        return jsonify(users)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/users/<int:user_id>/role", methods=["PATCH"])
@require_admin
def update_user_role(user_id):
    try:
        data = request.json
        role = data.get("role")

        if role not in ("user", "admin"):
            return jsonify({"error": "Vai trò không hợp lệ"}), 400

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET role=%s WHERE id=%s", (role, user_id))
        conn.commit()
        conn.close()

        return jsonify({"message": "Cập nhật vai trò thành công"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/appointments", methods=["GET"])
@require_admin
def get_appointments():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT a.id, a.pet_id, a.title, a.appointment_date, a.location, a.note, a.status,
                   p.name AS pet_name, p.type AS pet_type, u.full_name AS owner_name
            FROM appointments a
            LEFT JOIN pets p ON a.pet_id = p.id
            LEFT JOIN users u ON p.user_id = u.id
            ORDER BY a.appointment_date ASC
        """)

        appointments = []
        for row in cursor.fetchall():
            appointments.append({
                "id": row.id,
                "pet_id": row.pet_id,
                "title": row.title,
                "appointment_date": row.appointment_date.strftime("%Y-%m-%d %H:%M:%S") if row.appointment_date else None,
                "location": row.location,
                "note": row.note,
                "status": row.status,
                "pet_name": row.pet_name,
                "pet_type": row.pet_type,
                "owner_name": row.owner_name,
            })

        conn.close()
        return jsonify(appointments)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/appointments", methods=["POST"])
def add_appointment():
    try:
        data = request.json

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO appointments (pet_id, title, appointment_date, location, note, status)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            data.get("pet_id"),
            data.get("title"),
            format_appointment_date(data.get("appointment_date")),
            data.get("location"),
            data.get("note"),
            data.get("status") or "Requested",
        ))

        new_id = cursor.fetchone()[0]
        conn.commit()
        conn.close()

        return jsonify({"message": "Đặt lịch hẹn thành công", "id": new_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/appointments/<int:appointment_id>", methods=["PUT"])
@require_admin
def update_appointment(appointment_id):
    try:
        data = request.json

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE appointments
            SET title=%s, appointment_date=%s, location=%s, note=%s, status=%s
            WHERE id=%s
        """, (
            data.get("title"),
            format_appointment_date(data.get("appointment_date")),
            data.get("location"),
            data.get("note"),
            data.get("status"),
            appointment_id,
        ))

        conn.commit()
        conn.close()

        return jsonify({"message": "Cập nhật lịch hẹn thành công"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/appointments/<int:appointment_id>", methods=["DELETE"])
def delete_appointment(appointment_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM appointments WHERE id=%s", (appointment_id,))

        conn.commit()
        conn.close()

        return jsonify({"message": "Hủy lịch hẹn thành công"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/my-appointments", methods=["GET"])
def get_my_appointments():
    """Lịch hẹn của chính người dùng đang đăng nhập — lọc theo user_id qua
    bảng pets, không cần quyền admin vì chỉ trả về dữ liệu của chính họ."""
    try:
        user_id = request.args.get("user_id")
        if not user_id:
            return jsonify({"error": "Thiếu user_id"}), 400

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT a.id, a.pet_id, a.title, a.appointment_date, a.location, a.note, a.status,
                   p.name AS pet_name, p.type AS pet_type
            FROM appointments a
            JOIN pets p ON a.pet_id = p.id
            WHERE p.user_id = %s
            ORDER BY a.appointment_date ASC
        """, (user_id,))

        appointments = []
        for row in cursor.fetchall():
            appointments.append({
                "id": row.id,
                "pet_id": row.pet_id,
                "title": row.title,
                "appointment_date": row.appointment_date.strftime("%Y-%m-%d %H:%M:%S") if row.appointment_date else None,
                "location": row.location,
                "note": row.note,
                "status": row.status,
                "pet_name": row.pet_name,
                "pet_type": row.pet_type,
            })

        conn.close()
        return jsonify(appointments)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/medical-records", methods=["GET"])
@require_admin
def get_medical_records():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT m.id, m.pet_id, m.title, m.record_date, m.description, m.file_url, m.status,
                   p.name AS pet_name, p.type AS pet_type, p.breed AS pet_breed, p.photo AS pet_photo,
                   u.full_name AS owner_name
            FROM medical_records m
            LEFT JOIN pets p ON m.pet_id = p.id
            LEFT JOIN users u ON p.user_id = u.id
            ORDER BY
                CASE WHEN m.status = 'Pending' THEN 0 ELSE 1 END,
                m.record_date DESC
        """)

        records = []
        for row in cursor.fetchall():
            records.append({
                "id": row.id,
                "pet_id": row.pet_id,
                "title": row.title,
                "record_date": str(row.record_date) if row.record_date else None,
                "description": row.description,
                "file_url": row.file_url,
                "status": row.status,
                "pet_name": row.pet_name,
                "pet_type": row.pet_type,
                "pet_breed": row.pet_breed,
                "pet_photo": row.pet_photo,
                "owner_name": row.owner_name,
            })

        conn.close()
        return jsonify(records)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/medical-records", methods=["POST"])
@require_admin
def add_medical_record():
    try:
        data = request.json

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO medical_records (pet_id, title, record_date, description, file_url, status)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            data.get("pet_id"),
            data.get("title"),
            data.get("record_date"),
            data.get("description"),
            data.get("file_url"),
            data.get("status") or "Pending",
        ))

        new_id = cursor.fetchone()[0]
        conn.commit()
        conn.close()

        return jsonify({"message": "Thêm hồ sơ thành công", "id": new_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/medical-records/<int:record_id>", methods=["PUT"])
@require_admin
def update_medical_record(record_id):
    try:
        data = request.json

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE medical_records
            SET status=%s
            WHERE id=%s
        """, (
            data.get("status"),
            record_id,
        ))

        conn.commit()
        conn.close()

        return jsonify({"message": "Cập nhật hồ sơ thành công"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "1") == "1"
    app.run(host="0.0.0.0", port=port, debug=debug)
