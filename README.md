# TurfBook - QR Integration with Supabase Auth & MongoDB

A comprehensive turf booking platform with QR code integration, Supabase authentication, MongoDB Atlas backend, and real-time owner dashboard.

## ✅ Implementation Status

### Core Features Implemented
- ✅ **QR Code Integration**: Each turf has a unique QR code for quick booking
- ✅ **Supabase Authentication**: Secure email/password authentication with JWT verification
- ✅ **MongoDB Atlas Backend**: Scalable database for turfs, bookings, and profiles
- ✅ **Real-time Booking**: Live availability and instant confirmations
- ✅ **Owner Dashboard**: Real-time booking management and slot control
- ✅ **Admin Panel**: QR code regeneration and booking management
- ✅ **Atomic Reservations**: Prevents double-booking with atomic slot reservation
- ✅ **Security**: JWT middleware, role-based access, booking conflict prevention

### API Endpoints
- ✅ `GET /api/turfs` - List all turfs
- ✅ `GET /api/turfs/:id` - Get turf details
- ✅ `POST /api/turfs/:id/generate-qr` - Regenerate QR code (admin only)
- ✅ `GET /api/turfs/:id/qr` - Get QR code image (PNG/JSON)
- ✅ `GET /api/turfs/:id/verify-qr?token=<token>` - Verify QR token
- ✅ `POST /api/bookings` - Create booking (authenticated)
- ✅ `GET /api/bookings` - Get user bookings (authenticated)
- ✅ `POST /api/bookings/check` - Check slot availability
- ✅ `PATCH /api/bookings/:id/status` - Owner accepts/rejects bookings
- ✅ `GET /api/owner/profile` - Owner profile management
- ✅ `GET /api/owner/bookings` - Owner booking dashboard
- ✅ `PATCH /api/turfs/:id/slots/:slotId` - Owner slot management
- ✅ `POST /api/auth/verify` - Verify Supabase JWT (debug)

## Environment Setup

### Required Environment Variables

Create a `.env` file in the project root:

```env
# MongoDB Atlas (provided)
MONGODB_URI="mongodb+srv://ankanjagtap2005_db_user:Ankan21manan27%23@miniprojectcluster0.h4ksaht.mongodb.net/?retryWrites=true&w=majority&appName=MiniProjectCluster0"

# Supabase (create a project at https://supabase.com)
SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"  # SERVER ONLY
SUPABASE_ANON_KEY="your-anon-key"

# Next.js Public Environment Variables
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Application Configuration
FRONTEND_HOST="http://localhost:3000"
CORS_ORIGINS="http://localhost:3000"
QR_DUMMY_URL="/images/qr_dummy.png"

# Admin Configuration
ADMIN_EMAILS="admin1@example.com,admin2@example.com"

# Optional: Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

### Supabase Setup

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization and set project details

2. **Get API Keys**:
   - Go to Settings > API
   - Copy the Project URL to `SUPABASE_URL`
   - Copy the `anon public` key to `SUPABASE_ANON_KEY`
   - Copy the `service_role secret` key to `SUPABASE_SERVICE_ROLE_KEY`

3. **Configure Authentication**:
   - Go to Authentication > Settings
   - Disable email confirmation for development: `Enable email confirmations = false`
   - Set Site URL to `http://localhost:3000`

## Installation & Setup

```bash
# Install dependencies
npm install

# Run database migration (important!)
npm run migrate

# Create admin user (optional)
node scripts/create-admin-user.js create admin@example.com password123

# Seed sample turfs
npm run seed

# Start development server
npm run dev
```

## Database Collections

### users
```javascript
{
  _id: ObjectId,
  supabase_id: String,    // Maps to Supabase user ID
  name: String,
  email: String,
  role: String,           // 'player' or 'owner'
  phone: String,          // Optional
  profilePhotoUrl: String, // Optional
  createdAt: Date,
  lastActive: Date
}
```

### turfs
```javascript
{
  _id: ObjectId,
  ownerId: ObjectId,      // Reference to users collection
  name: String,
  address: String,
  pricePerHour: Number,
  images: [String],
  availableSports: [String],
  amenities: [String],
  operatingHours: { open: String, close: String },
  timeSlots: [{
    slotId: String,       // Unique slot identifier
    startISO: String,     // HH:MM format
    endISO: String,       // HH:MM format
    price: Number,
    available: Boolean
  }],
  qrToken: String,        // Unique token for QR verification
  qrUrl: String,          // Optional: persisted QR URL
  createdAt: Date,
  updatedAt: Date
}
```

