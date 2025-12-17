# Quick Deployment Guide for Vercel

## 🚀 Deploy Your Chatbot in 3 Steps

### Method 1: Vercel Dashboard (Easiest)

1. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Repository**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Choose `waliullah-khan/NXAI`
   - Select branch: `claude/build-chatbot-interface-011CUWpdN2aZdk4AoAvDEKzB`

3. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete (usually 30-60 seconds)
   - Your chatbot will be live at `https://your-project-name.vercel.app`

### Method 2: Vercel CLI (For Developers)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to project directory
cd NXAI

# Login to Vercel (if not already logged in)
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

### Method 3: One-Click Deploy

Click this button:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/waliullah-khan/NXAI&project-name=ghl-ai-chatbot&repository-name=ghl-ai-chatbot)

## 📋 What Happens During Deployment

1. Vercel reads the `vercel.json` configuration
2. Sets up URL rewrites to serve from the `public/` directory
3. Deploys all static files (HTML, CSS, JS)
4. Provides you with a live URL

## ✅ Verification

After deployment:

1. Visit your Vercel URL
2. You should see the GHL AI Assistant chatbot interface
3. Test the chat functionality by typing a message
4. Verify the n8n webhook integration is working

## 🔧 Post-Deployment Configuration

### Update Webhook URL (if needed)

If you need to change the n8n webhook URL:

1. Edit `public/js/app.js`
2. Update the `webhookUrl` in the CONFIG object:
   ```javascript
   const CONFIG = {
       webhookUrl: 'YOUR_NEW_WEBHOOK_URL',
       particleCount: 50
   };
   ```
3. Commit and push changes
4. Vercel will automatically redeploy

### Environment Variables (Optional)

For better security, you can use Vercel environment variables:

1. Go to your project in Vercel Dashboard
2. Navigate to Settings → Environment Variables
3. Add `VITE_WEBHOOK_URL` or similar
4. Update your code to use environment variables

## 🌐 Custom Domain

To use a custom domain:

1. Go to your project in Vercel Dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

## 📊 Monitoring

Vercel provides:
- Automatic HTTPS
- Global CDN
- Analytics (on paid plans)
- Real-time logs
- Performance monitoring

## 🆘 Troubleshooting

**Issue: 404 Not Found**
- Check that `vercel.json` is in the repository root
- Verify the `public/` directory contains all files

**Issue: Chat not working**
- Verify n8n webhook URL is correct
- Check browser console for errors
- Ensure CORS is configured on n8n side

**Issue: Styles not loading**
- Clear browser cache
- Check file paths in `index.html`
- Verify CSS file is in `public/css/styles.css`

## 📞 Support

For deployment issues:
- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- GitHub Issues: Create an issue in the repository

## 🎉 You're Done!

Your GHL AI Assistant Chatbot is now live and accessible worldwide!

Share your deployment URL:
`https://your-project-name.vercel.app`
