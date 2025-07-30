CREATE DATABASE IF NOT EXISTS quiz_app;

USE quiz_app;

-- Users table
CREATE TABLE users (
id INT AUTO_INCREMENT PRIMARY KEY,
email VARCHAR(255) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL,
registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions table
CREATE TABLE questions (
id INT AUTO_INCREMENT PRIMARY KEY,
question TEXT NOT NULL,
option_a VARCHAR(255) NOT NULL,
option_b VARCHAR(255) NOT NULL,
option_c VARCHAR(255) NOT NULL,
option_d VARCHAR(255) NOT NULL,
correct_ans CHAR(1) NOT NULL -- 'A', 'B', 'C', or 'D'
);

-- User answers table
CREATE TABLE answers (
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT,
question_id INT,
selected_option CHAR(1),
is_correct BOOLEAN,
answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id),
FOREIGN KEY (question_id) REFERENCES questions(id)
);