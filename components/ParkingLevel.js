import React from 'react';
import ParkingSpot from './ParkingSpot';

const ParkingLevel = ({ level }) => {
  // Group spots by row for display
  const spotsByRow = level.spots.reduce((acc, spot) => {
    if (!acc[spot.row]) {
      acc[spot.row] = [];
    }
    acc[spot.row].push(spot);
    return acc;
  }, {});
  
  return (
    <div className="mb-6 p-4 border rounded shadow-sm">
      <div className="flex justify-between mb-2">
        <h3 className="text-lg font-medium text-gray-900">Level {level.floorNumber}</h3>
        <div className="text-sm text-gray-800">
          <span className="font-medium">Available: </span>
          <span className={level.availableSpots === 0 ? 'text-red-600' : 'text-green-600'}>
            {level.availableSpots}
          </span>
          <span> / {level.spots.length} spots</span>
        </div>
      </div>
      
      <div className="border-t pt-2">
        {Object.entries(spotsByRow).map(([rowNum, spots]) => (
          <div key={rowNum} className="flex flex-wrap mb-1">
            <div className="w-10 text-right pr-2 mt-1 text-sm text-gray-500">
              {rowNum}:
            </div>
            <div className="flex flex-wrap">
              {spots.map(spot => (
                <ParkingSpot key={spot.spotNumber} spot={spot} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParkingLevel;