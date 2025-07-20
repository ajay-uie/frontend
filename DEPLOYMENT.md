# Fragransia™ Frontend Deployment Guide

This guide covers deploying the Fragransia™ frontend application to Vercel or Render using GitHub integration with automatic builds.

## 📋 Prerequisites

- GitHub account
- Vercel or Render account
- Node.js 18+ (for local development)
- Git installed locally

## 🚀 Quick Deployment Options

### Option 1: Deploy to Vercel (Recommended)

Vercel provides the best Next.js deployment experience with automatic optimizations.

#### Step 1: Prepare Your Repository

1. **Initialize Git repository** (if not already done):
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit: Fragransia frontend"
   \`\`\`

2. **Create GitHub repository**:
   - Go to [GitHub](https://github.com) and create a new repository
   - Name it `fragransia-frontend` or similar
   - Don't initialize with README (since you already have files)

3. **Push to GitHub**:
   \`\`\`bash
   git remote add origin https://github.com/YOUR_USERNAME/fragransia-frontend.git
   git branch -M main
   git push -u origin main
   \`\`\`

#### Step 2: Deploy to Vercel

1. **Connect to Vercel**:
   - Go to [Vercel](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your `fragransia-frontend` repository

2. **Configure Build Settings**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install`

3. **Environment Variables**:
   Add these environment variables in Vercel dashboard:
   \`\`\`
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABCDEF123
   NEXT_PUBLIC_FRONTEND_URL=https://your-app.vercel.app
   NEXT_PUBLIC_NODE_ENV=production
   \`\`\`

4. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically build and deploy your app
   - You'll get a live URL like `https://fragransia-frontend.vercel.app`

#### Step 3: Automatic Deployments

- Every push to `main` branch triggers automatic deployment
- Pull requests create preview deployments
- No additional configuration needed

---

### Option 2: Deploy to Render

Render provides excellent hosting with automatic SSL and global CDN.

#### Step 1: Prepare Your Repository

Follow the same GitHub setup steps as above.

#### Step 2: Deploy to Render

