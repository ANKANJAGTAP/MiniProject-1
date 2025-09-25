const { MongoClient, ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Please set MONGODB_URI environment variable');
  process.exit(1);
}

async function migrateDatabase() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('turfbook');
    
    // 1. Migrate users collection
    console.log('\n1. Migrating users collection...');
    const users = await db.collection('users').find({}).toArray();
    
    for (const user of users) {
      const updates = {};
      
      // Add supabase_id if missing
      if (!user.supabase_id && user.supabaseUserId) {
        updates.supabase_id = user.supabaseUserId;
      }
      
      // Add role if missing
      if (!user.role) {
        updates.role = 'player'; // Default to player
      }
      
      // Add email if missing
      if (!user.email && user.supabase_id) {
        updates.email = `user_${user.supabase_id}@example.com`;
      }
      
      if (Object.keys(updates).length > 0) {
        await db.collection('users').updateOne(
          { _id: user._id },
          { $set: updates }
        );
        console.log(`Updated user ${user._id}`);
      }
    }
    
    // 2. Migrate turfs collection
    console.log('\n2. Migrating turfs collection...');
    const turfs = await db.collection('turfs').find({}).toArray();
    
    for (const turf of turfs) {
      const updates = {};
      
      // Add ownerId if missing (assign to first owner or create dummy)
      if (!turf.ownerId) {
        const owner = await db.collection('users').findOne({ role: 'owner' });
        if (owner) {
          updates.ownerId = owner._id;
        } else {
          // Create a dummy owner
          const dummyOwner = await db.collection('users').insertOne({
            supabase_id: `dummy_owner_${Date.now()}`,
            name: 'Turf Owner',
            email: `owner_${Date.now()}@example.com`,
            role: 'owner',
            createdAt: new Date()
          });
          updates.ownerId = dummyOwner.insertedId;
        }
      }
      
      // Rename location to address
      if (turf.location && !turf.address) {
        updates.address = turf.location;
        updates.$unset = { location: 1 };
      }
      
      // Add timeSlots if missing
      if (!turf.timeSlots || turf.timeSlots.length === 0) {
        const slots = [];
        // Generate default time slots from 6 AM to 11 PM
        for (let hour = 6; hour < 23; hour++) {
          slots.push({
            slotId: uuidv4(),
            startISO: `${hour.toString().padStart(2, '0')}:00`,
            endISO: `${(hour + 1).toString().padStart(2, '0')}:00`,
            price: turf.pricePerHour || 500,
            available: true
          });
        }
        updates.timeSlots = slots;
      }
      
      if (Object.keys(updates).length > 0) {
        const updateDoc = updates.$unset ? 
          { $set: { ...updates, $unset: undefined }, $unset: updates.$unset } :
          { $set: updates };
        
        await db.collection('turfs').updateOne(
          { _id: turf._id },
          updateDoc
        );
        console.log(`Updated turf ${turf._id}`);
      }
    }
    
    // 3. Migrate bookings collection
    console.log('\n3. Migrating bookings collection...');
    const bookings = await db.collection('bookings').find({}).toArray();
    
    for (const booking of bookings) {
      const updates = {};
      
      // Convert userId to playerId
      if (booking.userId && !booking.playerId) {
        const player = await db.collection('users').findOne({ supabase_id: booking.userId });
        if (player) {
          updates.playerId = player._id;
        }
      }
      
      // Add ownerId
      if (!booking.ownerId && booking.turfId) {
        const turf = await db.collection('turfs').findOne({ _id: booking.turfId });
        if (turf && turf.ownerId) {
          updates.ownerId = turf.ownerId;
        }
      }
      
      // Add slotId if missing
      if (!booking.slotId) {
        updates.slotId = uuidv4();
      }
      
      // Add startTime and endTime
      if (!booking.startTime && booking.slot) {
        updates.startTime = new Date(`${booking.slot.date}T${booking.slot.start}:00`);
        updates.endTime = new Date(`${booking.slot.date}T${booking.slot.end}:00`);
      }
      
      // Add qrImageUrl if missing
      if (!booking.qrImageUrl) {
        updates.qrImageUrl = '/images/qr_dummy.png';
      }
      
      if (Object.keys(updates).length > 0) {
        await db.collection('bookings').updateOne(
          { _id: booking._id },
          { $set: updates }
        );
        console.log(`Updated booking ${booking._id}`);
      }
    }
    
    // 4. Create indexes
    console.log('\n4. Creating indexes...');
    
    // Users indexes
    await db.collection('users').createIndex({ supabase_id: 1 }, { unique: true });
    await db.collection('users').createIndex({ email: 1 });
    await db.collection('users').createIndex({ role: 1 });
    
    // Turfs indexes
    await db.collection('turfs').createIndex({ ownerId: 1 });
    await db.collection('turfs').createIndex({ 'timeSlots.slotId': 1 });
    
    // Bookings indexes
    await db.collection('bookings').createIndex({ playerId: 1 });
    await db.collection('bookings').createIndex({ ownerId: 1 });
    await db.collection('bookings').createIndex({ turfId: 1, slotId: 1 });
    await db.collection('bookings').createIndex({ status: 1 });
    await db.collection('bookings').createIndex({ createdAt: -1 });
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await client.close();
  }
}

migrateDatabase();