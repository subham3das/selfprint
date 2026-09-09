import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const cleanDatabase = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI missing in .env');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB selfprint database...');
    await mongoose.connect(uri, { dbName: 'selfprint' });
    console.log('Connected to MongoDB.');

    const collections = await mongoose.connection.db?.collections();
    if (!collections || collections.length === 0) {
      console.log('No collections found. Database is already clean.');
    } else {
      for (const col of collections) {
        const count = await col.countDocuments();
        console.log(`Clearing collection "${col.collectionName}" (had ${count} documents)...`);
        await col.deleteMany({});
      }
      console.log('All collections have been cleaned. ZERO demo records remain in MongoDB.');
    }

    await mongoose.disconnect();
    console.log('Clean database routine finished.');
    process.exit(0);
  } catch (error) {
    console.error('Database clean error:', error);
    process.exit(1);
  }
};

cleanDatabase();
