import clientPromise from '../../lib/mongodb';
import ParkingService from '../../models/ParkingService';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Create parking service
    const parkingService = new ParkingService(db);
    
    if (req.method === 'GET') {
      // Get all parked vehicles
      const vehicles = await parkingService.getParkedVehicles();
      return res.json(vehicles);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: 'Server error: ' + error.message });
  }
}