1. **Connect to Render**:
   - Go to [Render](https://render.com)
   - Sign up/Login with GitHub
   - Click "New +" → "Static Site"
   - Connect your `fragransia-frontend` repository

2. **Configure Build Settings**:
   \`\`\`
   Name: fragransia-frontend
   Branch: main
   Root Directory: (leave empty)
   Build Command: npm install && npm run build
   Publish Directory: out
   \`\`\`

3. **Add Build Script for Static Export**:
   Update your `package.json` to include static export:
   \`\`\`json
   {
     "scripts": {
       "build": "next build",
       "build:static": "next build && next export",
       "export": "next export"
     }
   }
   \`\`\`

4. **Configure Next.js for Static Export**:
   Update `next.config.mjs`:
   \`\`\`javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export',
     trailingSlash: true,
     images: {
       unoptimized: true
     },
     experimental: {
       optimizeCss: true,
     },
   }

   export default nextConfig
   \`\`\`

5. **Environment Variables**:
   Add the same environment variables as listed in Vercel section.

6. **Deploy**:
   - Click "Create Static Site"
   - Render will build and deploy your app
   - You'll get a live URL like `https://fragransia-frontend.onrender.com`

---

## 🔧 Build Configuration

### Ensuring Complete Build Without Deletions

The application is configured to preserve all components and features during build:

#### 1. **Build Scripts** (already configured):
\`\`\`json
{
  "scripts": {
    "build": "next build",
    "dev": "next dev",
    "lint": "next lint",
    "start": "next start"
  }
}
\`\`\`

#### 2. **Next.js Configuration** (`next.config.mjs`):
\`\`\`javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  // Preserve all components during build
  webpack: (config, { isServer }) => {
    // Ensure all components are included
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    }
    return config
  },
  // Include all pages and API routes
  generateBuildId: async () => {
    return 'fragransia-build-' + Date.now()
  }
}

export default nextConfig
\`\`\`

#### 3. **TypeScript Configuration** (`tsconfig.json`):
\`\`\`json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "target": "ES6",
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
\`\`\`

---

## 🌐 Custom Domain Setup

### For Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL certificate is automatically provisioned

### For Render:
1. Go to Settings → Custom Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL certificate is automatically provisioned

---

## 🔄 Continuous Deployment Workflow

### Automatic Deployments:
\`\`\`bash
# Make changes to your code
git add .
git commit -m "Update: description of changes"
git push origin main

# Deployment happens automatically
# - Vercel: Instant deployment
# - Render: Deployment in 2-3 minutes
\`\`\`

### Preview Deployments (Vercel only):
\`\`\`bash
# Create feature branch
git checkout -b feature/new-component
# Make changes
git add .
git commit -m "Add: new component"
git push origin feature/new-component

# Create pull request on GitHub
# Vercel automatically creates preview deployment
\`\`\`

---

## 📁 Project Structure Preservation

The deployment process preserves the complete project structure:

\`\`\`
fragransia-frontend/
├── app/                    # Next.js 13+ app directory
│   ├── components/         # Page-specific components
│   ├── api/               # API routes
│   ├── (auth)/            # Route groups
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # UI components (shadcn/ui)
│   ├── auth/             # Authentication components
│   ├── checkout/         # Checkout components
│   └── ...               # Other component categories
├── contexts/             # React contexts
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
│   ├── api.ts           # API client
│   ├── firebase.ts      # Firebase configuration
│   ├── local-db.ts      # Local database fallback
│   └── api-fallback.ts  # API fallback system
├── public/              # Static assets
├── styles/              # Additional styles
├── middleware.ts        # Next.js middleware
├── next.config.mjs      # Next.js configuration
├── package.json         # Dependencies and scripts
├── tailwind.config.ts   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
\`\`\`

---

## 🛠️ Troubleshooting

### Common Build Issues:

1. **Missing Environment Variables**:
   \`\`\`bash
   # Check if all required env vars are set
   echo $NEXT_PUBLIC_FIREBASE_API_KEY
   \`\`\`

2. **Build Failures**:
   \`\`\`bash
   # Clear cache and rebuild
   rm -rf .next
   rm -rf node_modules
   npm install
   npm run build
   \`\`\`

3. **Import Errors**:
   - Ensure all imports use correct paths
   - Check for circular dependencies
   - Verify component exports

4. **Static Asset Issues**:
   - Place all images in `public/` directory
   - Use relative paths starting with `/`
   - Optimize images for web

### Performance Optimization:

1. **Image Optimization**:
   \`\`\`javascript
   // Use Next.js Image component
   import Image from 'next/image'
   
   <Image
     src="/images/product.jpg"
     alt="Product"
     width={300}
     height={400}
     priority={true} // For above-the-fold images
   />
   \`\`\`

2. **Code Splitting**:
   \`\`\`javascript
   // Dynamic imports for large components
   import dynamic from 'next/dynamic'
   
   const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
     loading: () => <p>Loading...</p>
   })
   \`\`\`

---

## 📊 Monitoring and Analytics

### Vercel Analytics:
- Automatically enabled for all deployments
- View performance metrics in Vercel dashboard
- Real-time visitor analytics

### Render Monitoring:
- Built-in performance monitoring
- View logs and metrics in Render dashboard
- Custom health checks available

---

## 🔐 Security Considerations

1. **Environment Variables**:
   - Never commit `.env` files to Git
   - Use platform-specific environment variable settings
   - Prefix client-side variables with `NEXT_PUBLIC_`

2. **API Security**:
   - Implement rate limiting
   - Use CORS properly
   - Validate all inputs

3. **Content Security Policy**:
   \`\`\`javascript
   // Add to next.config.mjs
   const securityHeaders = [
     {
       key: 'X-DNS-Prefetch-Control',
       value: 'on'
     },
     {
       key: 'X-XSS-Protection',
       value: '1; mode=block'
     },
     {
       key: 'X-Frame-Options',
       value: 'SAMEORIGIN'
     }
   ]
   \`\`\`

---

## 📞 Support

For deployment issues:
- **Vercel**: [Vercel Documentation](https://vercel.com/docs)
- **Render**: [Render Documentation](https://render.com/docs)
- **Next.js**: [Next.js Documentation](https://nextjs.org/docs)

---

## 🎉 Success!

After following this guide, your Fragransia™ frontend will be:
- ✅ Deployed to production
- ✅ Automatically updated on code changes
- ✅ Optimized for performance
- ✅ Secured with HTTPS
- ✅ Globally distributed via CDN
- ✅ Monitored for performance and errors

Your application will be live and accessible to users worldwide! 🌍
