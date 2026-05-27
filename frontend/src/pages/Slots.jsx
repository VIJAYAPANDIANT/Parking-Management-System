import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Plus } from 'lucide-react';

export default function Slots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newType, setNewType] = useState('Car');
  const [error, setError] = useState('');

  const fetchSlots = async () => {
    try {
      const res = await axios.get('/api/slots');
      setSlots(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/slots', { type: newType });
      setSlots([...slots, res.data]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create slot');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this slot?')) return;
    try {
      await axios.delete(`/api/slots/${id}`);
      setSlots(slots.filter(s => s.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete slot');
    }
  };

  if (loading) return <div className="text-center py-10 dark:text-white">Loading slots...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Slot Management</h1>
        
        <form onSubmit={handleCreate} className="flex gap-2">
          <select 
            value={newType} 
            onChange={e => setNewType(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
          >
            <option value="Car">Car</option>
            <option value="Bike">Bike</option>
          </select>
          <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-1" /> Add Slot
          </button>
        </form>
      </div>

      {error && <div className="text-red-500 text-sm bg-red-100 p-2 rounded">{error}</div>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {slots.map(slot => (
          <div key={slot.id} className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 relative group ${slot.status === 'Available' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}`}>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Slot #{slot.id}</span>
            <span className="text-lg font-bold dark:text-white">{slot.type}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${slot.status === 'Available' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
              {slot.status}
            </span>
            <button 
              onClick={() => handleDelete(slot.id)}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete Slot"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {slots.length === 0 && (
           <p className="col-span-full text-center text-gray-500 dark:text-gray-400 py-10">No slots defined yet. Add some slots above.</p>
        )}
      </div>
    </div>
  );
}
