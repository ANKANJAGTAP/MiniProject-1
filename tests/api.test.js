const { MongoClient } = require('mongodb');
const { createClient } = require('@supabase/supabase-js');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER_EMAIL = 'test@example.com';
const TEST_USER_PASSWORD = 'testpassword123';
const TEST_ADMIN_EMAIL = 'admin@example.com';

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

let testUserId = null;
let testUserToken = null;
let testTurfId = null;

async function runTests() {
  console.log('🧪 Starting API Tests...\n');

  try {
    // Test 1: Create test user and login
    await testUserAuth();
    
    // Test 2: Test turfs endpoints
    await testTurfsEndpoints();
    
    // Test 3: Test QR generation and verification
    await testQREndpoints();
    
    // Test 4: Test booking endpoints
    await testBookingEndpoints();
    
    console.log('✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

async function testUserAuth() {
  console.log('📝 Testing User Authentication...');
  
  try {
    // Sign up test user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      options: {
        data: {
          name: 'Test User'
        }
      }
    });

    if (signUpError && !signUpError.message.includes('already registered')) {
      throw signUpError;
    }

    // Sign in test user
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD
    });

    if (signInError) {
      throw signInError;
    }

    testUserId = signInData.user.id;
    testUserToken = signInData.session.access_token;
    
    console.log('✅ User authentication successful');
    console.log(`   User ID: ${testUserId}`);
    
  } catch (error) {
    console.error('❌ User authentication failed:', error);
    throw error;
  }
}

async function testTurfsEndpoints() {
  console.log('\n🏟️  Testing Turfs Endpoints...');
  
  try {
    // Test GET /api/turfs
    const turfsResponse = await fetch(`${BASE_URL}/api/turfs`);
    const turfsData = await turfsResponse.json();
    
    if (!turfsResponse.ok) {
      throw new Error(`GET /api/turfs failed: ${turfsData.error}`);
    }
    
    if (!turfsData.turfs || turfsData.turfs.length === 0) {
      throw new Error('No turfs found. Please run seed script first.');
    }
    
    testTurfId = turfsData.turfs[0]._id;
    console.log('✅ GET /api/turfs successful');
    console.log(`   Found ${turfsData.turfs.length} turfs`);
    console.log(`   Test turf ID: ${testTurfId}`);
    
    // Test GET /api/turfs/:id
    const turfResponse = await fetch(`${BASE_URL}/api/turfs/${testTurfId}`);
    const turfData = await turfResponse.json();
    
    if (!turfResponse.ok) {
      throw new Error(`GET /api/turfs/${testTurfId} failed: ${turfData.error}`);
    }
    
    console.log('✅ GET /api/turfs/:id successful');
    console.log(`   Turf name: ${turfData.turf.name}`);
    
  } catch (error) {
    console.error('❌ Turfs endpoints test failed:', error);
    throw error;
  }
}

