#!/bin/bash
set -e

# ==============================================================================
# ClarityBridge — Production Deployment Script (Google Cloud Run)
# ==============================================================================

# Ensure Project ID is provided
if [ -z "$GCP_PROJECT_ID" ]; then
  if [ -n "$1" ]; then
    GCP_PROJECT_ID=$1
  else
    echo "Error: GCP_PROJECT_ID is not set."
    echo "Usage: ./deploy.sh <your-gcp-project-id> [region]"
    exit 1
  fi
fi

REGION=${2:-"us-central1"}
SERVICE_NAME="clarity-bridge"
IMAGE_NAME="gcr.io/${GCP_PROJECT_ID}/${SERVICE_NAME}:latest"

echo "=========================================================="
echo "Deploying ClarityBridge to Cloud Run"
echo "Project: $GCP_PROJECT_ID"
echo "Region:  $REGION"
echo "Service: $SERVICE_NAME"
echo "=========================================================="

# 1. Configure gcloud project
gcloud config set project "$GCP_PROJECT_ID"

# 2. Build Container with Cloud Build (Single container serving backend + built frontend)
echo "Step 1/3: Building container image via Google Cloud Build..."
gcloud builds submit --tag "$IMAGE_NAME" .

# 3. Deploy to Cloud Run with Secret Manager environment variables
echo "Step 2/3: Deploying container to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --image "$IMAGE_NAME" \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300 \
  --set-env-vars "NODE_ENV=production,GCP_PROJECT_ID=${GCP_PROJECT_ID},GCP_LOCATION=${REGION}" \
  --set-secrets "GEMINI_API_KEY=GEMINI_API_KEY:latest"

# 4. Fetch service URL
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --platform managed --region "$REGION" --format 'value(status.url)')

echo "=========================================================="
echo "Deployment Complete! 🚀"
echo "Live URL: $SERVICE_URL"
echo "=========================================================="
