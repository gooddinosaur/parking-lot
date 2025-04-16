import mongoose from 'mongoose';
import dbConnect from '../../lib/mongodb';
import ParkingService from '../../models/ParkingService';

export default async function handler(req, res) {
  try {
    await dbConnect(); // Connect to the database using Mongoose

    const parkingService = new ParkingService(mongoose.connection.db); // Use the Mongoose connection

    if (req.method === 'GET') {
      const vehicles = await parkingService.getParkedVehicles();
      return res.json(vehicles);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: 'Server error: ' + error.message });
  }
}