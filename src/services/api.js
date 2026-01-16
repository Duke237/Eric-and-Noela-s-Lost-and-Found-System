// Mock API Service for Lost and Found App
// This simulates backend API calls with mock data stored in localStorage
// ENHANCED with AI capabilities

import { aiEngine } from './aiEngine.js';
import { chatbot } from './chatbot.js';
import SmartNotificationManager from './smartNotifications.js';

const MOCK_DELAY = 800; // Simulate network delay

// Helper to get/set data from localStorage
const getStorageData = (key, defaultValue = []) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || defaultValue;
  } catch {
    return defaultValue;
  }
};

const setStorageData = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Initialize mock database from localStorage
let mockUsers = getStorageData('users', [
  {
    id: '1',
    email: 'demo@example.com',
    password: 'demo123',
    name: 'Demo User',
    createdAt: new Date().toISOString(),
  },
]);

let mockItems = getStorageData('items', [
  {
    id: '1',
    type: 'lost',
    category: 'Electronics',
    itemName: 'iPhone 13 Pro',
    description: 'Space Gray iPhone 13 Pro with a blue case',
    location: 'Central Library, 2nd Floor',
    date: '2026-01-10',
    contactInfo: 'john@example.com',
    userId: '1',
    status: 'active',
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: '2',
    type: 'found',
    category: 'Accessories',
    itemName: 'Black Wallet',
    description: 'Leather wallet with student ID inside',
    location: 'Student Center, Ground Floor',
    date: '2026-01-12',
    contactInfo: 'sarah@example.com',
    userId: '1',
    status: 'active',
    createdAt: '2026-01-12T14:30:00Z',
  },
]);

let mockNotifications = getStorageData('notifications', [
  {
    id: '1',
    userId: '1',
    title: 'Potential Match Found',
    message: 'Someone reported finding an item similar to your lost iPhone',
    type: 'match',
    read: false,
    createdAt: '2026-01-13T09:00:00Z',
  },
  {
    id: '2',
    userId: '1',
    title: 'New Message',
    message: 'You have a new message about your found item',
    type: 'message',
    read: false,
    createdAt: '2026-01-13T11:30:00Z',
  },
]);

// Save to localStorage whenever data changes
const saveMockData = () => {
  setStorageData('users', mockUsers);
  setStorageData('items', mockItems);
  setStorageData('notifications', mockNotifications);
};

// Helper to simulate async operations
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Auth API
export const authAPI = {
  login: async (email, password) => {
    await delay(MOCK_DELAY);
    
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      const { password, ...userWithoutPassword } = user;
      localStorage.setItem('currentUser', JSON.stringify({ ...userWithoutPassword, id: user.id }));
      return {
        success: true,
        user: userWithoutPassword,
        token: 'mock-jwt-token-' + user.id,
      };
    }
    
    return {
      success: false,
      error: 'Invalid email or password',
    };
  },

  signup: async (userData) => {
    await delay(MOCK_DELAY);
    
    const existingUser = mockUsers.find(u => u.email === userData.email);
    
    if (existingUser) {
      return {
        success: false,
        error: 'Email already registered',
      };
    }
    
    const newUser = {
      id: String(mockUsers.length + 1),
      ...userData,
      createdAt: new Date().toISOString(),
    };
    
    mockUsers.push(newUser);
    
    // Create location risk notification for new user
    const locationRiskPercentage = Math.floor(Math.random() * 40) + 45; // 45-85%
    const locations = [
      'your area',
      'crowded public spaces in your location',
      'high-traffic areas near you',
      'busy transit hubs in your region',
      'commercial districts near you'
    ];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    
    mockNotifications.push({
      id: String(mockNotifications.length + 1),
      userId: newUser.id,
      title: 'Location Risk Alert',
      message: `Based on reports in ${randomLocation}, there is a ${locationRiskPercentage}% chance of losing an item in your area. Stay alert and keep track of your belongings!`,
      type: 'location-risk',
      read: false,
      createdAt: new Date().toISOString(),
    });
    
    // Initialize user stats
    localStorage.setItem(`userStats_${newUser.id}`, JSON.stringify({
      isInitialized: true,
      lostItems: 0,
      foundItems: 0,
      createdAt: new Date().toISOString(),
    }));
    
    localStorage.setItem('currentUser', JSON.stringify({ ...newUser, id: newUser.id }));
    
    saveMockData();
    
    const { password, ...userWithoutPassword } = newUser;
    return {
      success: true,
      user: userWithoutPassword,
      token: 'mock-jwt-token-' + newUser.id,
    };
  },

  logout: async () => {
    await delay(300);
    localStorage.removeItem('currentUser');
    return { success: true };
  },
};

