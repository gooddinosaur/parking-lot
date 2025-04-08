import ParkingLot from './ParkingLot';
import VehicleFactory from './VehicleFactory';

// A service to handle parking operations with MongoDB
class ParkingService {
  constructor(db) {
    this.db = db;
    this.parkingLot = new ParkingLot();
  }

  // Setup the parking lot in the database if it doesn't exist
  async setupParkingLot() {
    const parkingLotCollection = this.db.collection('parkingLot');
    const exists = await parkingLotCollection.findOne({ _id: 'config' });
    
    if (!exists) {
      // Create a serializable version of the parking lot status
      const status = this.parkingLot.getStatus();
      const serializableStatus = this.makeSerializable(status);
      
      await parkingLotCollection.insertOne({
        _id: 'config',
        ...serializableStatus
      });
      
      console.log('Parking lot initialized!');
    }
  }

  // Make objects serializable by removing circular references
  makeSerializable(obj) {
    // Create a clean copy without circular references
    return JSON.parse(JSON.stringify(
      obj,
      (key, value) => {
        // Don't include the full vehicle object or level object references
        // Just keep IDs and essential properties
        if (key === 'vehicle' && value !== null) {
          return {
            licensePlate: value.licensePlate,
            size: value.size,
            spotsNeeded: value.spotsNeeded
          };
        }
        if (key === 'level' && value !== null) {
          return { floorNumber: value.floorNumber };
        }
        return value;
      }
    ));
  }

  // Park a vehicle
  async parkVehicle(licensePlate, vehicleType) {
    // Check if vehicle already exists
    const existingVehicle = await this.db.collection('vehicles').findOne({ licensePlate });
    if (existingVehicle && existingVehicle.isParked) {
      throw new Error('Vehicle is already parked');
    }
    
    // Create the vehicle
    const vehicle = VehicleFactory.createVehicle(vehicleType, licensePlate);
    
    // Try to park the vehicle
    if (this.parkingLot.parkVehicle(vehicle)) {
      // Get a serializable version of the current status
      const updatedStatus = this.makeSerializable(this.parkingLot.getStatus());
      
      // Update parking lot in database
      await this.db.collection('parkingLot').updateOne(
        { _id: 'config' },
        { $set: updatedStatus }
      );
      
      // Extract the level number and spot numbers
      const levelNum = vehicle.parkingSpots[0]?.level.floorNumber;
      const spotNumbers = vehicle.parkingSpots.map(spot => spot.spotNumber);
      
      // Save the vehicle information in a serializable form
      const parkedVehicle = {
        licensePlate,
        vehicleType,
        size: vehicle.size,
        spotsNeeded: vehicle.spotsNeeded,
        isParked: true,
        level: levelNum,
        spots: spotNumbers,
        parkedAt: new Date()
      };
      
      // Create or update vehicle in database
      await this.db.collection('vehicles').updateOne(
        { licensePlate },
        { $set: parkedVehicle },
        { upsert: true }
      );
      
      return {
        success: true,
        message: `Vehicle parked successfully on level ${levelNum}`,
        level: levelNum,
        spots: spotNumbers
      };
    } else {
      throw new Error('No available spots for this vehicle');
    }
  }

  // Remove a vehicle
  async removeVehicle(licensePlate) {
    // Find the vehicle
    const vehicle = await this.db.collection('vehicles').findOne({ licensePlate });
    
    if (!vehicle || !vehicle.isParked) {
      throw new Error('Vehicle not found or not parked');
    }
    
    // Get parking lot configuration to update it
    const parkingLot = await this.db.collection('parkingLot').findOne({ _id: 'config' });
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
    await this.db.collection('parkingLot').updateOne(
      { _id: 'config' },
      { $set: { levels: levels, availableSpots: parkingLot.availableSpots } }
    );
    
    // Update vehicle in database
    await this.db.collection('vehicles').updateOne(
      { licensePlate },
      { $set: { isParked: false, level: null, spots: [], exitedAt: new Date() } }
    );
    
    return {
      success: true,
      message: `Vehicle removed successfully`
    };
  }

  // Get all parked vehicles
  async getParkedVehicles() {
    return this.db.collection('vehicles')
      .find({ isParked: true })
      .toArray();
  }

  // Get parking lot status
  async getParkingLotStatus() {
    return this.db.collection('parkingLot').findOne({ _id: 'config' });
  }
}

export default ParkingService;