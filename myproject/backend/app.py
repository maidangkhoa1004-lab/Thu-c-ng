from flask import Flask, request, jsonify
from flask_cors import CORS
import pyodbc
from datetime import datetime

app = Flask(__name__)
CORS(app)


def get_connection():
    return pyodbc.connect(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=localhost\\SQLEXPRESS02;"
        "DATABASE=PetCareDB;"
        "Trusted_Connection=yes;"
    )


def format_birthday(birthday):
    if not birthday:
        return None

    try:
        # Nhận từ React dạng DD/MM/YYYY
        return datetime.strptime(birthday, "%d/%m/%Y").strftime("%Y-%m-%d")
    except:
        return birthday


@app.route("/api/message", methods=["GET"])
def message():
    return jsonify({"message": "Hello from Flask"})


@app.route("/api/pets", methods=["GET"])
def get_pets():
    try:
        conn = get_connection()
        cursor = conn.cursor()

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
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            name,
            pet_type,
            breed,
            birthday,
            weight,
            photo
        ))

        conn.commit()
        conn.close()

        return jsonify({"message": "Thêm thú cưng thành công"}), 201

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
            SET name=?, type=?, breed=?, birthday=?, weight=?, photo=?
            WHERE id=?
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

        cursor.execute("DELETE FROM pets WHERE id=?", (pet_id,))

        conn.commit()
        conn.close()

        return jsonify({"message": "Xóa thú cưng thành công"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)

@app.route("/api/vaccinations", methods=["GET"])
def get_vaccinations():
    conn = get_connection()
    cursor = conn.cursor()

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
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        data.get("pet_id"),
        data.get("vaccine_name"),
        data.get("due_date"),
        data.get("administered_date"),
        data.get("status"),
        data.get("note")
    ))

    conn.commit()
    conn.close()

    return jsonify({"message": "Thêm lịch tiêm thành công"}), 201