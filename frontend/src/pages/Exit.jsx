import { useState } from 'react';
import axios from 'axios';
import { LogOut, IndianRupee, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function Exit() {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);

  const handleExit = async (e) => {
    e.preventDefault();
    setError('');
    setReceipt(null);

    try {
      const res = await axios.post('http://localhost:5000/api/parking/exit', { 
        vehicle_number: vehicleNumber.toUpperCase()
      });
      setReceipt({
        ...res.data,
        vehicle_number: vehicleNumber.toUpperCase()
      });
      setVehicleNumber('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process vehicle exit. Make sure it is parked.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700">
        <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
           <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
             <LogOut className="w-5 h-5 mr-2 text-indigo-500" />
             Process Vehicle Exit
           </h3>
        </div>
        <div className="p-6">
          <form onSubmit={handleExit} className="space-y-4">
            {error && <div className="text-red-500 text-sm bg-red-100 dark:bg-red-900/30 p-3 rounded">{error}</div>}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Enter Vehicle Number</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <div className="relative flex items-stretch flex-grow focus-within:z-10">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="TN-00-AA-1111"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-none rounded-l-md pl-10 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 border"
                    value={vehicleNumber}
                    onChange={e => setVehicleNumber(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-1 focus:ring-indigo-500"
                >
                  <IndianRupee className="h-5 w-5" />
                  <span>Process Exit</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {receipt && (
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden max-w-md mx-auto transform transition-all border border-gray-200 dark:border-gray-700">
          <div className="bg-indigo-600 p-6 text-center text-white">
            <IndianRupee className="w-12 h-12 mx-auto mb-2 opacity-80" />
            <h2 className="text-2xl font-bold">Payment Receipt</h2>
            <p className="text-indigo-200 text-sm">{format(new Date(receipt.exit_time), 'PPp')}</p>
          </div>
          <div className="p-6 space-y-4 bg-gray-50 dark:bg-gray-900 border-t border-dashed border-gray-300 dark:border-gray-700">
             <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-800">
               <span className="text-gray-500 dark:text-gray-400 text-sm uppercase">Vehicle No</span>
               <span className="font-bold text-gray-900 dark:text-white text-lg">{receipt.vehicle_number}</span>
             </div>
             <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-800">
               <span className="text-gray-500 dark:text-gray-400 text-sm uppercase">Duration</span>
               <span className="font-medium text-gray-900 dark:text-white">{receipt.duration_hours} hour(s)</span>
             </div>
             <div className="flex justify-between items-center pt-2">
               <span className="text-gray-900 dark:text-white font-bold text-xl uppercase">Total Fee</span>
               <span className="font-bold text-green-600 dark:text-green-400 text-3xl">₹{receipt.fee}</span>
             </div>
          </div>
          <div className="p-4 bg-gray-100 dark:bg-gray-800 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
            Thank you for parking with us! Have a safe journey.
          </div>
        </div>
      )}
    </div>
  );
}
