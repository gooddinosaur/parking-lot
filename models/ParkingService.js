import ParkingLot from './ParkingLot';
import VehicleFactory from './VehicleFactory';

class ParkingService {
  constructor(db) {
    this.db = db;
    this.parkingLot = new ParkingLot();
  }

  async setupParkingLot() {
    const parkingLotCollection = this.db.collection('parkingLot');
    const exists = await parkingLotCollection.findOne({ _id: 'config' });
    
    if (!exists) {
      const status = this.parkingLot.getStatus();
      const serializableStatus = this.makeSerializable(status);
      
      await parkingLotCollection.insertOne({
        _id: 'config',
        ...serializableStatus
      });
      
      console.log('Parking lot initialized!');
    } else {
      this.syncParkingLotFromDb(exists);
    }
  }

  syncParkingLotFromDb(parkingLotState) {
    this.parkingLot.availableSpots = parkingLotState.availableSpots;
    
    parkingLotState.levels.forEach((dbLevel, levelIndex) => {
      const memoryLevel = this.parkingLot.levels[levelIndex];
      memoryLevel.availableSpots = dbLevel.availableSpots;
      
      dbLevel.spots.forEach((dbSpot, spotIndex) => {
        const memorySpot = memoryLevel.spots[spotIndex];
        memorySpot.isOccupied = dbSpot.isOccupied;
        memorySpot.vehicleId = dbSpot.vehicleId;
      });
    });
  }

  makeSerializable(obj) {
    return JSON.parse(JSON.stringify(
      obj,
      (key, value) => {
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

  async parkVehicle(licensePlate, vehicleType) {
    const currentState = await this.db.collection('parkingLot').findOne({ _id: 'config' });
    if (currentState) {
      this.syncParkingLotFromDb(currentState);
    }
    
    const existingVehicle = await this.db.collection('vehicles').findOne({ licensePlate });
    if (existingVehicle && existingVehicle.isParked) {
      throw new Error('Vehicle is already parked');
    }
    
    const vehicle = VehicleFactory.createVehicle(vehicleType, licensePlate);
    
    if (this.parkingLot.parkVehicle(vehicle)) {
      const updatedStatus = this.makeSerializable(this.parkingLot.getStatus());
      
      await this.db.collection('parkingLot').updateOne(
        { _id: 'config' },
        { $set: updatedStatus }
      );
      
      const levelNum = vehicle.parkingSpots[0]?.level.floorNumber;
      const spotNumbers = vehicle.parkingSpots.map(spot => spot.spotNumber);
      
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

  async removeVehicle(licensePlate) {
    const currentState = await this.db.collection('parkingLot').findOne({ _id: 'config' });
    if (currentState) {
      this.syncParkingLotFromDb(currentState);
    }
    
    const vehicle = await this.db.collection('vehicles').findOne({ licensePlate });
    
    if (!vehicle || !vehicle.isParked) {
      throw new Error('Vehicle not found or not parked');
    }
    
    const parkingLot = await this.db.collection('parkingLot').findOne({ _id: 'config' });
    const levels = parkingLot.levels;
    const level = vehicle.level;
    
    for (const spotNumber of vehicle.spots) {
      levels[level].spots[spotNumber].isOccupied = false;
      levels[level].spots[spotNumber].vehicleId = null;
    }
    
    levels[level].availableSpots += vehicle.spotsNeeded;
    parkingLot.availableSpots += vehicle.spotsNeeded;
    
    await this.db.collection('parkingLot').updateOne(
      { _id: 'config' },
      { $set: { levels: levels, availableSpots: parkingLot.availableSpots } }
    );
    
    await this.db.collection('vehicles').updateOne(
      { licensePlate },
      { $set: { isParked: false, level: null, spots: [], exitedAt: new Date() } }
    );
    
    return {
      success: true,
      message: `Vehicle removed successfully`
    };
  }

  async getParkedVehicles() {
    return this.db.collection('vehicles')
      .find({ isParked: true })
      .toArray();
  }

  async getParkingLotStatus() {
    return this.db.collection('parkingLot').findOne({ _id: 'config' });
  }
}

export default ParkingService;