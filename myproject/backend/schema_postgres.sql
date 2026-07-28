-- Schema PostgreSQL cho Paws & Vitality (dùng cho Neon hoặc Postgres bất kỳ).
-- Chạy toàn bộ file này 1 lần trên database mới trước khi deploy backend.

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pets (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(30),
    breed VARCHAR(100),
    birthday DATE,
    weight NUMERIC(5,2),
    photo VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS vaccinations (
    id SERIAL PRIMARY KEY,
    pet_id INT REFERENCES pets(id),
    vaccine_name VARCHAR(150) NOT NULL,
    due_date DATE,
    administered_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'Upcoming',
    note VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS health_logs (
    id SERIAL PRIMARY KEY,
    pet_id INT REFERENCES pets(id),
    log_date DATE,
    weight NUMERIC(5,2),
    activity_steps INT,
    meal VARCHAR(255),
    mood VARCHAR(20),
    symptoms VARCHAR(1000)
);

CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    pet_id INT REFERENCES pets(id),
    title VARCHAR(150),
    appointment_date TIMESTAMP,
    location VARCHAR(150),
    note VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'Requested'
);

CREATE TABLE IF NOT EXISTS medical_records (
    id SERIAL PRIMARY KEY,
    pet_id INT REFERENCES pets(id),
    admin_id INT REFERENCES users(id),
    title VARCHAR(150),
    record_date DATE,
    description VARCHAR(1000),
    file_url VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'Pending'
);

CREATE INDEX IF NOT EXISTS idx_pets_user_id ON pets(user_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_pet_id ON vaccinations(pet_id);
CREATE INDEX IF NOT EXISTS idx_health_logs_pet_id ON health_logs(pet_id);
CREATE INDEX IF NOT EXISTS idx_appointments_pet_id ON appointments(pet_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_pet_id ON medical_records(pet_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