// Items API
export const itemsAPI = {
  getAll: async () => {
    await delay(MOCK_DELAY);
    return {
      success: true,
      items: mockItems,
    };
  },

  getById: async (id) => {
    await delay(MOCK_DELAY);
    const item = mockItems.find(i => i.id === id);
    
    if (item) {
      return { success: true, item };
    }
    
    return { success: false, error: 'Item not found' };
  },

  getUserItems: async (userId) => {
    await delay(MOCK_DELAY);
    const userItems = mockItems.filter(i => i.userId === userId);
    return {
      success: true,
      items: userItems,
    };
  },

  create: async (itemData) => {
    await delay(MOCK_DELAY);
    
    // Get image data if provided
    let imageData = null;
    if (itemData.image instanceof File) {
      // Convert image file to base64 for storage
      imageData = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(itemData.image);
      });
    }
    
    const newItem = {
      id: String(mockItems.length + 1),
      itemName: itemData.itemName,
      category: itemData.category,
      description: itemData.description,
      location: itemData.location,
      date: itemData.date,
      contactInfo: itemData.contactInfo,
      type: itemData.type,
      userId: itemData.userId,
      image: imageData,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    
    mockItems.push(newItem);
    
    // Update user stats
    if (itemData.userId) {
      const userStats = JSON.parse(localStorage.getItem(`userStats_${itemData.userId}`) || '{}');
      if (itemData.type === 'lost') {
        userStats.lostItems = (userStats.lostItems || 0) + 1;
      } else if (itemData.type === 'found') {
        userStats.foundItems = (userStats.foundItems || 0) + 1;
      }
      userStats.isInitialized = true;
      localStorage.setItem(`userStats_${itemData.userId}`, JSON.stringify(userStats));
    }
    
    // Create notifications for all users except the one who reported
    const notificationTitle = itemData.type === 'lost' 
      ? `Lost Item Report: ${itemData.itemName}` 
      : `Found Item Report: ${itemData.itemName}`;
    
    const notificationMessage = itemData.type === 'lost'
      ? `${itemData.itemName} was lost on ${itemData.date} at ${itemData.location}. Category: ${itemData.category}. Contact: ${itemData.contactInfo}`
      : `${itemData.itemName} was found on ${itemData.date} at ${itemData.location}. Category: ${itemData.category}. Contact: ${itemData.contactInfo}`;
    
    // Create notification for all users
    mockUsers.forEach(user => {
      const notificationId = String(mockNotifications.length + 1);
      mockNotifications.push({
        id: notificationId,
        userId: user.id,
        title: notificationTitle,
        message: notificationMessage,
        type: itemData.type === 'lost' ? 'lost' : 'found',
        itemId: newItem.id,
        itemType: itemData.type,
        itemName: itemData.itemName,
        itemLocation: itemData.location,
        itemDate: itemData.date,
        itemImage: imageData,
        reportedBy: itemData.userId,
        read: false,
        createdAt: new Date().toISOString(),
      });
    });
    
    saveMockData();
    
    return {
      success: true,
      item: newItem,
    };
  },

  update: async (id, itemData) => {
    await delay(MOCK_DELAY);
    
    const index = mockItems.findIndex(i => i.id === id);
    
    if (index !== -1) {
      mockItems[index] = {
        ...mockItems[index],
        ...itemData,
      };
      saveMockData();
      
      return {
        success: true,
        item: mockItems[index],
      };
    }
    
    return { success: false, error: 'Item not found' };
  },

  delete: async (id) => {
    await delay(MOCK_DELAY);
    
    const index = mockItems.findIndex(i => i.id === id);
    
    if (index !== -1) {
      mockItems.splice(index, 1);
      saveMockData();
      return { success: true };
    }
    
    return { success: false, error: 'Item not found' };
  },
};

