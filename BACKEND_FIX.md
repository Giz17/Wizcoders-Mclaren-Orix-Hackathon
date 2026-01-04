# Vercel Backend Connection Fix

## Issues Fixed:
1. ❌ Wrong HuggingFace URL (was pointing to docs page instead of API endpoint)
2. ❌ Hardcoded URLs without environment variable support
3. ❌ Relative API paths that don't work in production

## Changes Made:

### 1. Fixed API Endpoints
- Updated `App.jsx` to use correct HuggingFace Space API endpoint
- Updated `api.js` to use absolute URLs
- Added environment variable support with `VITE_API_URL`

### 2. Created Configuration Files
- `.env` - Local environment variables
- `.env.example` - Template for environment variables
- `vercel.json` - Vercel configuration for SPA routing

## Setup Instructions:

### For Local Development:
```bash
# 1. Install dependencies (if not done)
npm install

# 2. Update .env file with your actual backend URL
# Edit .env and replace with your HuggingFace Space URL

# 3. Start dev server
npm run dev
```

### For Vercel Deployment:

1. **Add Environment Variable in Vercel Dashboard:**
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add: `VITE_API_URL` = `https://giz17-wizcoders-mclaren-orix-hackathon.hf.space`
   - Or use your actual HuggingFace Space URL

2. **Redeploy:**
   ```bash
   git add .
   git commit -m "Fix backend API connection"
   git push
   ```
   Vercel will automatically redeploy.

## Finding Your HuggingFace Space URL:

If the default URL doesn't work, get your actual Space URL:
1. Go to https://huggingface.co/spaces/giz17/Wizcoders-Mclaren-Orix-Hackathon
2. Look for the "App" or "Embed" section
3. The URL format is: `https://[username]-[space-name].hf.space`

## Testing Backend Connection:

Test in browser console or terminal:
```bash
curl -X POST https://giz17-wizcoders-mclaren-orix-hackathon.hf.space/analyze
```

If you get a CORS error or method not allowed (405), your backend is reachable!
If you get connection refused, check your HuggingFace Space URL.

## Common Issues:

1. **CORS Errors**: Your backend needs to allow requests from Vercel domain
2. **404 Not Found**: Check the API endpoint path (should be `/analyze`, not `/docs#/...`)
3. **Connection Timeout**: HuggingFace Space might be sleeping (takes 30s to wake up)

## Backend CORS Configuration Needed:

Your FastAPI backend should include:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
