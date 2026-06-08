import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

let isFallbackMode = false;
const DATA_DIR = path.resolve('data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hostel-db', {
      serverSelectionTimeoutMS: 3000 // Timeout fast so we can switch to fallback mode
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    isFallbackMode = false;
  } catch (error) {
    console.warn('⚠️ MongoDB Connection Failed. Switching to JSON File-based Database Fallback!');
    isFallbackMode = true;
    initializeJsonDb();
  }
};

export const getDbMode = () => {
  return isFallbackMode ? 'fallback' : 'mongodb';
};

// Initialize JSON files if they do not exist
const initializeJsonDb = () => {
  const collections = ['users', 'students', 'rooms', 'fees', 'attendances', 'complaints', 'visitors', 'notifications'];
  collections.forEach(col => {
    const filePath = path.join(DATA_DIR, `${col}.json`);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    }
  });
  console.log('📂 JSON Database Fallback Initialized in:', DATA_DIR);
};

// Generic JSON database operations
export const jsonDb = {
  read: (collection) => {
    const filePath = path.join(DATA_DIR, `${collection}.json`);
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      return [];
    }
  },
  write: (collection, data) => {
    const filePath = path.join(DATA_DIR, `${collection}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }
};
