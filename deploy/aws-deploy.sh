#!/bin/bash

# AWS Deployment Script for MentorBaba Quiz App

echo "Starting AWS deployment..."

# Build Docker image
docker build -t mentorbaba-quiz:latest .

# Tag for ECR (replace with your ECR URI)
docker tag mentorbaba-quiz:latest YOUR_ECR_URI:latest

# Push to ECR
docker push YOUR_ECR_URI:latest

# Deploy to EC2 (replace with your EC2 details)
echo "Deploying to EC2..."
echo "Deployment completed successfully!"