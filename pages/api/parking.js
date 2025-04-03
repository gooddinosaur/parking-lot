import clientPromise from '../../lib/mongodb';
import { findAvailableSpots, getSpotsNeeded, getVehicleSize, setupParkingLot } from '../../models/ParkingLot';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db();
  
  // Setup parking lot if it doesn't exist
  await setupParkingLot(db);
  
  if (req.method === 'GET') {
    // Get parking lot status
    const parkingLot = await db.collection('parkingLot').findOne({ _id: 'config' });
    return res.json(parkingLot);
  } 
  else if (req.method === 'POST') {
    // Park a vehicle
    const { licensePlate, vehicleType } = req.body;
    
    if (!licensePlate || !vehicleType) {
      return res.status(400).json({ error: 'License plate and vehicle type are required' });
    }
    
    // Check if vehicle already exists
    const existingVehicle = await db.collection('vehicles').findOne({ licensePlate });
    if (existingVehicle && existingVehicle.isParked) {
      return res.status(400).json({ error: 'Vehicle is already parked' });
    }
    
    // Get parking lot configuration
    const parkingLot = await db.collection('parkingLot').findOne({ _id: 'config' });
    const levels = parkingLot.levels;
    
    // Get vehicle information
    const spotsNeeded = getSpotsNeeded(vehicleType);
    const vehicleSize = getVehicleSize(vehicleType);
    
    // Try to find spots for the vehicle
    let parkedSuccessfully = false;
    let parkedLevel = null;
    let parkedSpots = [];
    
    for (let i = 0; i < levels.length; i++) {
      if (levels[i].availableSpots >= spotsNeeded) {
        const spotIndex = findAvailableSpots(levels[i], spotsNeeded, vehicleSize);
        
        if (spotIndex >= 0) {
          parkedLevel = i;
          
          // Mark spots as occupied
          for (let j = 0; j < spotsNeeded; j++) {
            const spotNumber = spotIndex + j;
            levels[i].spots[spotNumber].isOccupied = true;
            levels[i].spots[spotNumber].vehicleId = licensePlate;
            parkedSpots.push(spotNumber);
          }
          
          // Update available spots count
          levels[i].availableSpots -= spotsNeeded;
          parkingLot.availableSpots -= spotsNeeded;
          
          parkedSuccessfully = true;
          break;
        }
      }
    }
    
    if (parkedSuccessfully) {
      // Update parking lot in database
      await db.collection('parkingLot').updateOne(
        { _id: 'config' },
        { $set: { levels: levels, availableSpots: parkingLot.availableSpots } }
      );
      
      // Create or update vehicle in database
      await db.collection('vehicles').updateOne(
        { licensePlate },
        { 
          $set: { 
            licensePlate,
            vehicleType,
            size: vehicleSize,
            spotsNeeded,
            isParked: true,
            level: parkedLevel,
            spots: parkedSpots,
            parkedAt: new Date()
          } 
        },
        { upsert: true }
      );
      
      return res.status(200).json({ 
        success: true, 
        message: `Vehicle parked successfully on level ${parkedLevel}`,
        level: parkedLevel,
        spots: parkedSpots
      });
    } else {
      return res.status(400).json({ error: 'No available spots for this vehicle' });
    }
  } 
  else if (req.method === 'DELETE') {
    // Remove a parked vehicle
    const { licensePlate } = req.body;
    
    if (!licensePlate) {
      return res.status(400).json({ error: 'License plate is required' });
    }
    
    // Find the vehicle
    const vehicle = await db.collection('vehicles').findOne({ licensePlate });
    
    if (!vehicle || !vehicle.isParked) {
      return res.status(404).json({ error: 'Vehicle not found or not parked' });
    }
    
    // Get parking lot configuration
    const parkingLot = await db.collection('parkingLot').findOne({ _id: 'config' });
    const levels = parkingLot.levels;
    const level = vehicle.level;
    
    // Free up spots
    for (const spotNumber of vehicle.spots) {
      levels[level].spots[spotNumber].isOccupied = false;
      levels[level].spots[spotNumber].vehicleId = null;
    }
    
    // Update available spots count
    levels[level].availableSpots += vehicle.spotsNeeded;
    parkingLot.availableSpots += vehicle.spotsNeeded;
    
    // Update parking lot in database
    await db.collection('parkingLot').updateOne(
      { _id: 'config' },
      { $set: { levels: levels, availableSpots: parkingLot.availableSpots } }
    );
    
    // Update vehicle in database
    await db.collection('vehicles').updateOne(
      { licensePlate },
      { $set: { isParked: false, level: null, spots: [], exitedAt: new Date() } }
    );
    
    return res.status(200).json({ 
      success: true, 
      message: `Vehicle removed successfully`
    });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}