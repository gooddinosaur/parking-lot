import Database from '../../lib/database';
import ParkingService from '../../models/ParkingService';

export default async function handler(req, res) {
  try {
    const database = Database.getInstance();
    await database.connect();
    
    const parkingService = new ParkingService();

    if (req.method === 'GET') {
      const vehicles = await parkingService.getParkedVehicles();
      return res.json(vehicles);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Server error: ' + error.message });
  }
}