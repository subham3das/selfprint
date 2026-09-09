import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { seedSuperAdmin } from '../src/database/seeds/superAdmin.seed';

dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI missing in .env');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB selfprint database...');
    await mongoose.connect(uri, { dbName: 'selfprint' });
    console.log('Connected to MongoDB.');

    await seedSuperAdmin();

    await mongoose.disconnect();
    console.log('Database disconnected. Seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error('Super Admin seed error:', error);
    process.exit(1);
  }
};

run();
