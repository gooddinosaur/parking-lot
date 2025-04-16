import mongoose from 'mongoose';

class Database {
  constructor() {
    this.isConnected = false;
    this.connection = null;
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async connect() {
    if (this.isConnected) {
      return this.connection;
    }

    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('Please define the MONGODB_URI environment variable');
    }

    try {
      this.connection = await mongoose.connect(MONGODB_URI);
      this.isConnected = true;
      console.log('MongoDB connected successfully');
      return this.connection;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  getConnection() {
    if (!this.isConnected) {
      throw new Error('Database is not connected. Call connect() first.');
    }
    return this.connection;
  }

  getDb() {
    if (!this.isConnected) {
      throw new Error('Database is not connected. Call connect() first.');
    }
    return mongoose.connection.db;
  }
}

export default Database;