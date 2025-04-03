import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import ParkingLevel from '../components/ParkingLevel';
import VehicleForm from '../components/VehicleForm';
import ParkedVehicles from '../components/ParkedVehicles';

export default function Home() {
  const [parkingLot, setParkingLot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [currentView, setCurrentView] = useState('lot'); // 'lot' or 'vehicles'
  
  const fetchParkingLot = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/parking');
      if (!response.ok) {
        throw new Error('Failed to fetch parking lot data');
      }
      const data = await response.json();
      setParkingLot(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchParkingLot();
  }, []);
  
  const handleParked = (data) => {
    setNotification({
      type: 'success',
      message: data.message
    });
    
    // Refresh parking lot data
    fetchParkingLot();
    
    // Clear notification after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };
  
  const handleError = (message) => {
    setNotification({
      type: 'error',
      message
    });
    
    // Clear notification after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Parking Lot Management</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Parking Lot Management System" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" />
      </Head>
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">Parking Lot Management System</h1>
        
        {/* Main Navigation */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setCurrentView('lot')}
              className={`px-4 py-2 text-sm font-medium border ${currentView === 'lot' 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'} 
                rounded-l-lg focus:z-10 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            >
              Parking Lot View
            </button>
            <button
              type="button"
              onClick={() => setCurrentView('vehicles')}
              className={`px-4 py-2 text-sm font-medium border ${currentView === 'vehicles' 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'} 
                rounded-r-lg focus:z-10 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            >
              Parked Vehicles
            </button>
          </div>
        </div>
        
        {notification && (
          <div className={`mb-6 p-4 rounded-md ${notification.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {notification.message}
          </div>
        )}
        
        {currentView === 'lot' ? (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Parking Lot Status</h2>
                
                {loading ? (
                  <div className="text-center py-8 text-gray-700">
                    <p>Loading parking lot data...</p>
                  </div>
                ) : error ? (
                  <div className="bg-red-100 text-red-700 p-4 rounded-md">
                    {error}
                  </div>
                ) : parkingLot ? (
                  <div>
                    <div className="mb-4 text-gray-800">
                      <span className="font-medium">Total Available Spots: </span>
                      <span className={parkingLot.availableSpots === 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                        {parkingLot.availableSpots}
                      </span>
                      <span> / {parkingLot.totalSpots}</span>
                    </div>
                    
                    <div className="space-y-4">
                      {parkingLot.levels.map(level => (
                        <ParkingLevel key={level.floorNumber} level={level} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700">No parking lot data available</p>
                )}
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Legend</h2>
                <div className="grid grid-cols-3 gap-4 text-gray-800">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 border border-gray-300 rounded flex items-center justify-center mr-2">L</div>
                    <span>Large Spot</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 border border-gray-300 rounded flex items-center justify-center mr-2">C</div>
                    <span>Compact Spot</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-100 border border-gray-300 rounded flex items-center justify-center mr-2">M</div>
                    <span>Motorcycle Spot</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-500 text-white border border-gray-300 rounded flex items-center justify-center mr-2">X</div>
                    <span>Occupied Spot</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <VehicleForm onParked={handleParked} onError={handleError} />
              
              <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Parking Rules</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-800">
                  <li>Cars can park in Compact or Large spots</li>
                  <li>Motorcycles can park in any spot</li>
                  <li>Buses require 5 consecutive Large spots</li>
                  <li>All spots in a row must be consecutive</li>
                  <li>Vehicles will be parked on the lowest available level</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <ParkedVehicles />
            </div>
            
            <div>
              <VehicleForm onParked={handleParked} onError={handleError} />
            </div>
          </div>
        )}
      </main>
      
      <footer className="container mx-auto px-4 py-8 mt-8 border-t">
        <p className="text-center text-gray-500">
          Parking Lot Management System &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}