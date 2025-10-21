# SwitchBai 🎮

**Your trusted source for quality second-hand Nintendo Switch games and
rentals**

SwitchBai is a modern e-commerce platform specializing in Nintendo Switch games,
offering both sales and rental services with verified quality, competitive
pricing, and exceptional customer service.

## 🌟 Features

### 🛒 **E-commerce Platform**

- **Game Sales**: Browse and purchase second-hand Nintendo Switch games
- **Real-time Inventory**: Live stock updates with availability tracking
- **Smart Pricing**: 10% savings compared to retail prices
- **Quality Assurance**: Every game tested and verified before listing
- **Game Comparison**: Side-by-side comparison of up to 2 games
- **Advanced Search**: Filter by category, platform, price range, and more

### 🎯 **Rental Services**

- **Flexible Rental Plans**: 1-4 week rental periods
- **Tiered Pricing**: Based on game value (₱300-₱400/week)
- **Easy Swapping**: ₱100 swap fee for game exchanges
- **Service Area**: Cebu City, Philippines
- **Meetup Options**: Available for 2+ week rentals

### 👨‍💼 **Admin Dashboard**

- **Game Management**: Add, edit, delete games with full CRUD operations
- **Image Upload**: Firebase Storage integration with client-side optimization
- **Inventory Tracking**: Real-time stock management
- **User Authentication**: Secure admin access with NextAuth.js
- **Data Validation**: Comprehensive form validation and error handling

### 🎨 **Modern UI/UX**

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Auto-hiding Navigation**: Smart navigation that hides on scroll down, shows
  on scroll up
- **Interactive Modals**: Smooth comparison and game detail modals
- **Loading States**: Skeleton loaders and loading animations
- **Toast Notifications**: Real-time feedback for user actions

## 🛠️ **Technology Stack**

### **Frontend**

- **Next.js 15.1.6** - React framework with App Router
- **React 19** - UI library with latest features
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **React Icons 5.5.0** - Icon library
- **SWR 2.3.6** - Data fetching and caching

### **Backend & Database**

- **MongoDB 6.20.0** - NoSQL database
- **Mongoose 8.19.2** - MongoDB object modeling
- **NextAuth.js 4.24.11** - Authentication framework
- **MongoDB Adapter** - NextAuth.js database adapter

### **Cloud Services**

- **Firebase Storage** - Image hosting and optimization
- **Sharp 0.34.4** - Image processing and optimization

### **Development Tools**

- **Prettier 3.6.2** - Code formatting
- **ESLint** - Code linting
- **TSX 4.20.6** - TypeScript execution
- **Axios 1.12.2** - HTTP client

## 📁 **Project Structure**

```
src/
├── app/
│   ├── admin/                 # Admin dashboard
│   │   ├── components/        # Admin-specific components
│   │   ├── login/            # Admin authentication
│   │   └── page.tsx          # Admin dashboard
│   ├── api/                  # API routes
│   │   ├── auth/             # Authentication endpoints
│   │   ├── games/            # Game CRUD operations
│   │   └── upload/           # Image upload endpoint
│   ├── components/           # Reusable UI components
│   │   ├── ui/
│   │   │   ├── globalUI/     # Navigation, Footer
│   │   │   ├── home/         # Home page components
│   │   │   └── rent/         # Rental page components
│   │   └── ui/
│   ├── compare/              # Game comparison page
│   ├── games/                # Games listing page
│   ├── rent-a-game/          # Rental services page
│   └── page.tsx              # Home page
├── config/                   # Configuration files
├── lib/                      # Utility libraries
│   ├── api-client.ts         # API client with Axios
│   ├── auth.ts              # Authentication configuration
│   ├── firebase.ts          # Firebase configuration
│   ├── game-utils.ts        # Game-related utilities
│   ├── image-optimizer.ts   # Image optimization
│   └── mongodb.ts           # Database connection
├── models/                   # Database models
│   └── Game.ts              # Game schema
└── scripts/                  # Utility scripts
    └── migrate-games.ts     # Data migration script
```

## 🚀 **Getting Started**

### **Prerequisites**

- Node.js 18+
- MongoDB database
- Firebase project with Storage enabled

