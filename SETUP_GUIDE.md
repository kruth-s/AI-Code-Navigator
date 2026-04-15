# AI-Code-Navigator Setup Guide (Simplified)

## Overview

An AI-powered Q&A assistant with **GitHub OAuth authentication** and **Neon PostgreSQL** database. All authentication is handled by the Python backend.

---

## Architecture

```
┌─────────────────┐
│   Next.js UI    │  (http://localhost:3000)
│   (Client)      │
└────────┬────────┘
         │
         │ Login button → redirects to backend
         ↓
┌─────────────────┐
│  FastAPI Server │  (http://localhost:8000)
│   (Backend)     │
└────────┬────────┘
         │
         │ OAuth flow + User data
         ↓
┌─────────────────┐
│   GitHub API    │  (OAuth provider)
│  Neon PostgreSQL│  (User & repo storage)
└─────────────────┘
```

---

## Step 1: Create Neon Database

1. Go to [https://neon.tech](https://neon.tech)
2. Sign up (free tier available)
3. Create a new project
4. Copy the connection string:
   ```
   postgresql://username:password@ep-xxxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

---

## Step 2: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name**: AI Code Navigator
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/github/callback`
4. Click "Register application"
5. Copy the **Client ID** and generate a **Client Secret**

---

## Step 3: Backend Setup (Python)

### 3.1 Install Dependencies

```bash
cd server
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 3.2 Configure Environment

```bash
cd server
copy .env.example .env
```

Edit `.env`:

```env
# Neon Database Connection
DATABASE_URL="postgresql://username:password@ep-xxxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# GitHub OAuth
GITHUB_ID="Ov23li.xxxxxxxxxx"
GITHUB_SECRET="your_client_secret_here"

# Frontend URL
FRONTEND_URL="http://localhost:3000"

# GitHub API Token (for repo access)
GITHUB_TOKEN="ghp_xxxxxxxxxxxxxx"
```

### 3.3 Initialize Database

```bash
# Option 1: Using init script (recommended)
python scripts/init_db.py

# Option 2: Using Alembic
alembic upgrade head
```

This creates these tables in Neon:

- `users` - User accounts
- `accounts` - OAuth account links
- `sessions` - User sessions
- `repositories` - User's indexed repos
- `indexed_files` - Tracked files

### 3.4 Start Backend Server

```bash
uvicorn app.main:app --reload --port 8000
```

Visit: http://localhost:8000/docs (API documentation)

---

## Step 4: Frontend Setup (Next.js)

### 4.1 Install Dependencies

```bash
cd client
npm install
```

### 4.2 Configure Environment

```bash
cd client
copy .env.example .env
```

Edit `.env`:

```env
# Neon Database Connection (same as backend)
DATABASE_URL="postgresql://username:password@ep-xxxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Backend API URL
BACKEND_URL="http://localhost:8000"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4.3 Push Database Schema

```bash
npx drizzle-kit push
```

### 4.4 Start Frontend

```bash
npm run dev
```

Visit: http://localhost:3000

---

## Step 5: Test the Login Flow

1. Open http://localhost:3000/login
2. Click **"Login with GitHub"**
3. You'll be redirected to GitHub
4. Authorize the application
5. You'll be redirected back to `/dashboard`
6. Check your Neon database - a new user should be created!

```sql
-- Run this in Neon SQL editor
SELECT id, name, email, created_at FROM users;
SELECT * FROM accounts;
```

---

## OAuth Flow Explained

```
1. User clicks "Login with GitHub" on /login
   ↓
2. Frontend calls server action → redirects to:
   http://localhost:8000/api/auth/github/login
   ↓
3. Backend redirects to GitHub OAuth:
   https://github.com/login/oauth/authorize?client_id=...
   ↓
4. User authorizes → GitHub redirects back to:
   http://localhost:3000/api/auth/github/callback?code=xxx
   ↓
5. Backend exchanges code for access token
   ↓
6. Backend fetches user info from GitHub API
   ↓
7. Backend creates/updates user in Neon DB
   ↓
8. Backend creates session token
   ↓
9. Backend redirects to:
   /dashboard?session_token=xxx&user_id=xxx
   ↓
10. Frontend stores session token (cookie/localStorage)
```

---

## API Endpoints

### Authentication

- `GET /api/auth/github/login` - Start GitHub OAuth flow
- `GET /api/auth/github/callback` - OAuth callback handler
- `GET /api/auth/github/user/{user_id}` - Get user info

### Users

- `GET /api/users/me` - Get current user
- `GET /api/users/{user_id}` - Get user by ID
- `GET /api/users/{user_id}/repositories` - Get user's repositories
- `POST /api/users/{user_id}/repositories` - Add repository

---

## Troubleshooting

### "GitHub OAuth not configured" error

- Make sure `GITHUB_ID` and `GITHUB_SECRET` are set in server `.env`
- Check that the callback URL in GitHub settings matches: `http://localhost:3000/api/auth/github/callback`

### Database connection error

- Verify `DATABASE_URL` is correct in both `.env` files
- Make sure SSL is enabled (`?sslmode=require`)
- Check that your IP is allowed in Neon settings

### User not created after login

- Check backend logs for errors
- Verify the callback is reaching `/api/auth/github/callback`
- Check that Neon tables exist (run `python scripts/init_db.py`)

---

## Next Steps

- Add session management on frontend (store token in cookies)
- Create dashboard UI showing user's repositories
- Add repository indexing functionality
- Implement logout functionality
- Add protected routes (require authentication)
