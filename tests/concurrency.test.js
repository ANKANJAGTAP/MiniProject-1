const { MongoClient } = require('mongodb');
const { createClient } = require('@supabase/supabase-js');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER_EMAIL = 'test@example.com';
const TEST_USER_PASSWORD = 'testpassword123';

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

let testUserToken = null;
let testTurfId = null;
let testSlotId = null;

async function setupTest() {
  console.log('🔧 Setting up concurrency test...');
  
  try {
    // Sign in test user
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD
    });

    if (signInError) {
      throw signInError;
    }

    testUserToken = signInData.session.access_token;
    
    // Get a test turf
    const turfsResponse = await fetch(`${BASE_URL}/api/turfs`);
    const turfsData = await turfsResponse.json();
    
    if (!turfsData.turfs || turfsData.turfs.length === 0) {
      throw new Error('No turfs found. Please run seed script first.');
    }
    
    testTurfId = turfsData.turfs[0]._id;
    
    // Get an available slot
    const turfResponse = await fetch(`${BASE_URL}/api/turfs/${testTurfId}`);
    const turfData = await turfResponse.json();
    
    const availableSlot = turfData.turf.timeSlots?.find(slot => slot.available);
    if (!availableSlot) {
      throw new Error('No available slots found');
    }
    
    testSlotId = availableSlot.slotId;
    
    console.log('✅ Test setup complete');
    console.log(`   Turf ID: ${testTurfId}`);
    console.log(`   Slot ID: ${testSlotId}`);
    
  } catch (error) {
    console.error('❌ Test setup failed:', error);
    throw error;
  }
}

async function testConcurrentBooking() {
  console.log('\n🧪 Testing concurrent booking attempts...');
  
  const bookingData = {
    turfId: testTurfId,
    slotId: testSlotId,
    slot: {
      date: '2024-12-25',
      start: '10:00',
      end: '11:00'
    },
    amount: 800
  };

  // Create two identical booking requests
  const booking1Promise = fetch(`${BASE_URL}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${testUserToken}`
    },
    body: JSON.stringify(bookingData)
  });

  const booking2Promise = fetch(`${BASE_URL}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${testUserToken}`
    },
    body: JSON.stringify(bookingData)
  });

  try {
    // Execute both requests simultaneously
    const [response1, response2] = await Promise.all([booking1Promise, booking2Promise]);
    
    const result1 = await response1.json();
    const result2 = await response2.json();
    
    console.log('Response 1:', response1.status, result1.success ? 'SUCCESS' : result1.error);
    console.log('Response 2:', response2.status, result2.success ? 'SUCCESS' : result2.error);
    
    // Verify exactly one succeeded
    const successCount = [response1.ok, response2.ok].filter(Boolean).length;
    const conflictCount = [response1.status === 409, response2.status === 409].filter(Boolean).length;
    
    if (successCount === 1 && conflictCount === 1) {
      console.log('✅ Concurrency test PASSED: Exactly one booking succeeded, one failed with conflict');
      return true;
    } else {
      console.log(`❌ Concurrency test FAILED: ${successCount} succeeded, ${conflictCount} conflicts`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Concurrency test error:', error);
    return false;
  }
}

async function testSlotAvailabilityCheck() {
  console.log('\n🧪 Testing slot availability check...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/bookings/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        turfId: testTurfId,
        slotId: testSlotId
      })
    });
    
    const result = await response.json();
    
    if (response.ok && result.available !== undefined) {
      console.log(`✅ Slot availability check: ${result.available ? 'Available' : 'Not available'}`);
      return true;
    } else {
      console.log('❌ Slot availability check failed:', result);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Slot availability check error:', error);
    return false;
  }
}

async function runConcurrencyTests() {
  console.log('🧪 Starting Concurrency Tests...\n');

  try {
    await setupTest();
    
    const test1 = await testSlotAvailabilityCheck();
    const test2 = await testConcurrentBooking();
    
    const allPassed = test1 && test2;
    
    console.log('\n📊 Test Results:');
    console.log(`   Slot availability check: ${test1 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Concurrent booking test: ${test2 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`\n${allPassed ? '✅ All concurrency tests PASSED!' : '❌ Some tests FAILED!'}`);
    
    process.exit(allPassed ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runConcurrencyTests();
}

module.exports = { runConcurrencyTests };