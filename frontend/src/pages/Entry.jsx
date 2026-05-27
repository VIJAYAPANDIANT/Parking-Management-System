import { useState } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { CarFront, CheckCircle2 } from 'lucide-react';

export default function Entry() {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [type, setType] = useState('Car');
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setTicket(null);

    try {
      const res = await axios.post('/api/parking/entry', { 
        vehicle_number: vehicleNumber.toUpperCase(), 
        type 
      });
      setTicket({
        ...res.data,
        vehicle_number: vehicleNumber.toUpperCase(),
        type
      });
      setVehicleNumber('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process vehicle entry');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700">
        <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
            <CarFront className="w-5 h-5 mr-2 text-indigo-500" />
            New Vehicle Entry
          </h3>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-500 text-sm bg-red-100 dark:bg-red-900/30 p-3 rounded">{error}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vehicle Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TN-00-AA-1111"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white px-3 py-2 border"
                  value={vehicleNumber}
                  onChange={e => setVehicleNumber(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vehicle Type</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white px-3 py-2 border"
                  value={type}
                  onChange={e => setType(e.target.value)}
                >
                  <option value="Car">Car</option>
                  <option value="Bike">Bike</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Generate Ticket & Assign Slot
              </button>
            </div>
          </form>
        </div>
      </div>

      {ticket && (
        <div className="bg-green-50 dark:bg-gray-800 shadow rounded-lg border border-green-200 dark:border-gray-700 overflow-hidden transform transition-all duration-500 scale-100">
          <div className="p-6 sm:p-8 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Parking Ticket Generated!</h2>
            
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-inner max-w-sm mx-auto p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 space-y-4">
              <div className="flex justify-center mb-6 bg-white p-2 rounded-lg inline-block">
                <QRCodeSVG 
                  value={JSON.stringify({ 
                    id: ticket.record_id, 
                    vn: ticket.vehicle_number, 
                    slot: ticket.slot_id 
                  })} 
                  size={140}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Vehicle No</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{ticket.vehicle_number}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Assigned Slot</p>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">#{ticket.slot_id} ({ticket.type})</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Entry Time</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {format(new Date(ticket.entry_time), 'PPpp')}
                  </p>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-green-700 dark:text-green-400 mt-4">Please present this QR code at the exit gate.</p>
          </div>
        </div>
      )}
    </div>
  );
}
