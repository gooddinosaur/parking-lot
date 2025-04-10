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
    
    parkInSpot(spot) {
      this.parkingSpots.push(spot);
    }
    
    clearSpots() {
      for (const spot of this.parkingSpots) {
        spot.removeVehicle();
      }
      this.parkingSpots = [];
    }
    
    canFitInSpot(spot) {
      throw new Error('Method canFitInSpot must be implemented by subclass');
    }
  }
  
  export default Vehicle;