### bookings
```javascript
{
  _id: ObjectId,
  turfId: ObjectId,       // Reference to turf
  playerId: ObjectId,     // Reference to users collection
  ownerId: ObjectId,      // Reference to users collection
  slotId: String,         // Reference to turf timeSlot
  slot: { 
    date: String,         // YYYY-MM-DD format
    start: String,        // HH:MM format
    end: String           // HH:MM format
  },
  startTime: Date,        // Full datetime
  endTime: Date,          // Full datetime
  amount: Number,
  status: String,         // 'pending', 'confirmed', 'cancelled', 'completed'
  paymentId: String,      // Optional: payment reference
  createdAt: Date,
  qrUsed: Boolean,        // Whether booking was made via QR code
  qrImageUrl: String      // QR dummy image URL
}
```

## Owner Dashboard Features

### Real-time Booking Management
- ✅ Live booking notifications (10-second polling)
- ✅ Accept/Reject pending bookings
- ✅ Mark bookings as completed
- ✅ View player contact information

### Slot Management
- ✅ Edit time slot availability
- ✅ Update pricing per slot
- ✅ Prevent conflicts with existing bookings
- ✅ Atomic slot reservation system

### Access Control
- ✅ Owner-only dashboard access
- ✅ Role-based API endpoints
- ✅ Secure JWT verification

## QR Code Flow

1. **QR Generation**: Each turf has a unique `qrToken` (UUID)
2. **QR Content**: `${FRONTEND_HOST}/book/${turfId}?qrToken=${qrToken}`
3. **Scanning Flow**:
   - User scans QR → Opens booking page
   - Client calls `/api/turfs/:id/verify-qr?token=...` to validate
   - If valid, booking form is prefilled
   - User must login and confirm booking
4. **Security**: QR usage is tracked; regenerating invalidates old tokens

## API Testing

### Concurrency Testing
```bash
# Test atomic booking reservations
npm run test-concurrency
```

### Run Automated Tests
```bash
# Run API tests
node tests/api.test.js
```

### Manual Testing with cURL

See [curl-examples.md](curl-examples.md) for complete cURL examples.

**Quick Test Sequence:**
```bash
# 1. Get turfs and extract ID
curl http://localhost:3000/api/turfs

# 2. Get QR code
curl http://localhost:3000/api/turfs/TURF_ID/qr -H "Accept: application/json"

# 3. Verify QR token
curl "http://localhost:3000/api/turfs/TURF_ID/verify-qr?token=QR_TOKEN"

# 4. Create booking (requires auth token)
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer SUPABASE_JWT" \
  -H "Content-Type: application/json" \
  -d '{"turfId":"TURF_ID","slotId":"SLOT_ID","slot":{"date":"2024-12-25","start":"10:00","end":"11:00"},"amount":800}'

# 5. Owner accepts booking
curl -X PATCH http://localhost:3000/api/bookings/BOOKING_ID/status \
  -H "Authorization: Bearer OWNER_JWT" \
  -H "Content-Type: application/json" \
  -d '{"status":"confirmed"}'
```

## Admin Management

### Create Admin User
```bash
# Create new admin user
node scripts/create-admin-user.js create admin@example.com password123

# Update existing user to admin
node scripts/create-admin-user.js update user@example.com
```

### Admin Features
- QR code regeneration
- View all bookings
- Owner dashboard access
- Access to admin-only endpoints

## Owner Features

### Dashboard Access
- Real-time booking notifications
- Accept/reject booking requests
- Manage time slot availability
- View player contact information

### Slot Management
- Edit slot times and pricing
- Enable/disable slot availability
- Prevent conflicts with existing bookings

## Security Features

- **JWT Verification**: All protected endpoints verify Supabase JWTs
- **Role-Based Access**: Player/Owner/Admin role checking
- **Atomic Reservations**: Prevents double-booking with atomic operations
- **QR Token Security**: Tokens are UUIDs, regeneration invalidates old tokens
- **CORS Protection**: Configurable allowed origins
- **Rate Limiting**: Basic rate limiting for sensitive endpoints

## Frontend Integration

