# Manual Deployment Steps for Quiz App on AWS

## Prerequisites
- AWS Free Tier account
- IAM user with EC2, RDS, and CloudWatch permissions
- Basic understanding of AWS services

## Step 1: Create Key Pair
1. Go to EC2 Console → Key Pairs
2. Create key pair named `quiz-app-key`
3. Download and save the `.pem` file securely

## Step 2: Launch EC2 Instance
1. Launch instance with following settings:
   - **Name**: `quiz-app-server`
   - **AMI**: Amazon Linux 2023 AMI
   - **Instance Type**: `t3.micro` (Free Tier)
   - **Key Pair**: `quiz-app-key`
   - **Security Group**: Create new `quiz-app-sg`
     - SSH (22) - Your IP
     - HTTP (80) - Anywhere
     - HTTPS (443) - Anywhere
     - Custom TCP (5000) - Anywhere

## Step 3: Create RDS Database
1. Go to RDS Console → Create Database
2. Configuration:
   - **Engine**: MySQL
   - **Template**: Free Tier
   - **DB Identifier**: `quiz-app-db`
   - **Master Username**: `admin`
   - **Master Password**: [Set strong password]
   - **Instance Class**: `db.t3.micro`
   - **Public Access**: Yes
   - **Security Group**: Create new `quiz-db-sg`
   - **Initial Database**: `quiz_app`

## Step 4: Configure Security Groups
1. Edit RDS security group `quiz-db-sg`:
   - Add inbound rule: MySQL/Aurora (3306) from `quiz-app-sg`
   - Add inbound rule: MySQL/Aurora (3306) from your IP

## Step 5: Connect to EC2 Instance
### Using PuTTY (Windows):
1. Convert `.pem` to `.ppk` using PuTTYgen
2. Connect using:
   - Host: `ec2-user@[EC2-PUBLIC-DNS]`
   - Port: 22
   - Private Key: `quiz-app-key.ppk`

### Using SSH (Linux/Mac):
```bash
ssh -i quiz-app-key.pem ec2-user@[EC2-PUBLIC-DNS]
```

## Step 6: Install Dependencies on EC2
```bash
# Update system
sudo yum update -y

# Install required packages
sudo yum install python3 python3-pip mariadb105 git -y

# Verify installations
python3 --version
pip3 --version
mysql --version
```

## Step 7: Deploy Application
```bash
# Create app directory
mkdir ~/quiz-app
cd ~/quiz-app

# Upload your application files (app.py, requirements.txt, templates/, static/, schema.sql)
# You can use SCP, SFTP, or create files manually using nano

# Install Python dependencies
pip3 install -r requirements.txt
```

## Step 8: Configure Database
```bash
# Set environment variables
export DB_HOST=[YOUR-RDS-ENDPOINT]
export DB_USER=admin
export DB_PASSWORD=[YOUR-RDS-PASSWORD]
export DB_NAME=quiz_app

# Create database and tables
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "CREATE DATABASE IF NOT EXISTS quiz_app;"
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD quiz_app < schema.sql
```

## Step 9: Create Systemd Service
```bash
sudo nano /etc/systemd/system/quiz-app.service
```

Add this content:
```ini
[Unit]
Description=Quiz App Flask Application
After=network.target

[Service]
User=ec2-user
WorkingDirectory=/home/ec2-user/quiz-app
Environment=DB_HOST=[YOUR-RDS-ENDPOINT]
Environment=DB_USER=admin
Environment=DB_PASSWORD=[YOUR-RDS-PASSWORD]
Environment=DB_NAME=quiz_app
ExecStart=/usr/bin/python3 app.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable quiz-app.service
sudo systemctl start quiz-app.service
sudo systemctl status quiz-app.service
```

## Step 10: Configure Monitoring
1. Go to CloudWatch Console
2. Create alarms:
   - **EC2 CPU Alarm**: CPUUtilization > 80%
   - **RDS CPU Alarm**: CPUUtilization > 80%

## Step 11: Configure Backup
1. Go to RDS Console → Your Database → Modify
2. Set backup retention to 7 days
3. Apply changes immediately

## Step 12: Test Deployment
1. Access application: `http://[EC2-PUBLIC-DNS]:5000`
2. Test user registration and login
3. Test quiz functionality
4. Test Excel upload feature

## Troubleshooting
- Check service logs: `sudo journalctl -u quiz-app.service -f`
- Check database connection: `mysql -h [RDS-ENDPOINT] -u admin -p`
- Verify security groups allow required ports
- Ensure environment variables are set correctly

## Important Notes
- Replace all placeholder values with actual values
- Keep RDS password secure
- Monitor AWS costs to stay within free tier limits
- Regularly backup your application code