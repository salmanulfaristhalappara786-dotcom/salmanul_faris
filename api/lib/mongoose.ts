import mongoose from 'mongoose';

const MONGODB_URI = process.env.VITE_MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('Please define the VITE_MONGODB_URI environment variable inside .env');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB Connected successfully');
      return mongoose;
    }).catch((err) => {
      console.error('MongoDB Connection Error:', err);
      throw err;
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Reset promise so we can retry
    throw e;
  }
  return cached.conn;
}

export default dbConnect;
