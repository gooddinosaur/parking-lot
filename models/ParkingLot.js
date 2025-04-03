// VehicleSize enum
export const VehicleSize = {
  Motorcycle: 'Motorcycle',
  Compact: 'Compact',
  Large: 'Large'
};

// Initial setup for parking lot
export const setupParkingLot = async (db) => {
  const parkingLotCollection = db.collection('parkingLot');
  const exists = await parkingLotCollection.findOne({ _id: 'config' });
  
  if (!exists) {
    const NUM_LEVELS = 5;
    const SPOTS_PER_LEVEL = 30;
    const SPOTS_PER_ROW = 10;
    
    const levels = [];
    
    for (let levelNum = 0; levelNum < NUM_LEVELS; levelNum++) {
      const spots = [];
      
      // Distribution of spot types (similar to Java implementation)
      const largeSpots = Math.floor(SPOTS_PER_LEVEL / 4);
      const bikeSpots = Math.floor(SPOTS_PER_LEVEL / 4);
      const compactSpots = SPOTS_PER_LEVEL - largeSpots - bikeSpots;
      
      for (let spotNum = 0; spotNum < SPOTS_PER_LEVEL; spotNum++) {
        let spotSize = VehicleSize.Motorcycle;
        
        if (spotNum < largeSpots) {
          spotSize = VehicleSize.Large;
        } else if (spotNum < largeSpots + compactSpots) {
          spotSize = VehicleSize.Compact;
        }
        
        const row = Math.floor(spotNum / SPOTS_PER_ROW);
        
        spots.push({
          spotNumber: spotNum,
          row: row,
          size: spotSize,
          isOccupied: false,
          vehicleId: null
        });
      }
      
      levels.push({
        floorNumber: levelNum,
        spots: spots,
        availableSpots: SPOTS_PER_LEVEL
      });
    }
    
    await parkingLotCollection.insertOne({
      _id: 'config',
      levels: levels,
      totalSpots: NUM_LEVELS * SPOTS_PER_LEVEL,
      availableSpots: NUM_LEVELS * SPOTS_PER_LEVEL
    });
    
    console.log('Parking lot initialized!');
  }
};

// Finding available spots
export const findAvailableSpots = (level, spotsNeeded, vehicleSize) => {
  const spots = level.spots;
  let lastRow = -1;
  let spotsFound = 0;
  let startSpotIndex = -1;
  
  for (let i = 0; i < spots.length; i++) {
    const spot = spots[i];
    
    if (lastRow !== spot.row) {
      spotsFound = 0;
      lastRow = spot.row;
    }
    
    if (!spot.isOccupied && canVehicleFitInSpot(vehicleSize, spot.size)) {
      spotsFound++;
    } else {
      spotsFound = 0;
      startSpotIndex = -1;
    }
    
    if (spotsFound === 1 && startSpotIndex === -1) {
      startSpotIndex = i;
    }
    
    if (spotsFound === spotsNeeded) {
      return startSpotIndex;
    }
  }
  
  return -1;
};

// Helper function to check if a vehicle can fit in a spot
export const canVehicleFitInSpot = (vehicleSize, spotSize) => {
  if (vehicleSize === VehicleSize.Motorcycle) {
    return true; // Motorcycles can fit in any spot
  } else if (vehicleSize === VehicleSize.Compact) {
    return spotSize === VehicleSize.Compact || spotSize === VehicleSize.Large;
  } else if (vehicleSize === VehicleSize.Large) {
    return spotSize === VehicleSize.Large;
  }
  return false;
};

// Get number of spots needed based on vehicle type
export const getSpotsNeeded = (vehicleType) => {
  switch (vehicleType) {
    case 'Bus':
      return 5;
    case 'Car':
    case 'Motorcycle':
      return 1;
    default:
      return 1;
  }
};

// Get vehicle size based on vehicle type
export const getVehicleSize = (vehicleType) => {
  switch (vehicleType) {
    case 'Bus':
      return VehicleSize.Large;
    case 'Car':
      return VehicleSize.Compact;
    case 'Motorcycle':
      return VehicleSize.Motorcycle;
    default:
      return VehicleSize.Compact;
  }
};