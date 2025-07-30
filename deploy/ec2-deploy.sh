#!/bin/bash

# EC2 Deployment Script for MentorBaba Quiz App
# This script deploys the application to AWS EC2 instances

set -e

echo "=== MentorBaba Quiz App - EC2 Deployment ==="

# Configuration - Update these values
ECR_REPOSITORY="854164149642.dkr.ecr.us-east-1.amazonaws.com/mentorbaba-quiz"
EC2_HOST="ec2-user@YOUR_EC2_IP"
KEY_PATH="./mentorbaba-key.pem"
REGION="us-east-1"

# Login to ECR
echo "Logging into ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_REPOSITORY

# Build and tag image
echo "Building and tagging Docker image..."
docker build -t mentorbaba-quiz .
docker tag mentorbaba-quiz:latest $ECR_REPOSITORY:latest

# Push to ECR
echo "Pushing image to ECR..."
docker push $ECR_REPOSITORY:latest

# Deploy to EC2
echo "Deploying to EC2..."
ssh -i $KEY_PATH $EC2_HOST << 'EOF'
  # Install Docker if not present
  sudo yum update -y
  sudo yum install docker -y
  sudo service docker start
  sudo usermod -a -G docker ec2-user
  
  # Login to ECR
  aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 854164149642.dkr.ecr.us-east-1.amazonaws.com
  
  # Pull and run latest image
  docker pull 854164149642.dkr.ecr.us-east-1.amazonaws.com/mentorbaba-quiz:latest
  docker stop mentorbaba-app 2>/dev/null || true
  docker rm mentorbaba-app 2>/dev/null || true
  docker run -d --name mentorbaba-app -p 5000:5000 854164149642.dkr.ecr.us-east-1.amazonaws.com/mentorbaba-quiz:latest
  
  echo "Deployment to EC2 complete!"
EOF

echo "✅ EC2 Deployment successful!"
echo "🌐 Application should be available at: http://YOUR_EC2_IP:5000"
echo "=== Deployment Complete ==="