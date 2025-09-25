# TurfBook API - cURL Examples

## Environment Variables
```bash
export BASE_URL="http://localhost:3000"
export SUPABASE_TOKEN="your-supabase-access-token"
export TURF_ID="your-turf-object-id"
export QR_TOKEN="your-qr-token"
```

## 1. Get All Turfs
```bash
curl -X GET "${BASE_URL}/api/turfs" \
  -H "Content-Type: application/json"
```

## 2. Get Turf by ID
```bash
curl -X GET "${BASE_URL}/api/turfs/${TURF_ID}" \
  -H "Content-Type: application/json"
```

## 3. Generate QR Code (Admin Only)
```bash
curl -X POST "${BASE_URL}/api/turfs/${TURF_ID}/generate-qr" \
  -H "Authorization: Bearer ${SUPABASE_TOKEN}" \
  -H "Content-Type: application/json"
```

## 4. Get QR Code as JSON (Data URL)
```bash
curl -X GET "${BASE_URL}/api/turfs/${TURF_ID}/qr" \
  -H "Accept: application/json"
```

## 5. Download QR Code as PNG
```bash
curl -X GET "${BASE_URL}/api/turfs/${TURF_ID}/qr" \
  -H "Accept: image/png" \
  -o "turf_qr_code.png"
```

## 6. Verify QR Token
```bash
curl -X GET "${BASE_URL}/api/turfs/${TURF_ID}/verify-qr?token=${QR_TOKEN}" \
  -H "Content-Type: application/json"
```

## 7. Create Booking
```bash
curl -X POST "${BASE_URL}/api/bookings" \
  -H "Authorization: Bearer ${SUPABASE_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "turfId": "'${TURF_ID}'",
    "slotId": "slot_123",
    "slot": {
      "date": "2024-12-25",
      "start": "10:00",
      "end": "11:00"
    },
    "amount": 800,
    "qrUsed": true
  }'
```
# 5. Check slot availability
curl -X POST "${BASE_URL}/api/bookings/check" \
  -H "Content-Type: application/json" \
  -d '{
    "turfId": "'${TURF_ID}'",
    "slotId": "slot_123"
  }'

# 6. Owner accepts booking
curl -X PATCH "${BASE_URL}/api/bookings/BOOKING_ID/status" \
  -H "Authorization: Bearer ${OWNER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed"
  }'

# 7. Get owner bookings
curl -X GET "${BASE_URL}/api/owner/bookings" \
  -H "Authorization: Bearer ${OWNER_TOKEN}"

# 8. Update time slot
curl -X PATCH "${BASE_URL}/api/turfs/${TURF_ID}/slots/slot_123" \
  -H "Authorization: Bearer ${OWNER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 900,
    "available": true
  }'


## 8. Get User Bookings
```bash
curl -X GET "${BASE_URL}/api/bookings" \
  -H "Authorization: Bearer ${SUPABASE_TOKEN}" \
  -H "Content-Type: application/json"
```

## 9. Verify JWT Token (Debug)
```bash
curl -X POST "${BASE_URL}/api/auth/verify" \
  -H "Authorization: Bearer ${SUPABASE_TOKEN}" \
  -H "Content-Type: application/json"
```

## Example Responses

### Get All Turfs Response
```json
{
  "turfs": [
    {
      "_id": "674a1234567890abcdef1234",
      "name": "Green Field Sports Complex",
      "location": "Sangli Central",
      "pricePerHour": 800,
      "qrToken": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "availableSports": ["Football", "Cricket"],
      "amenities": ["Floodlights", "Parking", "Washroom"]
    }
  ]
}
```

### Create Booking Response
```json
{
  "success": true,
  "bookingId": "674a1234567890abcdef5678",
  "booking": {
    "_id": "674a1234567890abcdef5678",
    "turfId": "674a1234567890abcdef1234",
    "userId": "user-uuid-from-supabase",
    "slot": {
      "date": "2024-12-25",
      "start": "10:00",
      "end": "11:00"
    },
    "amount": 800,
    "status": "confirmed",
    "qrUsed": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### QR Verification Response
```json
{
  "valid": true,
  "turf": {
    "_id": "674a1234567890abcdef1234",
    "name": "Green Field Sports Complex",
    "location": "Sangli Central",
    "pricePerHour": 800
  }
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden (Admin Required)
```json
{
  "error": "Admin access required"
}
```

### 409 Conflict (Slot Already Booked)
```json
{
  "error": "Slot already booked",
  "conflictingBooking": "674a1234567890abcdef9999"
}
```

### 404 Not Found
```json
{
  "error": "Turf not found"
}
```