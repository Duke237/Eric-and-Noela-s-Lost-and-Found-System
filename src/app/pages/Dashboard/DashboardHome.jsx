import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, MapPin, Calendar, AlertCircle, CheckCircle, Mail, Phone } from 'lucide-react';
import { itemsAPI } from '@/services/api';

export default function DashboardHome() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  const categories = ['All', 'Electronics', 'Accessories', 'Documents', 'Clothing', 'Bags', 'Other'];

  useEffect(() => {
    loadItems();
    checkIfNewUser();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterType, filterCategory, items]);

  const checkIfNewUser = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userStats = JSON.parse(localStorage.getItem(`userStats_${user.id}`) || '{}');
    
    // If userStats doesn't exist or is empty, it's a new user
    if (!userStats.isInitialized) {
      setIsNewUser(true);
      // Initialize user stats
      localStorage.setItem(`userStats_${user.id}`, JSON.stringify({
        isInitialized: true,
        lostItems: 0,
        foundItems: 0,
        createdAt: new Date().toISOString(),
      }));
    } else {
      setIsNewUser(false);
    }
  };

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const response = await itemsAPI.getAll();
      if (response.success) {
        setItems(response.items);
      }
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...items];

    // Filter by type (lost/found/all)
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType);
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => 
        item.category.toLowerCase() === filterCategory.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.itemName.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.location.toLowerCase().includes(term)
      );
    }

    setFilteredItems(filtered);
  };

  const getWelcomeMessage = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const firstName = user.name?.split(' ')[0] || 'User';
    
    if (isNewUser) {
      return `Welcome ${firstName}`;
    } else {
      return `Welcome back ${firstName}`;
    }
  };

  const getUserStats = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userStats = JSON.parse(localStorage.getItem(`userStats_${user.id}`) || '{}');
    
    return {
      lostItems: userStats.lostItems || 0,
      foundItems: userStats.foundItems || 0,
    };
  };

  const stats = getUserStats();

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 sm:p-8 rounded-xl shadow-lg"
      >
        <h1 className="text-2xl sm:text-4xl font-bold mb-2">{getWelcomeMessage()}</h1>
        <p className="text-blue-100 text-sm sm:text-base">
          {isNewUser 
            ? "You're all set! Start reporting lost or found items to help your community."
            : "Continue managing your lost and found reports."}
        </p>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">All Reports</h2>
        <p className="text-sm sm:text-base text-gray-600">Browse all reported lost and found items</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 sm:p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-red-600 font-medium mb-1">Total Lost Items</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-700">
                {stats.lostItems}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-red-200 rounded-lg flex-shrink-0">
              <AlertCircle className="w-6 sm:w-8 h-6 sm:h-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-green-600 font-medium mb-1">Total Found Items</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-700">
                {stats.foundItems}
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-green-200 rounded-lg flex-shrink-0">
              <CheckCircle className="w-6 sm:w-8 h-6 sm:h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 rounded-xl shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-blue-600 font-medium mb-1">Active Reports</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-700">{stats.lostItems + stats.foundItems}</p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-200 rounded-lg flex-shrink-0">
              <Search className="w-6 sm:w-8 h-6 sm:h-8 text-blue-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white p-4 sm:p-6 rounded-xl shadow-sm space-y-4"
      >
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Type Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg font-medium transition-all whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setFilterType('lost')}
              className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg font-medium transition-all flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                filterType === 'lost'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              Lost
            </button>
            <button
              onClick={() => setFilterType('found')}
              className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg font-medium transition-all flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                filterType === 'found'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Found
            </button>
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category.toLowerCase()}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Results Count */}
        <p className="text-xs sm:text-sm text-gray-600">
          Showing {filteredItems.length} of {items.length} items
        </p>
      </motion.div>

      {/* Items List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white p-8 sm:p-12 rounded-xl shadow-sm text-center"
        >
          <Search className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No items found</h3>
          <p className="text-sm sm:text-base text-gray-600">Try adjusting your search or filters</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
              className={`bg-white p-4 sm:p-6 rounded-xl shadow-sm border-2 ${
                item.type === 'lost' ? 'border-red-200' : 'border-green-200'
              } relative overflow-hidden flex flex-col h-full`}
            >
              {/* Type Badge */}
              <div className={`absolute top-0 right-0 px-3 sm:px-4 py-1 rounded-bl-lg text-xs sm:text-sm font-semibold flex items-center gap-1 ${
                item.type === 'lost'
                  ? 'bg-red-600'
                  : 'bg-green-600'
              } text-white`}>
                {item.type === 'lost' ? (
                  <><AlertCircle className="w-3 h-3" /> LOST</>
                ) : (
                  <><CheckCircle className="w-3 h-3" /> FOUND</>
                )}
              </div>

              {/* Category */}
              <div className="mb-3 mt-6">
                <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full inline-block">
                  {item.category}
                </span>
              </div>

              {/* Item Name */}
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2">{item.itemName}</h3>

              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-2 flex-1">{item.description}</p>

              {/* Details */}
              <div className="space-y-2 mb-4 text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 flex-shrink-0 text-blue-600" />
                  <span className="truncate">{item.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 flex-shrink-0 text-purple-600" />
                  <span>{new Date(item.date).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Contact:</p>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                  {item.contactInfo.includes('@') ? (
                    <Mail className="w-3 sm:w-4 h-3 sm:h-4 text-blue-600 flex-shrink-0" />
                  ) : (
                    <Phone className="w-3 sm:w-4 h-3 sm:h-4 text-green-600 flex-shrink-0" />
                  )}
                  <span className="truncate">{item.contactInfo}</span>
                </div>
              </div>

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm sm:text-base font-medium rounded-lg shadow-md hover:shadow-xl transition-shadow"
              >
                View Details
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
