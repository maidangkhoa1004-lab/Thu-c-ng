from flask import Flask, jsonify  # Thêm jsonify cho an toàn
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/api/message")  # Kiểm tra đường dẫn đúng là /api/message
def message():
    return jsonify({"message": "Hello from Flask"})  # Dùng jsonify

app.run(debug=True)