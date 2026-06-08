import dotenv from 'dotenv';
import app, { seedAdmin } from './app.js';
import { connectDB } from './config/db.js';

// Load Env
dotenv.config();

const startServer = async () => {
  // Connect database (handles Mongoose or Fallback mode automatically)
  await connectDB();

  // Seed Admin Account
  await seedAdmin();

  // Listen port
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 HostelHub Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer().catch(err => {
  console.error('❌ Critical server initialization failure:', err);
  process.exit(1);
});
