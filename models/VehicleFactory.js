import Car from './Car';
import Motorcycle from './Motorcycle';
import Bus from './Bus';

class VehicleFactory {
  static createVehicle(type, licensePlate) {
    switch (type) {
      case 'Car':
        return new Car(licensePlate);
      case 'Motorcycle':
        return new Motorcycle(licensePlate);
      case 'Bus':
        return new Bus(licensePlate);
      default:
        throw new Error(`Unknown vehicle type: ${type}`);
    }
  }
}

export default VehicleFactory;