async function testQREndpoints() {
  console.log('\n📱 Testing QR Endpoints...');
  
  try {
    // Test GET /api/turfs/:id/qr (JSON)
    const qrJsonResponse = await fetch(`${BASE_URL}/api/turfs/${testTurfId}/qr`, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!qrJsonResponse.ok) {
      throw new Error(`GET /api/turfs/${testTurfId}/qr (JSON) failed`);
    }
    
    const qrJsonData = await qrJsonResponse.json();
    console.log('✅ GET /api/turfs/:id/qr (JSON) successful');
    console.log(`   QR URL: ${qrJsonData.qrUrl}`);
    
    // Test GET /api/turfs/:id/qr (PNG)
    const qrPngResponse = await fetch(`${BASE_URL}/api/turfs/${testTurfId}/qr`);
    
    if (!qrPngResponse.ok) {
      throw new Error(`GET /api/turfs/${testTurfId}/qr (PNG) failed`);
    }
    
    const contentType = qrPngResponse.headers.get('content-type');
    if (!contentType?.includes('image/png')) {
      throw new Error('QR endpoint did not return PNG image');
    }
    
    console.log('✅ GET /api/turfs/:id/qr (PNG) successful');
    
    // Extract token from QR URL for verification test
    const qrUrl = qrJsonData.qrUrl;
    const tokenMatch = qrUrl.match(/qrToken=([^&]+)/);
    if (!tokenMatch) {
      throw new Error('Could not extract QR token from URL');
    }
    
    const qrToken = tokenMatch[1];
    
    // Test GET /api/turfs/:id/verify-qr
    const verifyResponse = await fetch(`${BASE_URL}/api/turfs/${testTurfId}/verify-qr?token=${qrToken}`);
    const verifyData = await verifyResponse.json();
    
    if (!verifyResponse.ok || !verifyData.valid) {
      throw new Error(`QR token verification failed: ${verifyData.error}`);
    }
    
    console.log('✅ GET /api/turfs/:id/verify-qr successful');
    console.log(`   Token valid: ${verifyData.valid}`);
    
    // Test invalid token
    const invalidVerifyResponse = await fetch(`${BASE_URL}/api/turfs/${testTurfId}/verify-qr?token=invalid-token`);
    const invalidVerifyData = await invalidVerifyResponse.json();
    
    if (invalidVerifyResponse.ok || invalidVerifyData.valid) {
      throw new Error('Invalid token was incorrectly validated');
    }
    
    console.log('✅ Invalid token correctly rejected');
    
  } catch (error) {
    console.error('❌ QR endpoints test failed:', error);
    throw error;
  }
}

async function testBookingEndpoints() {
  console.log('\n📅 Testing Booking Endpoints...');
  
  try {
    // Test POST /api/bookings (without auth - should fail)
    const unauthBookingResponse = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        turfId: testTurfId,
        slot: { date: '2024-12-25', start: '10:00', end: '11:00' },
        amount: 800
      })
    });
    
    if (unauthBookingResponse.ok) {
      throw new Error('Unauthenticated booking request should have failed');
    }
    
    console.log('✅ Unauthenticated booking correctly rejected');
    
    // Test POST /api/bookings (with auth)
    const bookingResponse = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testUserToken}`
      },
      body: JSON.stringify({
        turfId: testTurfId,
        slot: { 
          date: '2024-12-25', 
          start: '10:00', 
          end: '11:00' 
        },
        amount: 800,
        qrUsed: true
      })
    });
    
    const bookingData = await bookingResponse.json();
    
    if (!bookingResponse.ok) {
      throw new Error(`Booking creation failed: ${bookingData.error}`);
    }
    
    console.log('✅ POST /api/bookings successful');
    console.log(`   Booking ID: ${bookingData.bookingId}`);
    console.log(`   QR Used: ${bookingData.booking.qrUsed}`);
    
    // Test duplicate booking (should fail)
    const duplicateBookingResponse = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testUserToken}`
      },
      body: JSON.stringify({
        turfId: testTurfId,
        slot: { 
          date: '2024-12-25', 
          start: '10:00', 
          end: '11:00' 
        },
        amount: 800
      })
    });
    
    if (duplicateBookingResponse.ok) {
      throw new Error('Duplicate booking should have been rejected');
    }
    
    console.log('✅ Duplicate booking correctly rejected');
    
    // Test GET /api/bookings
    const getBookingsResponse = await fetch(`${BASE_URL}/api/bookings?userId=${testUserId}`, {
      headers: {
        'Authorization': `Bearer ${testUserToken}`
      }
    });
    
    const getBookingsData = await getBookingsResponse.json();
    
    if (!getBookingsResponse.ok) {
      throw new Error(`Get bookings failed: ${getBookingsData.error}`);
    }
    
    console.log('✅ GET /api/bookings successful');
    console.log(`   Found ${getBookingsData.bookings.length} bookings`);
    
  } catch (error) {
    console.error('❌ Booking endpoints test failed:', error);
    throw error;
  }
}

// Run tests if called directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };