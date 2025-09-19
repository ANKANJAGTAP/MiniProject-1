// For Next.js Pages Router (/pages/api/users.ts)
import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
const client = new MongoClient(uri);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      await client.connect();
      const database = client.db('turf_booking');
      const users = database.collection('users');
      
      const userData = req.body;
      
      // Check if user already exists
      const existingUser = await users.findOne({ 
        $or: [{ email: userData.email }, { uid: userData.uid }] 
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      // Insert new user
      const result = await users.insertOne(userData);
      
      res.status(201).json({ 
        message: 'User created successfully', 
        id: result.insertedId 
      });
    } catch (error) {
      console.error('Error saving user to MongoDB:', error);
      res.status(500).json({ message: 'Internal server error' });
    } finally {
      await client.close();
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}