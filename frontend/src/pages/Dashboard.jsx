import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Car, CircleDollarSign, ParkingSquare, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activeVehicles, setActiveVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      const [statsRes, activeRes] = await Promise.all([
        axios.get('http://localhost:5000/api/dashboard'),
        axios.get('http://localhost:5000/api/parking/active')
      ]);
      setStats(statsRes.data);
      setActiveVehicles(activeRes.data);
    } catch (err) {
      console.error(err);
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
    return <div className="text-center py-10 dark:text-white">Loading dashboard...</div>;
  }

  const statCards = [
    { name: 'Total Slots', value: stats?.totalSlots || 0, icon: ParkingSquare, color: 'text-blue-500' },
    { name: 'Available Slots', value: stats?.availableSlots || 0, icon: LayoutDashboard, color: 'text-green-500' },
    { name: 'Occupied Slots', value: stats?.occupiedSlots || 0, icon: Car, color: 'text-orange-500' },
  ];

  if (user?.role === 'Admin') {
    statCards.push({ name: 'Total Revenue', value: `₹${stats?.totalRevenue || 0}`, icon: CircleDollarSign, color: 'text-indigo-500' });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <button onClick={fetchData} className="px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-400">Refresh</button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => (
          <div key={item.name} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{item.name}</dt>
                    <dd className="text-2xl font-semibold text-gray-900 dark:text-white">{item.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Active Parked Vehicles</h3>
        </div>
        <div className="overflow-x-auto">
          {activeVehicles.length === 0 ? (
            <div className="text-center py-8 text-gray-500 flex flex-col items-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mb-2" />
              <p>No vehicles currently parked.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vehicle Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Slot ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Entry Time</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {activeVehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white text-left">{vehicle.vehicle_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-left">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${vehicle.type === 'Car' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {vehicle.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-left">Slot #{vehicle.slot_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-left">
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
