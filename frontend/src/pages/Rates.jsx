import { useState, useEffect } from 'react';
import axios from 'axios';
import { Coins, CheckCircle, Car, Bike, AlertCircle, Save, Loader2 } from 'lucide-react';

export default function Rates() {
  const [rates, setRates] = useState({ Car: 50, Bike: 20 });
  const [carRate, setCarRate] = useState(50);
  const [bikeRate, setBikeRate] = useState(20);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchRates = async () => {
    try {
      const res = await axios.get('/api/rates');
      // Format response array [{vehicle_type: 'Car', hourly_rate: 50}, ...]
      const ratesMap = {};
      res.data.forEach(item => {
        ratesMap[item.vehicle_type] = item.hourly_rate;
      });
      setRates(ratesMap);
      setCarRate(ratesMap.Car ?? 50);
      setBikeRate(ratesMap.Bike ?? 20);
    } catch (err) {
      console.error(err);
      setError('Failed to load rates from the database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);
    try {
      await axios.put('/api/rates', {
        rates: {
          Car: carRate,
          Bike: bikeRate
        }
      });
      setRates({ Car: carRate, Bike: bikeRate });
      setMessage('Rates updated successfully! All future parking exits will use the new pricing model.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save rates.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10 dark:text-white">Loading rates configuration...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-5 text-left">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
          <Coins className="w-7 h-7 text-indigo-500" />
          <span>Rates Manager</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Configure hourly parking prices for vehicles dynamically</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm bg-red-100 dark:bg-red-900/30 p-4 rounded-2xl border border-red-200 dark:border-red-800/40 text-left">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 dark:bg-green-900/30 p-4 rounded-2xl border border-green-200 dark:border-green-800/40 text-left">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Car Rate Configuration */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-500">
                <Car className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900 dark:text-white">Car Rate</h3>
                <p className="text-xs text-gray-400">Hourly pricing for Cars</p>
              </div>
            </div>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">₹{carRate} <span className="text-xs font-medium text-gray-400">/hr</span></span>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs text-gray-400 font-semibold">
              <span>Min: ₹10</span>
              <span>Max: ₹200</span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              step="5"
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              value={carRate}
              onChange={e => setCarRate(parseInt(e.target.value))}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sm text-gray-400 font-bold">
              ₹
            </div>
            <input
              type="number"
              min="1"
              required
              className="pl-8 block w-full rounded-xl border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 shadow-inner focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 dark:text-white px-3 py-2 border"
              value={carRate}
              onChange={e => setCarRate(Math.max(1, parseInt(e.target.value) || 0))}
            />
          </div>
        </div>

        {/* Bike Rate Configuration */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-2xl text-green-500">
                <Bike className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900 dark:text-white">Bike Rate</h3>
                <p className="text-xs text-gray-400">Hourly pricing for Bikes</p>
              </div>
            </div>
            <span className="text-2xl font-black text-green-600 dark:text-green-400">₹{bikeRate} <span className="text-xs font-medium text-gray-400">/hr</span></span>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs text-gray-400 font-semibold">
              <span>Min: ₹5</span>
              <span>Max: ₹100</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              value={bikeRate}
              onChange={e => setBikeRate(parseInt(e.target.value))}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sm text-gray-400 font-bold">
              ₹
            </div>
            <input
              type="number"
              min="1"
              required
              className="pl-8 block w-full rounded-xl border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 shadow-inner focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900 dark:text-white px-3 py-2 border"
              value={bikeRate}
              onChange={e => setBikeRate(Math.max(1, parseInt(e.target.value) || 0))}
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={saving || (rates.Car === carRate && rates.Bike === bikeRate)}
            className="inline-flex items-center gap-1.5 px-6 py-3 border border-transparent rounded-2xl shadow-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-750 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-indigo-600/10"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Rates...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
