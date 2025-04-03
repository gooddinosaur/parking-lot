import React, { useState, useEffect } from 'react';

const ParkedVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/vehicles');
      if (!response.ok) {
        throw new Error('Failed to fetch vehicles');
      }
      const data = await response.json();
      setVehicles(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Parked Vehicles</h2>
      
      {loading ? (
        <div className="text-center py-4 text-gray-700">
          <p>Loading vehicles...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          {error}
        </div>
      ) : vehicles.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Plate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spots</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parked At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-black">
              {vehicles.map((vehicle) => (
                <tr key={vehicle.licensePlate}>
                  <td className="px-6 py-4 whitespace-nowrap">{vehicle.licensePlate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{vehicle.vehicleType}</td>
                  <td className="px-6 py-4 whitespace-nowrap">Level {vehicle.level}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{vehicle.spots.join(', ')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(vehicle.parkedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-700 py-4">No vehicles currently parked</p>
      )}
      
      <div className="mt-4">
        <button
          onClick={fetchVehicles}
          className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition"
        >
          Refresh List
        </button>
      </div>
    </div>
  );
};

export default ParkedVehicles;