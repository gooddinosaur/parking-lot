import React, { useState } from 'react';

const VehicleForm = ({ onParked, onError }) => {
  const [activeTab, setActiveTab] = useState('park'); // 'park' or 'remove'
  const [parkLicensePlate, setParkLicensePlate] = useState('');
  const [removeLicensePlate, setRemoveLicensePlate] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handlePark = async (e) => {
    e.preventDefault();
    
    if (!parkLicensePlate.trim()) {
      onError('License plate is required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/parking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ licensePlate: parkLicensePlate, vehicleType }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to park vehicle');
      }
      
      setParkLicensePlate('');
      onParked(data);
    } catch (error) {
      onError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRemove = async (e) => {
    e.preventDefault();
    
    if (!removeLicensePlate.trim()) {
      onError('License plate is required to remove a vehicle');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/parking', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ licensePlate: removeLicensePlate }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove vehicle');
      }
      
      setRemoveLicensePlate('');
      onParked(data);
    } catch (error) {
      onError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'park' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('park')}
        >
          Park a Vehicle
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'remove' ? 'border-b-2 border-red-500 text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('remove')}
        >
          Remove a Vehicle
        </button>
      </div>
      
      {/* Park Vehicle Form */}
      {activeTab === 'park' && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-900">Park a Vehicle</h2>
          <form onSubmit={handlePark}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="parkLicensePlate">
                License Plate
              </label>
              <input
                id="parkLicensePlate"
                type="text"
                value={parkLicensePlate}
                onChange={(e) => setParkLicensePlate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Enter license plate"
                disabled={isSubmitting}
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="vehicleType">
                Vehicle Type
              </label>
              <select
                id="vehicleType"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                disabled={isSubmitting}
              >
                <option value="Car" className="bg-white text-black">Car</option>
                <option value="Motorcycle" className="bg-white text-black">Motorcycle</option>
                <option value="Bus" className="bg-white text-black">Bus</option>
              </select>
            </div>
            
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Parking...' : 'Park Vehicle'}
            </button>
          </form>
        </div>
      )}
      
      {/* Remove Vehicle Form */}
      {activeTab === 'remove' && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-900">Remove a Vehicle</h2>
          <form onSubmit={handleRemove}>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="removeLicensePlate">
                License Plate
              </label>
              <input
                id="removeLicensePlate"
                type="text"
                value={removeLicensePlate}
                onChange={(e) => setRemoveLicensePlate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                placeholder="Enter license plate"
                disabled={isSubmitting}
                required
              />
            </div>
            
            <button
              type="submit"
              className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Removing...' : 'Remove Vehicle'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default VehicleForm;