# TurfBook - QR Integration with Supabase Auth & MongoDB

A comprehensive turf booking platform with QR code integration, Supabase authentication, and MongoDB Atlas backend.

## Features

- **QR Code Integration**: Each turf has a unique QR code for quick booking
- **Supabase Authentication**: Secure email/password authentication
- **MongoDB Atlas**: Scalable database for turfs, bookings, and profiles
- **Real-time Booking**: Live availability and instant confirmations
- **Admin Panel**: QR code regeneration and booking management

## Environment Setup

Create a `.env` file in the project root with the following variables:

```env
# MongoDB Atlas (provided)
MONGODB_URI="mongodb+srv://ankanjagtap2005_db_user:Ankan21manan27%23@miniprojectcluster0.h4ksaht.mongodb.net/?retryWrites=true&w=majority&appName=MiniProjectCluster0"

# Supabase (create a project at https://supabase.com)
SUPABASE_URL="https://your-supabase-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
SUPABASE_ANON_KEY="your-supabase-anon-key"

# Frontend host
FRONTEND_HOST="http://localhost:3000"

# CORS origins
CORS_ORIGINS="http://localhost:3000,https://your-production-domain.com"

# Admin emails (comma separated)
ADMIN_EMAILS="admin1@example.com,admin2@example.com"

# Optional: Rate limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API
3. Copy the Project URL to `SUPABASE_URL`
4. Copy the `anon public` key to `SUPABASE_ANON_KEY`
5. Copy the `service_role secret` key to `SUPABASE_SERVICE_ROLE_KEY`

## Installation & Setup

```bash
# Install dependencies
npm install

# Seed sample turfs (optional)
node scripts/seed-turfs.js

# Start development server
npm run dev
```

## API Endpoints

### Turfs
- `GET /api/turfs` - List all turfs
- `GET /api/turfs/:id` - Get turf details
- `POST /api/turfs/:id/generate-qr` - Regenerate QR code (admin only)
- `GET /api/turfs/:id/qr` - Get QR code image
- `GET /api/turfs/:id/verify-qr?token=<token>` - Verify QR token

### Bookings
- `POST /api/bookings` - Create booking (authenticated)
- `GET /api/bookings?userId=<id>` - Get user bookings (authenticated)

### Authentication
- `POST /api/auth/verify` - Verify Supabase JWT

## QR Code Flow

1. Each turf has a unique QR token
2. QR codes encode: `${FRONTEND_HOST}/book/${turfId}?qrToken=${qrToken}`
3. Scanning opens booking page with prefilled data
4. User must login and confirm booking
5. QR usage is tracked in booking records

## Database Collections

### turfs
```javascript
{
  _id: ObjectId,
  name: String,
  location: String,
  pricePerHour: Number,
  images: [String],
  availableSports: [String],
  amenities: [String],
  operatingHours: { open: String, close: String },
  qrToken: String,
  qrUrl: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### bookings
```javascript
{
  _id: ObjectId,
  turfId: ObjectId,
  userId: String, // Supabase user ID
  slot: { date: String, start: String, end: String },
  amount: Number,
  status: String, // 'pending', 'confirmed', 'cancelled'
  paymentId: String (optional),
  createdAt: Date,
  qrUsed: Boolean
}
```

### profiles
```javascript
{
  _id: ObjectId,
  supabaseUserId: String,
  name: String,
  phone: String,
  createdAt: Date
}
```

## Testing Examples

### Create Booking (cURL)
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT" \
  -d '{
    "turfId": "TURF_OBJECT_ID",
    "slot": {
      "date": "2024-01-15",
      "start": "10:00",
      "end": "11:00"
    },
    "amount": 800,
    "qrUsed": true
  }'
```

### Generate QR Code (cURL)
```bash
curl -X POST http://localhost:3000/api/turfs/TURF_ID/generate-qr \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT"
```

### Verify QR Token (cURL)
```bash
curl "http://localhost:3000/api/turfs/TURF_ID/verify-qr?token=QR_TOKEN"
```

## Security Features

- JWT verification for all authenticated endpoints
- Admin-only endpoints protected by email whitelist
- CORS protection
- Rate limiting
- QR token validation
- Booking conflict prevention

## Manual Testing Checklist

- [ ] QR code scanning opens booking page with correct turf
- [ ] QR token validation works correctly
- [ ] User authentication via Supabase
- [ ] Booking creation with MongoDB storage
- [ ] QR regeneration invalidates old tokens
- [ ] Admin endpoints reject non-admin users
- [ ] Unauthenticated booking attempts return 401
- [ ] Slot conflict prevention works

## Production Deployment

1. Update `FRONTEND_HOST` to production URL
2. Add production domain to `CORS_ORIGINS`
3. Rotate MongoDB and Supabase credentials
4. Set up proper environment variable management
5. Configure rate limiting and monitoring

## Security Notes

⚠️ **Important**: 
- Never commit `.env` files to version control
- Rotate credentials if shared publicly
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only
- Use environment variable management in production