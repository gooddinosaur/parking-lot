import Level from './Level';

class ParkingLot {
  constructor() {
    this.NUM_LEVELS = 5;
    this.SPOTS_PER_LEVEL = 30;
    this.levels = [];
    this.totalSpots = this.NUM_LEVELS * this.SPOTS_PER_LEVEL;
    this.availableSpots = this.totalSpots;
    
    // Initialize levels
    for (let i = 0; i < this.NUM_LEVELS; i++) {
      this.levels.push(new Level(i, this.SPOTS_PER_LEVEL));
    }
  }
  
  // Park the vehicle in a spot (or multiple spots). Return false if failed.
  parkVehicle(vehicle) {
    for (let i = 0; i < this.levels.length; i++) {
      if (this.levels[i].parkVehicle(vehicle)) {
        this.availableSpots -= vehicle.getSpotsNeeded();
        return true;
      }
    }
    return false;
  }
  
  // Get the current state of the parking lot
  getStatus() {
    return {
      levels: this.levels.map(level => ({
        floorNumber: level.floorNumber,
        spots: level.spots,
        availableSpots: level.availableSpots
      })),
      totalSpots: this.totalSpots,
      availableSpots: this.availableSpots
    };
  }
}

export default ParkingLot;