### **Installation**

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/switchbai.git
   cd switchbai
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup** Create a `.env.local` file with the following
   variables:

   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/switchbai

   # NextAuth.js
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key

   # Firebase
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
   FIREBASE_PRIVATE_KEY=your-private-key
   FIREBASE_CLIENT_EMAIL=your-client-email

   # App Configuration
   NEXT_PUBLIC_API_URL=http://localhost:3000
   NEXT_PUBLIC_ENVIRONMENT=dev
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser** Navigate to
   [http://localhost:3000](http://localhost:3000)

## 📊 **Database Schema**

### **Game Model**

```typescript
interface Game {
  _id?: string; // MongoDB document ID
  gameTitle: string; // Game title
  gamePlatform: string | string[]; // Nintendo Switch, Switch 2
  gameRatings: string; // E, E10+, T, M, AO, RP
  gameBarcode: string; // 10-13 digit barcode (unique)
  gameDescription: string; // Game description
  gameImageURL: string; // Firebase Storage URL
  gameAvailableStocks: number; // Available quantity
  gamePrice: number; // Selling price
  gameCategory: string; // RPG, Action, etc.
  gameReleaseDate: string; // YYYY-MM-DD format
  numberOfSold?: number; // Sales count
  rentalAvailable?: boolean; // Rental availability
  rentalWeeklyRate?: number; // Weekly rental rate
  class?: string; // Game classification
  tradable?: boolean; // Trade availability
  createdAt: string; // Creation timestamp
  updatedAt: string; // Last update timestamp
}
```

## 🔧 **API Endpoints**

### **Games API**

- `GET /api/games` - Fetch all games with pagination
- `GET /api/games?limit=10&page=1` - Paginated game list
- `GET /api/games/[barcode]` - Get specific game by barcode
- `POST /api/games` - Create new game (admin only)
- `PUT /api/games/[barcode]` - Update game (admin only)
- `DELETE /api/games/[barcode]` - Delete game (admin only)

### **Upload API**

- `POST /api/upload` - Upload images to Firebase Storage

### **Authentication API**

- `GET /api/auth/signin` - Sign in page
- `POST /api/auth/signin` - Sign in endpoint
- `GET /api/auth/signout` - Sign out endpoint

## 🎨 **UI Components**

### **Global Components**

- **Navigation**: Auto-hiding navigation with dropdown menus
- **Footer**: Company information and social links
- **Toast**: Success/error notifications

### **Home Page Components**

- **HeroSection**: Featured games carousel with comparison
- **CompareGamesSection**: Game comparison features
- **AboutUsSection**: Company information and stats
- **ContactSection**: Contact information and forms

### **Admin Components**

- **GameForm**: Create/edit game form with validation
- **GamesTable**: Data table with CRUD operations
- **DashboardStats**: Admin dashboard statistics
- **Modals**: Delete confirmation and edit modals

## 🔐 **Authentication & Security**

- **NextAuth.js** for secure authentication
- **MongoDB Adapter** for user session management
- **Protected Routes** for admin access
- **Form Validation** on both client and server
- **Image Upload Security** with Firebase Storage
- **Environment Variables** for sensitive data

## 📱 **Responsive Design**

- **Mobile-First**: Optimized for mobile devices
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch-Friendly**: Large buttons and touch targets
- **Auto-Hiding Navigation**: Better mobile experience
- **Flexible Grids**: Responsive game card layouts

## 🚀 **Performance Optimizations**

- **Image Optimization**: Sharp for server-side, Next.js for client-side
- **Code Splitting**: Dynamic imports for better loading
- **SWR Caching**: Efficient data fetching and caching
- **Lazy Loading**: Images and components loaded on demand
- **Bundle Optimization**: Tree shaking and code splitting

## 🧪 **Development Scripts**

```bash
# Development
npm run dev          # Start development server with Prettier

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run migrate      # Run data migration script
```

## 📈 **Business Information**

### **Company Details**

- **Name**: SwitchBai
- **Founded**: 2023
- **Location**: Cebu City, Philippines
- **Contact**: maruronu@gmail.com
- **Phone**: +63 939 681 0206

### **Service Area**

- **Primary**: Cebu City, Philippines
- **Rental Service**: Cebu City only
- **Office Hours**:
  - Weekdays: 9:00 AM - 6:00 PM
  - Saturday: 10:00 AM - 4:00 PM
  - Sunday: Closed

### **Payment Methods**

- GCash
- Bank Transfer
- Cash on Pickup

## 🔮 **Future Features**

- **Trading System**: Game-to-game trading platform
- **User Accounts**: Customer registration and profiles
- **Order Management**: Complete order processing system
- **Payment Integration**: Online payment processing
- **Mobile App**: React Native mobile application
- **Inventory Management**: Advanced stock management
- **Analytics Dashboard**: Business intelligence and reporting

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is private and proprietary. All rights reserved.

## 👨‍💻 **Developer**

**Marlon** - Full Stack Developer

- **Email**: maruronu@gmail.com
- **GitHub**: [@yourusername](https://github.com/yourusername)
- **LinkedIn**: [Your LinkedIn](https://linkedin.com/in/yourprofile)

---

**SwitchBai** - _"Whether you're looking to buy, sell, or trade your Nintendo
Switch games, our community is all about connecting gamers and creating a
friendly environment—both online and offline. So come on, bai—let's play!"_ 🎮
