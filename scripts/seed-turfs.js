const { MongoClient, ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Please set MONGODB_URI environment variable');
  process.exit(1);
}

const sampleTurfs = [
  {
    name: 'Green Field Sports Complex',
    location: 'Sangli Central',
    pricePerHour: 800,
    images: [
      'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg',
      'https://images.pexels.com/photos/2207/field-sport-game-stadium.jpg',
      'https://images.pexels.com/photos/163308/cricket-ground-sport-game-163308.jpeg',
    ],
    availableSports: ['Football', 'Cricket'],
    amenities: ['Floodlights', 'Parking', 'Washroom', 'Equipment'],
    operatingHours: {
      open: '06:00',
      close: '23:00'
    },
    qrToken: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Victory Sports Arena',
    location: 'Miraj Station Road',
    pricePerHour: 600,
    images: [
      'https://images.pexels.com/photos/2207/field-sport-game-stadium.jpg',
      'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg',
    ],
    availableSports: ['Football', 'Basketball'],
    amenities: ['AC', 'Cafeteria', 'Equipment'],
    operatingHours: {
      open: '05:00',
      close: '24:00'
    },
    qrToken: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Champions Cricket Ground',
    location: 'Sangli MIDC',
    pricePerHour: 1000,
    images: [
      'https://images.pexels.com/photos/163308/cricket-ground-sport-game-163308.jpeg',
      'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg',
    ],
    availableSports: ['Cricket'],
    amenities: ['Scoreboard', 'Parking', 'Equipment'],
    operatingHours: {
      open: '06:00',
      close: '22:00'
    },
    qrToken: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedTurfs() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('turfbook');
    const turfsCollection = db.collection('turfs');
    
    // Clear existing turfs
    await turfsCollection.deleteMany({});
    console.log('Cleared existing turfs');
    
    // Insert sample turfs
    const result = await turfsCollection.insertMany(sampleTurfs);
    console.log(`Inserted ${result.insertedCount} turfs`);
    
    // Print the inserted turfs with their IDs
    const insertedTurfs = await turfsCollection.find({}).toArray();
    console.log('\nInserted turfs:');
    insertedTurfs.forEach(turf => {
      console.log(`- ${turf.name} (ID: ${turf._id})`);
      console.log(`  QR Token: ${turf.qrToken}`);
      console.log(`  QR URL: http://localhost:3000/book/${turf._id}?qrToken=${turf.qrToken}`);
    });
    
  } catch (error) {
    console.error('Error seeding turfs:', error);
  } finally {
    await client.close();
  }
}

seedTurfs();