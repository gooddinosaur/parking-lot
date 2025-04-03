import React, { useState } from 'react';

const VehicleForm = ({ onParked, onError }) => {
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!licensePlate.trim()) {
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
        body: JSON.stringify({ licensePlate, vehicleType }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to park vehicle');
      }
      
      setLicensePlate('');
      onParked(data);
    } catch (error) {
      onError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRemove = async () => {
    if (!licensePlate.trim()) {
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
        body: JSON.stringify({ licensePlate }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove vehicle');
      }
      
      setLicensePlate('');
      onParked(data);
    } catch (error) {
      onError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Park a Vehicle</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="licensePlate">
            License Plate
          </label>
          <input
            id="licensePlate"
            type="text"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
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
        
        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Parking...' : 'Park Vehicle'}
          </button>
          
          <button
            type="button"
            onClick={handleRemove}
            className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Removing...' : 'Remove Vehicle'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;