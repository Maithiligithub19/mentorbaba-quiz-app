#!/bin/bash

# Docker Deployment Script for MentorBaba Quiz App
# This script builds and deploys the application using Docker

set -e

echo "=== MentorBaba Quiz App - Docker Deployment ==="

# Configuration
IMAGE_NAME="mentorbaba-quiz"
CONTAINER_NAME="mentorbaba-app"
PORT="5000"

# Build Docker image
echo "Building Docker image..."
docker build -t $IMAGE_NAME .

# Stop existing container if running
echo "Stopping existing container..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# Run new container
echo "Starting new container..."
docker run -d \
  --name $CONTAINER_NAME \
  -p $PORT:$PORT \
  $IMAGE_NAME

# Verify deployment
echo "Verifying deployment..."
sleep 5
if docker ps | grep -q $CONTAINER_NAME; then
  echo "✅ Deployment successful!"
  echo "🌐 Application available at: http://localhost:$PORT"
else
  echo "❌ Deployment failed!"
  docker logs $CONTAINER_NAME
  exit 1
fi

echo "=== Deployment Complete ==="