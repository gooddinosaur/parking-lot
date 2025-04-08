import Vehicle from './Vehicle';
import VehicleSize from './VehicleSize';

class Car extends Vehicle {
  constructor(licensePlate) {
    super(licensePlate);
    this.spotsNeeded = 1;
    this.size = VehicleSize.Compact;
  }
  
  canFitInSpot(spot) {
    return spot.getSize() === VehicleSize.Large || spot.getSize() === VehicleSize.Compact;
  }
}

export default Car;