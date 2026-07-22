import pyodbc

try:
    conn = pyodbc.connect(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=localhost\\SQLEXPRESS02;"
        "DATABASE=PetCareDB;"
        "Trusted_Connection=yes;"
    )

    print("Kết nối thành công!")
    conn.close()

except Exception as e:
    print(e)