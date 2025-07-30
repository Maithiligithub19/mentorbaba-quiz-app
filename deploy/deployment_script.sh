#!/bin/bash

# Quiz App AWS Deployment Script
# Run this script on EC2 instance after initial setup

echo "Starting Quiz App Deployment..."

# Update system
echo "Updating system packages..."
sudo yum update -y

# Install required packages
echo "Installing Python, MySQL client, and Git..."
sudo yum install python3 python3-pip mariadb105 git -y

# Create application directory
echo "Creating application directory..."
mkdir -p ~/quiz-app
cd ~/quiz-app

# Set environment variables (replace with your actual values)
echo "Setting environment variables..."
export DB_HOST=quiz-app-db.cuxqgu8w4uxp.us-east-1.rds.amazonaws.com
export DB_USER=admin
export DB_PASSWORD=YOUR_RDS_PASSWORD
export DB_NAME=quiz_app

# Install Python dependencies
echo "Installing Python dependencies..."
pip3 install -r requirements.txt

# Create database tables
echo "Creating database tables..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "
CREATE TABLE IF NOT EXISTS users (
id INT AUTO_INCREMENT PRIMARY KEY,
email VARCHAR(255) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL,
registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
id INT AUTO_INCREMENT PRIMARY KEY,
question TEXT NOT NULL,
option_a VARCHAR(255) NOT NULL,
option_b VARCHAR(255) NOT NULL,
option_c VARCHAR(255) NOT NULL,
option_d VARCHAR(255) NOT NULL,
correct_ans CHAR(1) NOT NULL
);

CREATE TABLE IF NOT EXISTS answers (
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT,
question_id INT,
selected_option CHAR(1),
is_correct BOOLEAN,
answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);"

# Create systemd service
echo "Creating systemd service..."
sudo tee /etc/systemd/system/quiz-app.service > /dev/null <<EOF
[Unit]
Description=Quiz App Flask Application
After=network.target

[Service]
User=ec2-user
WorkingDirectory=/home/ec2-user/quiz-app
Environment=DB_HOST=$DB_HOST
Environment=DB_USER=$DB_USER
Environment=DB_PASSWORD=$DB_PASSWORD
Environment=DB_NAME=$DB_NAME
ExecStart=/usr/bin/python3 app.py
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
echo "Enabling and starting service..."
sudo systemctl daemon-reload
sudo systemctl enable quiz-app.service
sudo systemctl start quiz-app.service

# Check service status
echo "Checking service status..."
sudo systemctl status quiz-app.service

echo "Deployment completed!"
echo "Access your app at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-hostname):5000"