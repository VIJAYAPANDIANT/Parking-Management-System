import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CalendarRange, Calendar, Car, Bike, Plus, CheckCircle2, XCircle, AlertCircle, Clock, Check, User } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

export default function Reservations() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [resTime, setResTime] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [resResponse, slotsResponse] = await Promise.all([
        axios.get('/api/reservations'),
        axios.get('/api/slots')
      ]);
      setReservations(resResponse.data);
      setSlots(slotsResponse.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter slots to only show available ones matching selected vehicle type
  const availableSlots = slots.filter(
    s => s.type === vehicleType && s.status === 'Available'
  );

  const handleBook = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setActionLoading(true);

    if (!selectedSlot) {
      setError('Please select a slot.');
      setActionLoading(false);
      return;
    }

    try {
      await axios.post('/api/reservations', {
        vehicle_number: vehicleNumber.toUpperCase(),
        vehicle_type: vehicleType,
        slot_id: parseInt(selectedSlot),
        reservation_time: new Date(resTime).toISOString()
      });
      
      setSuccess('Slot reserved successfully!');
      setVehicleNumber('');
      setSelectedSlot('');
      setResTime('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to book reservation.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckIn = async (resId) => {
    if (!confirm('Are you sure you want to check in this vehicle now? This will open an active parking record.')) return;
    setError('');
    setSuccess('');
    try {
      await axios.post(`/api/reservations/${resId}/checkin`);
      setSuccess('Vehicle checked in successfully! Yard slot marked as Occupied.');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to check in reservation.');
    }
  };

  const handleCancel = async (resId) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    setError('');
    setSuccess('');
    try {
      await axios.post(`/api/reservations/${resId}/cancel`);
      setSuccess('Reservation cancelled successfully.');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel reservation.');
    }
  };

  if (loading) {
    return <div className="text-center py-10 dark:text-white">Loading reservations panel...</div>;
  }

  const isAdmin = user?.role === 'Admin';

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-5 text-left">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
          <CalendarRange className="w-8 h-8 text-indigo-500" />
          <span>Pre-Booking Reservations</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isAdmin 
            ? 'Manage customer pre-booked slots and process check-ins upon arrival'
            : 'Guarantee a parking space by booking a slot in advance'}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-100 dark:bg-red-900/30 p-4 rounded-2xl border border-red-200 dark:border-red-800/40 text-left">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 dark:bg-green-900/30 p-4 rounded-2xl border border-green-200 dark:border-green-800/40 text-left">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Side (Booking Form) */}
        <div className="w-full lg:w-[360px] shrink-0 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 text-left">
            <Plus className="w-5 h-5 text-indigo-500" />
            <span>Book a Space</span>
          </h3>

          <form onSubmit={handleBook} className="space-y-4 text-left">
            {/* Vehicle Type */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Vehicle Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setVehicleType('Car'); setSelectedSlot(''); }}
                  className={`py-2 px-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    vehicleType === 'Car'
                      ? 'bg-blue-500 border-blue-500 text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Car className="w-4 h-4" />
                  <span>Car</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setVehicleType('Bike'); setSelectedSlot(''); }}
                  className={`py-2 px-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    vehicleType === 'Bike'
                      ? 'bg-green-500 border-green-500 text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Bike className="w-4 h-4" />
                  <span>Bike</span>
                </button>
              </div>
            </div>

            {/* Vehicle Number */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Vehicle Number</label>
              <input
                type="text"
                required
                placeholder="e.g. TN-01-AA-1234"
                className="block w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 border sm:text-sm focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                value={vehicleNumber}
                onChange={e => setVehicleNumber(e.target.value)}
              />
            </div>

            {/* Slot Selection */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">Choose Available Slot</label>
              <select
                required
                className="block w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 border sm:text-sm focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                value={selectedSlot}
                onChange={e => setSelectedSlot(e.target.value)}
              >
                <option value="">-- Select Spot --</option>
                {availableSlots.map(slot => (
                  <option key={slot.id} value={slot.id}>
                    Slot #{slot.id}
                  </option>
                ))}
              </select>
              {availableSlots.length === 0 && (
                <p className="text-[10px] text-red-500 mt-1">No slots currently empty for {vehicleType}s.</p>
              )}
            </div>

            {/* Date / Time */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-450">Arrival Time</label>
              <input
                type="datetime-local"
                required
                className="block w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 border sm:text-sm focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                value={resTime}
                onChange={e => setResTime(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-750 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50"
            >
              <span>{actionLoading ? 'Booking Slot...' : 'Book Reservation'}</span>
            </button>
          </form>
        </div>

        {/* Right Side (List of bookings) */}
        <div className="flex-1 w-full">
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white text-left">
                {isAdmin ? 'System-Wide Reservations' : 'My Reservations'}
              </h3>
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            {reservations.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <CalendarRange className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="font-semibold text-sm">No reservations found.</p>
                <p className="text-xs text-gray-400">Pre-booked vehicles will be listed here.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {reservations.map(res => {
                  const isPending = res.status === 'Pending';
                  const isCheckedIn = res.status === 'CheckedIn';
                  const isCancelled = res.status === 'Cancelled';
                  
                  return (
                    <div key={res.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/10 transition-colors">
                      <div className="flex items-start gap-3.5 text-left">
                        {/* Vehicle Icon Badge */}
                        <div className={`p-3 rounded-2xl shrink-0 ${res.vehicle_type === 'Car' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500' : 'bg-green-50 dark:bg-green-900/20 text-green-500'}`}>
                          {res.vehicle_type === 'Car' ? <Car className="w-6 h-6" /> : <Bike className="w-6 h-6" />}
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-gray-900 dark:text-white tracking-wide">{res.vehicle_number}</span>
                            <span className="text-[10px] font-bold bg-slate-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-500 dark:text-gray-400">Slot #{res.slot_id}</span>
                            
                            {/* Status Badges */}
                            {isPending && <span className="text-[10px] font-extrabold bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-0.5 rounded-full">Pending</span>}
                            {isCheckedIn && <span className="text-[10px] font-extrabold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">Checked In</span>}
                            {isCancelled && <span className="text-[10px] font-extrabold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full">Cancelled</span>}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 font-medium">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Res Time: {format(new Date(res.reservation_time), 'PPp')}</span>
                            </span>
                            {isAdmin && (
                              <span className="flex items-center gap-1 text-indigo-400">
                                <User className="w-3.5 h-3.5" />
                                <span>User: {res.user_name}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Admin Checkin / User Cancel actions */}
                      {isPending && (
                        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                          {/* Cancel is allowed by user who owns it, or Admin */}
                          <button
                            onClick={() => handleCancel(res.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 border border-red-200 dark:border-red-800/40 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100 rounded-xl transition-all"
                            title="Cancel Booking"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Cancel</span>
                          </button>
                          
                          {/* Checkin is processed by Admins/operators */}
                          {isAdmin && (
                            <button
                              onClick={() => handleCheckIn(res.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 border border-transparent text-xs font-semibold text-white bg-green-600 hover:bg-green-750 rounded-xl shadow-sm transition-all active:scale-[0.97]"
                              title="Process Yard Check-In"
                            >
                              <Check className="w-4 h-4" />
                              <span>Check-In</span>
                            </button>
                          )}
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
    </div>
  );
}
