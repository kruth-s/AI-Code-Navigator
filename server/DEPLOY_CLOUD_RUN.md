
# Deployment Guide: Backend on Google Cloud Run

## Prerequisites
1. [Google Cloud SDK (gcloud)](https://cloud.google.com/sdk/docs/install) installed and initialized.
2. A Google Cloud Project created.

## Steps

### 1. Build and Submit the Image
Run this command from the `server` directory:

```bash
# Replace YOUR_PROJECT_ID with your actual Google Cloud Project ID
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/ai-code-navigator-backend
```

### 2. Deploy to Cloud Run
Once the build is complete, deploy the service:

```bash
gcloud run deploy ai-code-navigator-backend \
  --image gcr.io/YOUR_PROJECT_ID/ai-code-navigator-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars PINECONE_API_KEY=your_key_here,PINECONE_INDEX=your_index_name,GROQ_API_KEY=your_key_here
```

*Note: Replace `your_key_here` with your actual API keys or set them in the Cloud Console GUI after deployment for better security.*

### 3. Update Frontend
Once deployed, Cloud Run will give you a URL (e.g., `https://ai-code-navigator-backend-xyz.a.run.app`).
Update your frontend Vercel environment variable `NEXT_PUBLIC_API_URL` to point to this new URL.
