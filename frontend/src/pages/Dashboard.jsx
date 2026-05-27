import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Car, CircleDollarSign, ParkingSquare, AlertCircle, Bike, RefreshCw, Clock, History } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activeVehicles, setActiveVehicles] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      const [statsRes, activeRes, slotsRes] = await Promise.all([
        axios.get('/api/dashboard'),
        axios.get('/api/parking/active'),
        axios.get('/api/slots')
      ]);
      setStats(statsRes.data);
      setActiveVehicles(activeRes.data);
      setSlots(slotsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll for real-time updates every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-gray-500 dark:text-gray-400">Loading live dashboard stats and yard map...</p>
      </div>
    );
  }

  const statCards = [
    { name: 'Total Slots', value: stats?.totalSlots || 0, icon: ParkingSquare, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800' },
    { name: 'Available Slots', value: stats?.availableSlots || 0, icon: LayoutDashboard, color: 'text-green-500 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' },
    { name: 'Occupied Slots', value: stats?.occupiedSlots || 0, icon: Car, color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800' },
  ];

  if (user?.role === 'Admin') {
    statCards.push({ name: 'Total Revenue', value: `₹${stats?.totalRevenue || 0}`, icon: CircleDollarSign, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800' });
  }

  // Group slots by type
  const carSlots = slots.filter(s => s.type === 'Car');
  const bikeSlots = slots.filter(s => s.type === 'Bike');

  // Helper to find parked vehicle details for an occupied slot
  const getParkedVehicle = (slotId) => {
    return activeVehicles.find(v => v.slot_id === slotId);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Real-time status of your parking yard and statistics</p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-[0.98] shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Sync Now</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => (
          <div key={item.name} className={`overflow-hidden rounded-2xl border p-5 bg-white dark:bg-gray-800 shadow-sm transition-all hover:shadow-md ${item.color}`}>
            <div className="flex items-center justify-between">
              <div className="space-y-1 text-left">
                <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{item.name}</dt>
                <dd className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{item.value}</dd>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-gray-900 shadow-inner">
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Yard Interactive Parking Map */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-left">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Live Yard Visualizer</h3>
            <p className="text-xs text-gray-400">Interactive map layout of Cars & Bikes parking slots</p>
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-green-500 border border-green-600 inline-block"></span>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-red-500 border border-red-600 inline-block"></span>
              <span>Occupied</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Car Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 uppercase tracking-wider text-left">
              <Car className="w-4 h-4 text-blue-500" />
              <span>Car Parking Section ({carSlots.filter(s => s.status === 'Available').length} / {carSlots.length} Free)</span>
            </h4>
            
            {carSlots.length === 0 ? (
              <p className="text-xs text-gray-400 py-3 text-left">No car slots defined. Go to Slot Management to add some.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {carSlots.map(slot => {
                  const vehicle = getParkedVehicle(slot.id);
                  const isOccupied = slot.status === 'Occupied';
                  return (
                    <div
                      key={slot.id}
                      className={`group relative p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${
                        isOccupied
                          ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-400'
                          : 'border-green-500 bg-green-50/50 dark:bg-green-950/10 text-green-700 dark:text-green-400 hover:scale-[1.03] hover:shadow-sm'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase opacity-85">Spot #{slot.id}</span>
                      <Car className={`w-8 h-8 ${isOccupied ? 'animate-pulse' : ''}`} />
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-150 dark:border-gray-700">
                        {isOccupied ? 'Parked' : 'Empty'}
                      </span>

                      {/* Tooltip on Hover */}
                      {isOccupied && vehicle && (
                        <div className="absolute z-30 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-52 bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl border border-slate-700/60 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200">
                          <div className="space-y-1.5 text-left">
                            <div className="border-b border-slate-800 pb-1 font-bold text-indigo-300 flex justify-between">
                              <span>Slot #{slot.id} (Car)</span>
                              <span className="text-red-400">Occupied</span>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase text-slate-400 font-semibold">Vehicle Number</p>
                              <p className="font-bold text-sm tracking-wide">{vehicle.vehicle_number}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase text-slate-400 font-semibold">Entry Time</p>
                              <p className="text-[11px] font-medium text-slate-200">{format(new Date(vehicle.entry_time), 'PPp')}</p>
                              <p className="text-[10px] text-indigo-400 font-medium mt-0.5 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(vehicle.entry_time))} ago
                              </p>
                            </div>
                          </div>
                          {/* Triangle Arrow */}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bike Section */}
          <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 uppercase tracking-wider text-left">
              <Bike className="w-4.5 h-4.5 text-green-500" />
              <span>Bike Parking Section ({bikeSlots.filter(s => s.status === 'Available').length} / {bikeSlots.length} Free)</span>
            </h4>
            
            {bikeSlots.length === 0 ? (
              <p className="text-xs text-gray-400 py-3 text-left">No bike slots defined. Go to Slot Management to add some.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {bikeSlots.map(slot => {
                  const vehicle = getParkedVehicle(slot.id);
                  const isOccupied = slot.status === 'Occupied';
                  return (
                    <div
                      key={slot.id}
                      className={`group relative p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${
                        isOccupied
                          ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-400'
                          : 'border-green-500 bg-green-50/50 dark:bg-green-950/10 text-green-700 dark:text-green-400 hover:scale-[1.03] hover:shadow-sm'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase opacity-85">Spot #{slot.id}</span>
                      <Bike className={`w-8 h-8 ${isOccupied ? 'animate-pulse' : ''}`} />
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-150 dark:border-gray-700">
                        {isOccupied ? 'Parked' : 'Empty'}
                      </span>

                      {/* Tooltip on Hover */}
                      {isOccupied && vehicle && (
                        <div className="absolute z-30 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-52 bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl border border-slate-700/60 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200">
                          <div className="space-y-1.5 text-left">
                            <div className="border-b border-slate-800 pb-1 font-bold text-indigo-300 flex justify-between">
                              <span>Slot #{slot.id} (Bike)</span>
                              <span className="text-red-400">Occupied</span>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase text-slate-400 font-semibold">Vehicle Number</p>
                              <p className="font-bold text-sm tracking-wide">{vehicle.vehicle_number}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase text-slate-400 font-semibold">Entry Time</p>
                              <p className="text-[11px] font-medium text-slate-200">{format(new Date(vehicle.entry_time), 'PPp')}</p>
                              <p className="text-[10px] text-indigo-400 font-medium mt-0.5 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(vehicle.entry_time))} ago
                              </p>
                            </div>
                          </div>
                          {/* Triangle Arrow */}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Parked Vehicles Table */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <div className="text-left">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Active Parked Vehicles</h3>
            <p className="text-xs text-gray-400">Vehicles currently logged in the yard</p>
          </div>
          <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-indigo-500">
            <History className="w-5 h-5" />
          </div>
        </div>
        <div className="overflow-x-auto">
          {activeVehicles.length === 0 ? (
            <div className="text-center py-12 text-gray-500 flex flex-col items-center justify-center">
              <AlertCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-sm font-semibold">No vehicles currently parked.</p>
              <p className="text-xs text-gray-400">Process a vehicle entry to see active parking data here.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-150 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vehicle Number</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Slot ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Entry Time</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                {activeVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white text-left tracking-wide">{vehicle.vehicle_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-left">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-extrabold rounded-full ${vehicle.type === 'Car' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}`}>
                        {vehicle.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-600 dark:text-indigo-400 text-left">Slot #{vehicle.slot_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-450 text-left font-medium">
                      {format(new Date(vehicle.entry_time), 'PPp')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
