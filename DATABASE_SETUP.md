# Database Setup Guide

## Overview

This guide covers the MongoDB + Firebase integration for the SwitchBai game
management system.

## Prerequisites

- MongoDB Atlas account or local MongoDB instance
- Firebase project with Storage enabled
- Node.js environment variables configured

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/switchbai?retryWrites=true&w=majority

# Firebase Configuration
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef123456

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Admin Credentials
ADMIN_EMAIL=admin@switchbai.com
ADMIN_PASSWORD=admin123
```

## MongoDB Setup

### 1. Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Choose your preferred region
4. Set up database user credentials
5. Whitelist your IP address (or use 0.0.0.0/0 for development)
6. Get your connection string

### 2. Database Collections

The following collections will be created automatically:

- `games` - Game inventory data
- `users` - Admin users (NextAuth)
- `accounts` - OAuth accounts (NextAuth)
- `sessions` - User sessions (NextAuth)

### 3. Indexes

The following indexes are created automatically for optimal performance:

```javascript
// Games collection
db.games.createIndex({ "gameBarcode": 1 }, { unique: true });
db.games.createIndex({ "gameTitle": "text", "gameDescription": "text" });
db.games.createIndex({ "gameCategory": 1 });
db.games.createIndex({ "gamePlatform": 1 });
db.games.createIndex({ "gamePrice": 1 });
db.games.createIndex({ "gameAvailableStocks": 1 });
db.games.createIndex({ "rentalAvailable": 1 });
db.games.createIndex({ "createdAt": -1 });
```

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Storage in the project settings
4. Get your configuration from Project Settings > General

### 2. Storage Rules

Set up Firebase Storage rules for security:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /games/{allPaths=**} {
      allow read: if true; // Public read access for game images
      allow write: if request.auth != null; // Only authenticated users can upload
    }
  }
}
```

### 3. Storage Structure

```
gs://your-project.appspot.com/
└── games/
    ├── mario-kart-1234567890.webp
    ├── zelda-botw-1234567891.webp
    └── ...
```

## Data Migration

### 1. Run Migration Script

```bash
npm run migrate
```

This will:

- Connect to MongoDB
- Read existing `games.json` data
- Check for duplicate games by barcode
- Insert new games into MongoDB
- Log migration results

### 2. Migration Output

```
🚀 Starting games migration...
✅ Connected to MongoDB
📁 Found 20 games in JSON file
✅ Migrated: Pokemon Violet + The Hidden Treasure of Area Zero DLC
✅ Migrated: Super Mario Odyssey
...
📊 Migration Summary:
✅ Successfully migrated: 20 games
⏭️  Skipped (already exist): 0 games
❌ Failed: 0 games
📈 Total games in database: 20
🎉 Migration completed!
```

## API Endpoints

### Games API

All endpoints now use MongoDB:

- `GET /api/games` - List games with search/filter/pagination
- `POST /api/games` - Create new game
- `GET /api/games/[barcode]` - Get single game
- `PUT /api/games/[barcode]` - Update game
- `DELETE /api/games/[barcode]` - Delete game

### Image Upload

- `POST /api/upload` - Upload image to Firebase Storage

## Authentication

### Admin User Setup

The system automatically creates an admin user on first run using environment
variables:

- Email: `ADMIN_EMAIL`
- Password: `ADMIN_PASSWORD` (hashed with bcrypt)

### Session Management

- Uses MongoDB for session storage
- Sessions are stored in the `sessions` collection
- Automatic cleanup of expired sessions

## Testing

### 1. Test Database Connection

```bash
# Check if MongoDB connection works
node -e "require('./src/lib/mongodb').default().then(() => console.log('Connected!'))"
```

### 2. Test Firebase Storage

```bash
# Test Firebase configuration
node -e "require('./src/lib/firebase').default.then(() => console.log('Firebase ready!'))"
```

### 3. Test API Endpoints

```bash
# Test games API
curl http://localhost:3000/api/games

# Test with search
curl "http://localhost:3000/api/games?search=mario"

# Test with pagination
curl "http://localhost:3000/api/games?page=1&limit=10"
```

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed

**Error**: `MongoServerError: bad auth`

**Solution**:

- Check MongoDB URI format
- Verify username/password
- Ensure IP is whitelisted

#### 2. Firebase Storage Upload Failed

**Error**: `Firebase Storage: User does not have permission`

**Solution**:

- Check Firebase Storage rules
- Verify Firebase configuration
- Ensure project ID is correct

#### 3. NextAuth Session Issues

**Error**: `JWT_SESSION_ERROR`

**Solution**:

- Clear browser cookies
- Restart development server
- Check NEXTAUTH_SECRET is set

#### 4. Migration Script Fails

**Error**: `ValidationError: Path 'gameBarcode' is required`

**Solution**:

- Check games.json format
- Verify all required fields are present
- Run migration with debug logging

### Debug Mode

Enable debug logging by setting:

```env
DEBUG=next-auth:*
NODE_ENV=development
```

### Logs

Check console output for:

- MongoDB connection status
- Firebase initialization
- API request/response logs
- Error details

## Production Considerations

### 1. Security

- Use strong passwords for admin accounts
- Enable MongoDB IP whitelisting
- Set up Firebase Security Rules
- Use HTTPS in production

### 2. Performance

- Monitor MongoDB query performance
- Set up database indexes
- Use Firebase CDN for images
- Implement caching strategies

### 3. Backup

- Enable MongoDB Atlas backups
- Set up Firebase Storage backups
- Regular database exports
- Monitor storage usage

### 4. Monitoring

- Set up MongoDB Atlas monitoring
- Firebase Performance Monitoring
- Error tracking (Sentry, etc.)
- Uptime monitoring

## Support

For issues or questions:

1. Check this documentation
2. Review error logs
3. Test with minimal configuration
4. Contact development team

## Changelog

### v1.0.0

- Initial MongoDB + Firebase integration
- Data migration from JSON to MongoDB
- Firebase Storage for images
- NextAuth with MongoDB sessions
- Full CRUD API with database backend
