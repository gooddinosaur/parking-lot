// Abstract Vehicle class
class Vehicle {
    constructor(licensePlate) {
      this.licensePlate = licensePlate;
      this.parkingSpots = [];
      this.spotsNeeded = 0;
      this.size = null;
    }
    
    getSpotsNeeded() {
      return this.spotsNeeded;
    }
    
    getSize() {
      return this.size;
    }
    
    // Park vehicle in this spot (among others, potentially)
    parkInSpot(spot) {
      this.parkingSpots.push(spot);
    }
    
    // Remove car from spot, and notify spot that it's gone
    clearSpots() {
      for (const spot of this.parkingSpots) {
        spot.removeVehicle();
      }
      this.parkingSpots = [];
    }
    
    // Abstract methods that must be implemented by subclasses
    canFitInSpot(spot) {
      throw new Error('Method canFitInSpot must be implemented by subclass');
    }
  }
  
  export default Vehicle;