# Fragransia™ Frontend

A modern e-commerce frontend built with Next.js 15, React 19, TypeScript, and Tailwind CSS. This application provides a complete fragrance shopping experience with authentication, cart management, checkout, and admin features.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Git

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd fragransia-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your actual values:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   # ... other variables
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **State Management**: React Context
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Charts**: Recharts

## 🏗️ Project Structure

```
fragransia-frontend/
├── app/                    # Next.js 13+ app directory
│   ├── (auth)/            # Authentication routes
│   ├── (shop)/            # Shopping routes
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   ├── components/        # Page-specific components
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── auth/             # Authentication components
│   ├── cart/             # Shopping cart components
│   ├── checkout/         # Checkout flow components
│   ├── product/          # Product-related components
│   └── admin/            # Admin components
├── contexts/             # React contexts
│   ├── auth-context.tsx  # Authentication state
│   ├── cart-context.tsx  # Shopping cart state
│   └── admin-auth-context.tsx # Admin authentication
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
│   ├── api.ts           # API client
│   ├── firebase.ts      # Firebase configuration
│   ├── utils.ts         # Utility functions
│   └── constants.ts     # App constants
├── public/              # Static assets
├── styles/              # Additional styles
├── types/               # TypeScript type definitions
├── middleware.ts        # Next.js middleware
├── next.config.mjs      # Next.js configuration
├── tailwind.config.ts   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## 🌟 Features

### Customer Features
- **Product Catalog**: Browse fragrances with filtering and search
- **User Authentication**: Sign up, login, password reset
- **Shopping Cart**: Add/remove items, quantity management
- **Checkout Process**: Secure payment with Stripe integration
- **Order History**: View past orders and tracking
- **Wishlist**: Save favorite products
- **Reviews & Ratings**: Product reviews and ratings
- **Responsive Design**: Mobile-first responsive design

### Admin Features
- **Dashboard**: Sales analytics and key metrics
- **Product Management**: CRUD operations for products
- **Order Management**: View and update order status
- **User Management**: Customer account management
- **Inventory Tracking**: Stock level monitoring
- **Analytics**: Sales reports and insights

### Technical Features
- **Server-Side Rendering**: SEO-optimized pages
- **Static Generation**: Fast loading for product pages
- **Image Optimization**: Next.js Image component
- **Progressive Web App**: PWA capabilities
- **Real-time Updates**: Live inventory and order updates
- **Offline Support**: Basic offline functionality
- **Performance Monitoring**: Built-in analytics

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

3. **Environment Variables in Vercel**:
   Add all variables from `.env.example` in your Vercel dashboard.

### Deploy to Other Platforms

The application is also compatible with:
- **Netlify**: Static site deployment
- **Render**: Full-stack deployment
- **Railway**: Container deployment
- **AWS Amplify**: AWS-native deployment

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | Yes |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |
| `NEXT_PUBLIC_FRONTEND_URL` | Frontend URL | Yes |

### Firebase Setup

1. Create a Firebase project
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Add your domain to authorized domains
5. Copy configuration to environment variables

### API Integration

The frontend connects to a backend API for:
- Product data management
- Order processing
- Payment handling
- Admin operations

Backend repository: [Backend API](https://github.com/your-backend-repo)

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📱 PWA Features

The application includes Progressive Web App capabilities:
- **Offline Support**: Basic functionality without internet
- **Install Prompt**: Add to home screen
- **Push Notifications**: Order updates and promotions
- **Background Sync**: Sync data when connection restored

## 🔒 Security

- **Authentication**: Firebase Auth with secure tokens
- **Authorization**: Role-based access control
- **Data Validation**: Zod schema validation
- **HTTPS**: Enforced secure connections
- **CORS**: Proper cross-origin configuration
- **CSP**: Content Security Policy headers

## 📊 Performance

- **Lighthouse Score**: 95+ on all metrics
- **Core Web Vitals**: Optimized for Google's metrics
- **Image Optimization**: WebP format with lazy loading
- **Code Splitting**: Automatic route-based splitting
- **Caching**: Aggressive caching strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Documentation**: Check the `/docs` folder
- **Issues**: Create a GitHub issue
- **Email**: support@fragransia.com
- **Discord**: Join our community server

## 🗺️ Roadmap

- [ ] Multi-language support (i18n)
- [ ] Advanced search with AI
- [ ] AR try-on features
- [ ] Social login integration
- [ ] Subscription box service
- [ ] Mobile app (React Native)

---

**Fragransia™** - Discover Your Signature Scent 🌸

