class ParkingSpot {
    constructor(level, row, spotNumber, size) {
      this.level = level;
      this.row = row;
      this.spotNumber = spotNumber;
      this.size = size;
      this.vehicle = null;
      this.isOccupied = false;
      this.vehicleId = null;
    }
    
    isAvailable() {
      return !this.isOccupied;
    }
    
    // Checks if the spot is big enough for the vehicle (and is available)
    canFitVehicle(vehicle) {
      return this.isAvailable() && vehicle.canFitInSpot(this);
    }
    
    // Park vehicle in this spot
    park(vehicle) {
      if (!this.canFitVehicle(vehicle)) {
        return false;
      }
      
      this.vehicle = vehicle;
      this.isOccupied = true;
      this.vehicleId = vehicle.licensePlate;
      vehicle.parkInSpot(this);
      return true;
    }
    
    getRow() {
      return this.row;
    }
    
    getSpotNumber() {
      return this.spotNumber;
    }
    
    getSize() {
      return this.size;
    }
    
    // Remove vehicle from spot, and notify level that a new spot is available
    removeVehicle() {
      this.level.spotFreed();
      this.vehicle = null;
      this.isOccupied = false;
      this.vehicleId = null;
    }
  }
  
  export default ParkingSpot;