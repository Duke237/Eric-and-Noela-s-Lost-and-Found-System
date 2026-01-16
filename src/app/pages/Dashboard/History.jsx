import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { History as HistoryIcon, AlertCircle, CheckCircle, Calendar, MapPin, Trash2 } from 'lucide-react';
import { itemsAPI } from '@/services/api';

export default function History() {
  const [userItems, setUserItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadUserItems();
  }, []);

  const loadUserItems = async () => {
    setIsLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await itemsAPI.getUserItems(user.id || '1');
      if (response.success) {
        setUserItems(response.items);
      }
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      await itemsAPI.delete(itemId);
      setUserItems(userItems.filter(item => item.id !== itemId));
    }
  };

  const filteredItems = filter === 'all'
    ? userItems
    : userItems.filter(item => item.type === filter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
            <HistoryIcon className="w-5 sm:w-6 h-5 sm:h-6 text-purple-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Reports</h1>
        </div>
        <p className="text-sm sm:text-base text-gray-600">View and manage all your reported items</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-4 sm:p-6 rounded-xl shadow-sm mb-6"
      >
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg font-medium transition-all whitespace-nowrap ${
              filter === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({userItems.length})
          </button>
          <button
            onClick={() => setFilter('lost')}
            className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg font-medium transition-all flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
              filter === 'lost'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <AlertCircle className="w-3 sm:w-4 h-3 sm:h-4" />
            Lost ({userItems.filter(i => i.type === 'lost').length})
          </button>
          <button
            onClick={() => setFilter('found')}
            className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg font-medium transition-all flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
              filter === 'found'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CheckCircle className="w-3 sm:w-4 h-3 sm:h-4" />
            Found ({userItems.filter(i => i.type === 'found').length})
          </button>
        </div>
      </motion.div>

      {filteredItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white p-8 sm:p-12 rounded-xl shadow-sm text-center"
        >
          <HistoryIcon className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No reports yet</h3>
          <p className="text-sm sm:text-base text-gray-600">Start by reporting a lost or found item</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
              className={`bg-white p-4 sm:p-6 rounded-xl shadow-sm border-2 ${
                item.type === 'lost' ? 'border-red-200' : 'border-green-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                    <div className={`px-2 sm:px-3 py-1 rounded-lg flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium ${
                      item.type === 'lost'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {item.type === 'lost' ? (
                        <><AlertCircle className="w-3 sm:w-4 h-3 sm:h-4" /> LOST</>
                      ) : (
                        <><CheckCircle className="w-3 sm:w-4 h-3 sm:h-4" /> FOUND</>
                      )}
                    </div>
                    <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs sm:text-sm font-medium">
                      {item.category}
                    </span>
                    <span className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium ${
                      item.status === 'active'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-1">{item.itemName}</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-2">{item.description}</p>

                  <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-600 min-w-0">
                      <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="pt-3 sm:pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Reported on:</p>
                    <p className="text-xs sm:text-sm text-gray-700">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
                  >
                    View
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => deleteItem(item.id)}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-xs sm:text-sm font-medium flex items-center justify-center gap-1 whitespace-nowrap"
                  >
                    <Trash2 className="w-3 sm:w-4 h-3 sm:h-4" />
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