// Notifications API
export const notificationsAPI = {
  getAll: async (userId) => {
    await delay(MOCK_DELAY);
    const userNotifications = mockNotifications.filter(n => n.userId === userId);
    return {
      success: true,
      notifications: userNotifications,
    };
  },

  markAsRead: async (notificationId) => {
    await delay(300);
    
    const notification = mockNotifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.read = true;
      saveMockData();
      return { success: true };
    }
    
    return { success: false, error: 'Notification not found' };
  },

  markAllAsRead: async (userId) => {
    await delay(300);
    
    mockNotifications.forEach(n => {
      if (n.userId === userId) {
        n.read = true;
      }
    });
    saveMockData();
    
    return { success: true };
  },
};

// Chatbot API
export const chatbotAPI = {
  sendMessage: async (message, userId) => {
    await delay(500);
    const response = await chatbot.chat(message, userId);
    return {
      success: true,
      message: response.text,
      timestamp: new Date().toISOString(),
      suggestions: response.suggestions,
      actions: response.actions,
    };
  },

  getHistory: (userId) => {
    chatbot.loadConversation(userId);
    return chatbot.getHistory();
  },

  resetConversation: () => {
    chatbot.resetConversation();
    return { success: true };
  },
};

// ============================================
// AI FEATURES API
// ============================================

// AI Matching API
export const aiAPI = {
  // Get intelligent matches for an item
  getSmartMatches: async (itemId, userId) => {
    await delay(MOCK_DELAY);
    const items = getStorageData('items', []);
    const targetItem = items.find(i => i.id === itemId);
    
    if (!targetItem) {
      return { success: false, error: 'Item not found' };
    }

    const matches = aiEngine.MatchingEngine.findMatches(targetItem, items, 40);
    const nlpAnalysis = aiEngine.NLPEngine.parseDescription(targetItem.description);
    
    return {
      success: true,
      matches: matches.slice(0, 10),
      analysis: nlpAnalysis,
      totalMatches: matches.length,
    };
  },

  // Analyze item with full AI
  analyzeItem: async (itemId) => {
    await delay(MOCK_DELAY);
    const items = getStorageData('items', []);
    const targetItem = items.find(i => i.id === itemId);
    
    if (!targetItem) {
      return { success: false, error: 'Item not found' };
    }

    const analysis = await aiEngine.analyzeItem(targetItem, items);
    
    return {
      success: true,
      analysis,
    };
  },

  // Get location hotspots and predictions
  getLocationInsights: async (location) => {
    await delay(MOCK_DELAY);
    const items = getStorageData('items', []);
    const hotspots = aiEngine.getHotspots(items);
    const stats = aiEngine.LocationAnalyzer.getLocationStats(location, items);
    
    return {
      success: true,
      hotspots: hotspots.hotspots,
      highRiskLocations: hotspots.highRiskLocations,
      locationStats: stats,
    };
  },

  // Get all hotspots
  getHotspots: async () => {
    await delay(MOCK_DELAY);
    const items = getStorageData('items', []);
    const hotspots = aiEngine.getHotspots(items);
    
    return {
      success: true,
      data: hotspots,
    };
  },

  // Check user trust score
  checkUserTrust: async (userId) => {
    await delay(MOCK_DELAY);
    const items = getStorageData('items', []);
    const notifications = getStorageData('notifications', []);
    
    const trustAnalysis = aiEngine.checkUserTrust(userId, items, notifications);
    
    return {
      success: true,
      trustAnalysis,
    };
  },

  // Get NLP analysis for description
  analyzeDescription: async (description) => {
    await delay(500);
    const analysis = aiEngine.NLPEngine.parseDescription(description);
    
    return {
      success: true,
      analysis,
    };
  },

  // Find location prediction for lost item
  predictItemLocation: async (itemId) => {
    await delay(MOCK_DELAY);
    const items = getStorageData('items', []);
    const targetItem = items.find(i => i.id === itemId);
    
    if (!targetItem) {
      return { success: false, error: 'Item not found' };
    }

    const prediction = aiEngine.LocationAnalyzer.predictItemLocation(targetItem, items);
    
    return {
      success: true,
      prediction,
    };
  },

  // Compare images
  compareImages: async (image1Base64, image2Base64) => {
    await delay(1000);
    const similarity = await aiEngine.ImageAnalyzer.compareImages(image1Base64, image2Base64);
    
    return {
      success: true,
      similarity,
      message: similarity > 70 ? 'High similarity' : similarity > 40 ? 'Moderate similarity' : 'Low similarity',
    };
  },
};