### QR Code Display
- Shows on turf detail pages
- Download as PNG functionality
- Admin regeneration controls
- Click to open booking URL

### Booking Flow
- QR token validation on page load
- Prefilled booking form for valid tokens
- Required user authentication
- Explicit booking confirmation
- Success feedback and booking details

## Testing Checklist

### Manual Verification Steps

1. **Database Migration**:
   - ✅ Run `npm run migrate` to update schema
   - ✅ Verify users, turfs, and bookings collections
   - ✅ Check indexes are created properly

2. **Owner Dashboard**:
   - ✅ Owner can login and access dashboard
   - ✅ Real-time booking updates appear
   - ✅ Accept/reject functionality works
   - ✅ Slot management prevents conflicts

3. **Atomic Reservations**:
   - ✅ Concurrent booking attempts handled correctly
   - ✅ Only one booking succeeds per slot
   - ✅ Failed bookings return 409 conflict
   - ✅ Slot availability updates atomically

1. **QR Generation & Display**:
   - ✅ QR code appears on turf detail page
   - ✅ Download QR as PNG works
   - ✅ QR contains correct booking URL with token

2. **QR Scanning Flow**:
   - ✅ Scanning QR opens booking page with correct turf
   - ✅ Token validation works (valid tokens accepted)
   - ✅ Invalid tokens are rejected gracefully
   - ✅ Booking form is prefilled correctly

3. **Authentication**:
   - ✅ User registration and login work
   - ✅ JWT tokens are properly verified server-side
   - ✅ Unauthenticated requests are rejected (401)
   - ✅ Admin-only endpoints check permissions (403)

4. **Booking System**:
   - ✅ Bookings are created and stored in MongoDB
   - ✅ Slot conflicts are prevented (409 error)
   - ✅ QR usage is tracked (`qrUsed` flag)
   - ✅ User profiles are created automatically

5. **Admin Features**:
   - ✅ QR regeneration works (admin only)
   - ✅ Old tokens are invalidated after regeneration
   - ✅ Admin role checking works

## Deployment Notes

### Production Environment
1. Update `FRONTEND_HOST` to production URL
2. Add production domain to `CORS_ORIGINS`
3. Rotate MongoDB and Supabase credentials
4. Set up proper environment variable management
5. Configure rate limiting and monitoring

### Security Checklist
- ✅ `.env` file is gitignored
- ✅ `SUPABASE_SERVICE_ROLE_KEY` is server-only
- ✅ No secrets in client bundle
- ✅ JWT verification on all protected endpoints
- ✅ Admin role verification
- ✅ CORS configuration
- ✅ Rate limiting ready

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**:
   - Ensure all Supabase env vars are set correctly
   - Check both server and client env vars

2. **"MongoDB connection failed"**:
   - Verify `MONGODB_URI` is correct
   - Check network connectivity
   - Ensure MongoDB Atlas allows connections

3. **"QR code not loading"**:
   - Check if turf has `qrToken` in database
   - Verify QR endpoint is accessible
   - Check browser console for errors

4. **"Booking creation failed"**:
   - Ensure user is authenticated
   - Check slot format (date: YYYY-MM-DD, time: HH:MM)
   - Verify no slot conflicts exist

### Debug Commands
```bash
# Run database migration
npm run migrate

# Test concurrent bookings
npm run test-concurrency

# Test MongoDB connection
curl http://localhost:3000/api/test-mongo

# Verify JWT token
curl -X POST http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check turf data
curl http://localhost:3000/api/turfs/TURF_ID
```

## Development Tools

- **Migration Script**: `scripts/migrate-database.js`
- **Concurrency Tests**: `tests/concurrency.test.js`
- **Postman Collection**: Import `postman-collection.json`
- **cURL Examples**: See `curl-examples.md`
- **Admin Scripts**: `scripts/create-admin-user.js`
- **Test Suite**: `tests/api.test.js`

---

## 🚀 Quick Start Summary

1. Create Supabase project and add credentials to `.env`
2. Run `npm install && npm run migrate && npm run seed`
3. Start with `npm run dev`
4. Create admin user: `node scripts/create-admin-user.js create admin@example.com password123`
5. Test owner dashboard: Login as owner → view bookings → manage slots
6. Test QR flow: Visit turf detail page → scan QR → book slot
7. Test concurrency: `npm run test-concurrency`
