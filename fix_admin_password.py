from werkzeug.security import generate_password_hash
import mysql.connector

# Generate hashed password for admin123
hashed_password = generate_password_hash('admin123')
print(f"Hashed password: {hashed_password}")

# Update database
conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='Mihir@197',
    database='quiz_app'
)
cursor = conn.cursor()
cursor.execute("UPDATE users SET password = %s WHERE email = 'admin@g.com'", (hashed_password,))
conn.commit()
cursor.close()
conn.close()
print("Admin password updated successfully!")