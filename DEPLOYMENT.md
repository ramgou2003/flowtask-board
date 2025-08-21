# 🚀 VIDEC Task Board - Vercel Deployment Guide

## 📋 Prerequisites

1. **GitHub Account** - Your code needs to be in a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Supabase Project** - Your database should be set up and running

## 🔧 Environment Variables Setup

Before deploying, you need to configure your environment variables in Vercel:

### Required Environment Variables:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### How to get Supabase credentials:
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **Project URL** and **anon/public key**

## 🚀 Deployment Steps

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select "videc-task-board" repository

3. **Configure the project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `dist` (auto-detected)

4. **Add Environment Variables:**
   - In the deployment configuration, expand "Environment Variables"
   - Add your Supabase credentials:
     ```
     VITE_SUPABASE_URL = your_supabase_project_url
     VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
     ```

5. **Deploy:**
   - Click "Deploy"
   - Wait for the build to complete (usually 2-3 minutes)
   - Your app will be live at `https://your-project-name.vercel.app`

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name: `videc-task-board`
   - Directory: `./` (press Enter)

5. **Add environment variables:**
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```

6. **Redeploy with environment variables:**
   ```bash
   vercel --prod
   ```

## 🔒 Security Configuration

### Supabase Security Setup:
1. **Row Level Security (RLS):**
   - Ensure RLS is enabled on all tables
   - Users can only access their own data

2. **Domain Configuration:**
   - Add your Vercel domain to Supabase allowed origins
   - Go to **Authentication** → **URL Configuration**
   - Add: `https://your-project-name.vercel.app`

### Vercel Security Headers:
The `vercel.json` file includes security headers:
- Content Security Policy
- XSS Protection
- Frame Options
- HTTPS enforcement

## 🌐 Custom Domain (Optional)

1. **Add custom domain in Vercel:**
   - Go to your project dashboard
   - Click "Domains"
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update Supabase configuration:**
   - Add your custom domain to allowed origins
   - Update any hardcoded URLs in your app

## 📱 PWA Verification

After deployment, verify PWA functionality:

1. **Lighthouse Audit:**
   - Open Chrome DevTools
   - Go to Lighthouse tab
   - Run PWA audit
   - Should score 90+ for PWA

2. **Installation Test:**
   - Visit your deployed app
   - Look for install prompt
   - Test installation on mobile/tablet

3. **Offline Test:**
   - Install the app
   - Turn off internet
   - App should still load and function

## 🔄 Automatic Deployments

Vercel automatically deploys when you push to your main branch:

1. **Push changes:**
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```

2. **Automatic deployment:**
   - Vercel detects the push
   - Builds and deploys automatically
   - Usually takes 2-3 minutes

## 🐛 Troubleshooting

### Common Issues:

1. **Build Fails:**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in `package.json`
   - Verify TypeScript errors are fixed

2. **Environment Variables:**
   - Double-check variable names (case-sensitive)
   - Ensure they start with `VITE_`
   - Redeploy after adding variables

3. **Supabase Connection:**
   - Verify URL and key are correct
   - Check Supabase allowed origins
   - Ensure RLS policies are correct

4. **PWA Issues:**
   - Check service worker registration
   - Verify manifest.json is accessible
   - Ensure HTTPS is working

### Debug Commands:
```bash
# Check build locally
npm run build
npm run preview

# Check for TypeScript errors
npm run lint

# Test PWA locally
npx serve dist
```

## 📊 Performance Optimization

Your app is already optimized with:
- ✅ Code splitting
- ✅ Asset optimization
- ✅ Service worker caching
- ✅ Gzip compression
- ✅ CDN delivery via Vercel

## 🎉 Success!

Once deployed, your VIDEC Task Board will be:
- 🌐 **Live** at your Vercel URL
- 📱 **Installable** as a PWA
- ⚡ **Fast** with global CDN
- 🔒 **Secure** with HTTPS
- 🔄 **Auto-updating** on git push

Share your app URL and enjoy your deployed task management system! 🚀
