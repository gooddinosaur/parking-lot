import Vehicle from './Vehicle';
import VehicleSize from './VehicleSize';

class Motorcycle extends Vehicle {
  constructor(licensePlate) {
    super(licensePlate);
    this.spotsNeeded = 1;
    this.size = VehicleSize.Motorcycle;
  }
  
  canFitInSpot(spot) {
    return true; // Motorcycles can fit in any spot
  }
}

export default Motorcycle;