import ParkingLot from './ParkingLot';
import VehicleFactory from './VehicleFactory';
import Database from '../lib/database';
import VehicleModel from './schemas/VehicleSchema';
import ParkingLotModel from './schemas/ParkingLotSchema';

class ParkingService {
  constructor() {
    this.parkingLot = new ParkingLot();
    this.database = Database.getInstance();
  }

  async setupParkingLot() {
    try {
      await this.database.connect();
      
      // Check if parking lot config exists
      const existingConfig = await ParkingLotModel.findById('config');
      
      if (!existingConfig) {
        const status = this.parkingLot.getStatus();
        const serializableStatus = this.makeSerializable(status);
        
        await ParkingLotModel.create({
          _id: 'config',
          ...serializableStatus
        });
        
        console.log('Parking lot initialized!');
      } else {
        this.syncParkingLotFromDb(existingConfig);
      }
    } catch (error) {
      console.error('Error setting up parking lot:', error);
      throw error;
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
    try {
      await this.database.connect();
      
      // Get current parking lot status
      const currentState = await ParkingLotModel.findById('config');
      if (currentState) {
        this.syncParkingLotFromDb(currentState);
      }
      
      // Check if vehicle is already parked
      const existingVehicle = await VehicleModel.findOne({ licensePlate });
      if (existingVehicle && existingVehicle.isParked) {
        throw new Error('Vehicle is already parked');
      }
      
      const vehicle = VehicleFactory.createVehicle(vehicleType, licensePlate);
      
      if (this.parkingLot.parkVehicle(vehicle)) {
        const updatedStatus = this.makeSerializable(this.parkingLot.getStatus());
        
        // Update parking lot status
        await ParkingLotModel.findByIdAndUpdate('config', updatedStatus);
        
        const levelNum = vehicle.parkingSpots[0]?.level.floorNumber;
        const spotNumbers = vehicle.parkingSpots.map(spot => spot.spotNumber);
        
        // Create or update vehicle record
        await VehicleModel.findOneAndUpdate(
          { licensePlate },
          {
            licensePlate,
            vehicleType,
            size: vehicle.size,
            spotsNeeded: vehicle.spotsNeeded,
            isParked: true,
            level: levelNum,
            spots: spotNumbers,
            parkedAt: new Date()
          },
          { upsert: true, new: true }
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
    } catch (error) {
      console.error('Error parking vehicle:', error);
      throw error;
    }
  }

  async removeVehicle(licensePlate) {
    try {
      await this.database.connect();
      
      // Get current parking lot status
      const currentState = await ParkingLotModel.findById('config');
      if (currentState) {
        this.syncParkingLotFromDb(currentState);
      }
      
      // Check if vehicle exists and is parked
      const vehicle = await VehicleModel.findOne({ licensePlate });
      
      if (!vehicle || !vehicle.isParked) {
        throw new Error('Vehicle not found or not parked');
      }
      
      const parkingLot = await ParkingLotModel.findById('config');
      const levels = parkingLot.levels;
      const level = vehicle.level;
      
      // Update spots to be available
      for (const spotNumber of vehicle.spots) {
        levels[level].spots[spotNumber].isOccupied = false;
        levels[level].spots[spotNumber].vehicleId = null;
      }
      
      // Update available spots count
      levels[level].availableSpots += vehicle.spotsNeeded;
      parkingLot.availableSpots += vehicle.spotsNeeded;
      
      // Update parking lot in database
      await ParkingLotModel.findByIdAndUpdate('config', {
        levels: levels,
        availableSpots: parkingLot.availableSpots
      });
      
      // Update vehicle record
      await VehicleModel.findOneAndUpdate(
        { licensePlate },
        {
          isParked: false,
          level: null,
          spots: [],
          exitedAt: new Date()
        }
      );
      
      return {
        success: true,
        message: `Vehicle removed successfully`
      };
    } catch (error) {
      console.error('Error removing vehicle:', error);
      throw error;
    }
  }

  async getParkedVehicles() {
    try {
      await this.database.connect();
      return VehicleModel.find({ isParked: true });
    } catch (error) {
      console.error('Error fetching parked vehicles:', error);
      throw error;
    }
  }

  async getParkingLotStatus() {
    try {
      await this.database.connect();
      return ParkingLotModel.findById('config');
    } catch (error) {
      console.error('Error fetching parking lot status:', error);
      throw error;
    }
  }
}

export default ParkingService;