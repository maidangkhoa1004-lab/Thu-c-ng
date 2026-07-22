-- Ghi chú: bảng health_logs đã tồn tại sẵn trong PetCareDB với các cột
-- (id, pet_id, weight, activity_steps, symptoms, log_date). Script này chỉ
-- bổ sung 2 cột còn thiếu để phục vụ tính năng "Nhật ký sức khỏe / ăn uống"
-- (đã được chạy trực tiếp trên máy dev — chỉ giữ lại đây để tham khảo / cho
-- các máy khác chưa có 2 cột này).

IF NOT EXISTS (
    SELECT * FROM sys.tables WHERE name = 'health_logs'
)
BEGIN
    CREATE TABLE health_logs (
        id INT IDENTITY(1,1) PRIMARY KEY,
        pet_id INT NULL,
        log_date DATE NULL,
        weight DECIMAL(5,2) NULL,
        activity_steps INT NULL,
        symptoms NVARCHAR(MAX) NULL,
        CONSTRAINT FK_health_logs_pets FOREIGN KEY (pet_id)
            REFERENCES pets(id) ON DELETE CASCADE
    );
END

IF NOT EXISTS (
    SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('health_logs') AND name = 'meal'
)
    ALTER TABLE health_logs ADD meal NVARCHAR(255) NULL;

IF NOT EXISTS (
    SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('health_logs') AND name = 'mood'
)
    ALTER TABLE health_logs ADD mood NVARCHAR(20) NULL;
