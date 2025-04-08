import Vehicle from './Vehicle';
import VehicleSize from './VehicleSize';

class Bus extends Vehicle {
  constructor(licensePlate) {
    super(licensePlate);
    this.spotsNeeded = 5;
    this.size = VehicleSize.Large;
  }
  
  canFitInSpot(spot) {
    return spot.getSize() === VehicleSize.Large;
  }
}

export default Bus;