import ParkingSpot from './ParkingSpot';
import VehicleSize from './VehicleSize';

class Level {
  constructor(floorNumber, numberSpots) {
    this.floorNumber = floorNumber;
    this.spots = [];
    this.availableSpots = numberSpots;
    this.SPOTS_PER_ROW = 10;
    
    const largeSpots = Math.floor(numberSpots / 4);
    const bikeSpots = Math.floor(numberSpots / 4);
    const compactSpots = numberSpots - largeSpots - bikeSpots;
    
    for (let i = 0; i < numberSpots; i++) {
      let spotSize = VehicleSize.Motorcycle;
      
      if (i < largeSpots) {
        spotSize = VehicleSize.Large;
      } else if (i < largeSpots + compactSpots) {
        spotSize = VehicleSize.Compact;
      }
      
      const row = Math.floor(i / this.SPOTS_PER_ROW);
      this.spots.push(new ParkingSpot(this, row, i, spotSize));
    }
  }
  
  getAvailableSpots() {
    return this.availableSpots;
  }
  
  parkVehicle(vehicle) {
    if (this.availableSpots < vehicle.getSpotsNeeded()) {
      return false;
    }
    
    const spotNumber = this.findAvailableSpots(vehicle);
    if (spotNumber < 0) {
      return false;
    }
    
    return this.parkStartingAtSpot(spotNumber, vehicle);
  }
  
  parkStartingAtSpot(spotNumber, vehicle) {
    vehicle.clearSpots();
    let success = true;
    
    for (let i = spotNumber; i < spotNumber + vehicle.getSpotsNeeded(); i++) {
      success = success && this.spots[i].park(vehicle);
    }
    
    this.availableSpots -= vehicle.getSpotsNeeded();
    return success;
  }
  
  findAvailableSpots(vehicle) {
    const spotsNeeded = vehicle.getSpotsNeeded();
    let lastRow = -1;
    let spotsFound = 0;
    
    for (let i = 0; i < this.spots.length; i++) {
      const spot = this.spots[i];
      
      if (lastRow !== spot.getRow()) {
        spotsFound = 0;
        lastRow = spot.getRow();
      }
      
      if (spot.canFitVehicle(vehicle)) {
        spotsFound++;
      } else {
        spotsFound = 0;
      }
      
      if (spotsFound === spotsNeeded) {
        return i - (spotsNeeded - 1);
      }
    }
    
    return -1;
  }
  
  spotFreed() {
    this.availableSpots++;
  }
}

export default Level;