# Real Estate System - Deployment Guide

## 📋 Project Analysis

### Recent Code Changes
Your project has been prepared for production deployment with these key changes:

**1. Backend - Dynamic CORS Configuration (server.js)**
- ❌ Before: Hardcoded localhost URLs only
- ✅ After: Reads from `CLIENT_ORIGIN` environment variable
- Allows deployment to any domain

**2. Frontend - Dynamic API Endpoint (api.js)**
- ❌ Before: Hardcoded `http://localhost:5000/api`
- ✅ After: Reads from `VITE_API_BASE_URL` environment variable
- Can point to production backend

### Tech Stack
```
Frontend:   React 19 + Vite (SPA)
Backend:    Node.js + Express + JWT Auth
Database:   MySQL 
Storage:    Cloudinary (already configured in code)
```

---

## 🚀 Deployment Strategy

### Option 1: Recommended Stack (Easiest)
- **Frontend**: Vercel (already configured with vercel.json)
- **Backend**: Render.com or Railway.app
- **Database**: AWS RDS / Railway.app / Clever Cloud

### Option 2: Traditional Stack
- **Frontend**: Netlify or Any Static Host
- **Backend**: Heroku / DigitalOcean / Linode
- **Database**: Managed MySQL service

---

## 📝 Step-by-Step Deployment

### STEP 1: Prepare Environment Files

#### Backend: Create `.env` for Production
```bash
# Copy and update backend/.env.example to backend/.env
PORT=5000
CLIENT_ORIGIN=https://your-frontend-domain.vercel.app
DB_HOST=your-database-host
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
DB_NAME=real_estate_db
JWT_SECRET=your-very-long-random-secret-key-here
CLOUDINARY_CLOUD_NAME=dgrleojjn
CLOUDINARY_API_KEY=733168966639752
CLOUDINARY_API_SECRET=o03XWtICwzdqxsVH3GDXElg1Lsk
```

#### Frontend: Create `.env.local` 
```bash
VITE_API_BASE_URL=https://your-backend-url.com/api
```

### STEP 2: Frontend Deployment (Vercel)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Production deployment ready"
   git push origin master
   ```

2. **Deploy on Vercel**
   - Go to https://vercel.com
   - Connect GitHub account
   - Import your repository
   - Select `frontend` as root directory
   - Add Environment Variables:
     ```
     VITE_API_BASE_URL = https://your-backend-url.com/api
     ```
   - Deploy

3. **Verify**
   - Check Vercel deployment URL
   - Note down your frontend URL (e.g., `https://your-app.vercel.app`)

### STEP 3: Backend Deployment (Render.com - Recommended)

1. **Prepare Backend**
   ```bash
   cd backend
   npm install
   ```

2. **Deploy on Render**
   - Go to https://render.com
   - Create new Web Service
   - Connect GitHub repository
   - Settings:
     - Root Directory: `backend`
     - Build Command: `npm install`
     - Start Command: `npm start`
   
3. **Add Environment Variables** in Render Dashboard:
   ```
   PORT=5000
   CLIENT_ORIGIN=https://your-app.vercel.app
   DB_HOST=your-database-host
   DB_PORT=3306
   DB_USER=your_db_user
   DB_PASSWORD=your_secure_password
   DB_NAME=real_estate_db
   JWT_SECRET=your-long-random-secret
   CLOUDINARY_CLOUD_NAME=dgrleojjn
   CLOUDINARY_API_KEY=733168966639752
   CLOUDINARY_API_SECRET=o03XWtICwzdqxsVH3GDXElg1Lsk
   ```

4. **Note Backend URL** (e.g., `https://your-backend.onrender.com`)

### STEP 4: Database Setup

**Option A: Using Render.com Database (Easiest)**
- In Render Dashboard, create PostgreSQL database
- Get connection string
- Update backend `.env` with details

**Option B: AWS RDS (MySQL)**
1. Create MySQL instance on AWS RDS
2. Configure security groups (allow backend IP)
3. Update backend `.env` with RDS endpoint

**Option C: Local MySQL (Development Only)**
- Keep local MySQL running
- Use SSH tunnel from backend to access

### STEP 5: Initialize Database

1. **Create Database Schema**
   ```bash
   cd backend
   mysql -h your_db_host -u your_db_user -p your_db_name < schema.sql
   ```

2. **Verify Connection**
   - Backend should show database connection in logs
   - Check Render/Railway logs for confirmation

### STEP 6: Testing Production Build

1. **Build Frontend Locally**
   ```bash
   cd frontend
   npm install
   npm run build
   npm run preview
   ```
   - Should work without errors
   - Check production bundle size

2. **Test Backend Health**
   ```bash
   curl https://your-backend.onrender.com/health
   ```
   - Should return: `{"status":"UP","message":"Real Estate Property Management API is online."}`

3. **Test API Endpoints**
   - Try login endpoint
   - Verify CORS headers are correct
   - Test file uploads (uses Cloudinary)

---

## 🔧 Configuration Checklist

- [ ] Backend `.env` created with all variables
- [ ] Frontend `.env.local` created with API URL
- [ ] Database created and schema imported
- [ ] Cloudinary credentials verified (already in code)
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Render/Railway
- [ ] Environment variables set in deployment platforms
- [ ] CORS origin matches frontend URL
- [ ] API base URL matches backend URL
- [ ] Database connection verified
- [ ] Health check endpoint responds
- [ ] Test login flow end-to-end

---

## 📊 Environment Variables Summary

| Variable | Backend | Frontend | Notes |
|----------|---------|----------|-------|
| `PORT` | ✅ | - | Default: 5000 |
| `CLIENT_ORIGIN` | ✅ | - | Frontend URL for CORS |
| `VITE_API_BASE_URL` | - | ✅ | Backend API URL |
| `DB_*` | ✅ | - | Database credentials |
| `JWT_SECRET` | ✅ | - | Auth token secret |
| `CLOUDINARY_*` | ✅ | - | Already configured |

---

## 🐛 Troubleshooting

### CORS Errors
- Check `CLIENT_ORIGIN` matches frontend URL exactly
- Verify backend is receiving requests (check logs)

### API Not Found (404)
- Verify `VITE_API_BASE_URL` ends with `/api`
- Check backend is deployed and running

### Database Connection Failed
- Verify DB credentials in backend `.env`
- Check database server is running/accessible
- Verify firewall rules allow backend IP

### Authentication Issues
- Check `JWT_SECRET` is consistent
- Verify tokens are being sent in headers
- Check token expiry time

### Image Upload Failed
- Verify Cloudinary credentials are correct
- Check image file size limits
- Monitor Cloudinary dashboard

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Express Guide**: https://expressjs.com/
- **React Documentation**: https://react.dev
- **MySQL Help**: https://dev.mysql.com/doc/

---

## ✅ Final Verification

After deployment, verify:
1. Frontend loads without errors
2. Can register new account
3. Can login successfully
4. Can browse properties
5. Can upload images (through Cloudinary)
6. Can book property visits
7. Admin dashboard works
8. Q&A section functional

---

**Last Updated**: 2026-06-16
**Status**: Ready for Production Deployment
