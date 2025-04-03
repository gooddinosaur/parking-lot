import React from 'react';

const ParkingSpot = ({ spot }) => {
  // Determine spot display
  let displayChar = '';
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  
  if (spot.isOccupied) {
    // Show the first character of the vehicle type
    const vehiclePrefix = spot.vehicleId?.charAt(0) || 'X';
    displayChar = vehiclePrefix;
    bgColor = 'bg-red-500';
    textColor = 'text-white';
  } else {
    // Show the spot size
    switch (spot.size) {
      case 'Large':
        displayChar = 'L';
        bgColor = 'bg-blue-100';
        break;
      case 'Compact':
        displayChar = 'C';
        bgColor = 'bg-green-100';
        break;
      case 'Motorcycle':
        displayChar = 'M';
        bgColor = 'bg-yellow-100';
        break;
      default:
        displayChar = '?';
    }
  }
  
  return (
    <div 
      className={`w-10 h-10 m-1 flex items-center justify-center ${bgColor} ${textColor} border border-gray-300 rounded`}
      title={spot.isOccupied ? `Spot ${spot.spotNumber} (${spot.size}): Occupied by ${spot.vehicleId}` : `Spot ${spot.spotNumber} (${spot.size}): Available`}
    >
      {displayChar}
    </div>
  );
};

export default ParkingSpot;