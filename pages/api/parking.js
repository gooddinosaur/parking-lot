import clientPromise from '../../lib/mongodb';
import ParkingService from '../../models/ParkingService';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Create parking service
    const parkingService = new ParkingService(db);
    
    // Setup parking lot if it doesn't exist
    await parkingService.setupParkingLot();
    
    if (req.method === 'GET') {
      // Get parking lot status
      const status = await parkingService.getParkingLotStatus();
      return res.json(status);
    } 
    else if (req.method === 'POST') {
      // Park a vehicle
      const { licensePlate, vehicleType } = req.body;
      
      if (!licensePlate || !vehicleType) {
        return res.status(400).json({ error: 'License plate and vehicle type are required' });
      }
      
      try {
        const result = await parkingService.parkVehicle(licensePlate, vehicleType);
        return res.status(200).json(result);
      } catch (error) {
        return res.status(400).json({ error: error.message });
      }
    } 
    else if (req.method === 'DELETE') {
      // Remove a parked vehicle
      const { licensePlate } = req.body;
      
      if (!licensePlate) {
        return res.status(400).json({ error: 'License plate is required' });
      }
      
      try {
        const result = await parkingService.removeVehicle(licensePlate);
        return res.status(200).json(result);
      } catch (error) {
        return res.status(404).json({ error: error.message });
      }
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: 'Server error: ' + error.message });
  }
}