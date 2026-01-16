// Smart Notification Manager - Intelligent Alerts based on AI Analysis
import { aiEngine } from './aiEngine.js';

class SmartNotificationManager {
  static SIMILARITY_THRESHOLD = 60; // Only notify if similarity > 60%

  // Create intelligent notification for item match
  static createMatchNotification(userId, matchedItem, originalItem, similarityScore) {
    if (similarityScore < this.SIMILARITY_THRESHOLD) {
      return null; // Don't spam with low-quality matches
    }

    const confidenceLevel = this.getConfidenceLevel(similarityScore);
    
    return {
      id: String(Date.now()),
      userId,
      type: 'match_found',
      title: `🎉 ${confidenceLevel} Match Found!`,
      itemId: matchedItem.id,
      itemName: matchedItem.itemName,
      location: matchedItem.location,
      date: matchedItem.date,
      image: matchedItem.image,
      message: `A ${confidenceLevel.toLowerCase()} matching item was found!\n\nItem: ${matchedItem.itemName}\nLocation: ${matchedItem.location}\nSimilarity: ${similarityScore}%\n\nTap to view details and contact the person!`,
      similarityScore,
      confidenceLevel,
      read: false,
      actionRequired: true,
      createdAt: new Date().toISOString(),
    };
  }

  // Create location risk alert
  static createLocationAlert(userId, location, riskPercentage) {
    return {
      id: String(Date.now()),
      userId,
      type: 'location_risk',
      title: '⚠️ Location Risk Alert',
      location,
      riskPercentage,
      message: `⚠️ High item loss reported in this area!\n\nLocation: ${location}\nLoss Risk: ${riskPercentage}%\n\nBe extra careful with your belongings!`,
      read: false,
      actionRequired: false,
      createdAt: new Date().toISOString(),
    };
  }

  // Create new item notification (only for high-relevance items)
  static createRelevantItemNotification(userId, newItem, relevanceScore) {
    if (relevanceScore < 50) {
      return null; // Not relevant enough
    }

    const relevanceMessage = relevanceScore > 80 
      ? '🎯 Highly relevant item reported!' 
      : '👀 Possibly relevant item reported';

    return {
      id: String(Date.now()),
      userId,
      type: 'relevant_item',
      title: relevanceMessage,
      itemId: newItem.id,
      itemName: newItem.itemName,
      location: newItem.location,
      message: `${relevanceMessage} in your area!\n\nItem: ${newItem.itemName}\nLocation: ${newItem.location}\nRelevance: ${relevanceScore}%`,
      relevanceScore,
      read: false,
      actionRequired: false,
      createdAt: new Date().toISOString(),
    };
  }

  // Create fraud alert for admins
  static createFraudAlert(userId, fraudData) {
    return {
      id: String(Date.now()),
      type: 'fraud_alert',
      userId,
      title: '🚨 Suspicious Activity Detected',
      riskLevel: fraudData.riskLevel,
      message: `User activity flagged for review:\n\nRisk Level: ${fraudData.riskLevel.toUpperCase()}\nFlags: ${fraudData.flags.length}\n\nRecommended Action: ${fraudData.needsReview ? 'Manual Review Required' : 'Monitor'}`,
      details: fraudData,
      read: false,
      adminOnly: true,
      createdAt: new Date().toISOString(),
    };
  }

  // Create location hotspot notification
  static createHotspotNotification(userId, hotspot) {
    if (hotspot.lossProbability < 50) {
      return null; // Not significant
    }

    return {
      id: String(Date.now()),
      userId,
      type: 'location_hotspot',
      title: `🔥 Hotspot Alert: ${hotspot.location}`,
      location: hotspot.location,
      lossProbability: hotspot.lossProbability,
      message: `High item loss activity detected!\n\nLocation: ${hotspot.location}\nLoss Probability: ${hotspot.lossProbability}%\nRecent Reports: ${hotspot.totalReports}\n\nStay vigilant!`,
      read: false,
      actionRequired: false,
      createdAt: new Date().toISOString(),
    };
  }

  // Process new item and generate smart notifications
  static async processNewItemNotifications(newItem, allItems, allUsers) {
    const notifications = [];
    
    // Find matches for this item
    const matches = aiEngine.MatchingEngine.findMatches(newItem, allItems, 60);
    
    // Create notifications for matched items' owners
    matches.slice(0, 3).forEach(match => { // Limit to top 3 matches
      const notification = this.createMatchNotification(
        match.item.userId,
        newItem,
        match.item,
        match.similarity
      );
      if (notification) notifications.push(notification);
    });

    // Check location risk
    const locationStats = aiEngine.LocationAnalyzer.getLocationStats(newItem.location, allItems);
    const riskPercentage = locationStats.lostItems > 0 
      ? Math.round((locationStats.lostItems / (locationStats.lostItems + locationStats.foundItems)) * 100)
      : 0;

    if (riskPercentage > 60) {
      // Notify all users about high-risk location
      allUsers.forEach(user => {
        const alert = this.createLocationAlert(user.id, newItem.location, riskPercentage);
        if (alert) notifications.push(alert);
      });
    }

    return notifications;
  }

  // Get relevance score for an item to a user
  static calculateItemRelevance(item, userProfile, userItems) {
    let score = 0;

    // Check if same category
    const userCategories = userItems.map(i => i.category);
    if (userCategories.includes(item.category)) score += 30;

    // Check if nearby location
    const userLocations = userItems.map(i => i.location);
    if (userLocations.includes(item.location)) score += 40;

    // Check if recent
    const daysDiff = aiEngine.MatchingEngine.dateDifference(item.date, new Date().toISOString().split('T')[0]);
    if (daysDiff <= 3) score += 20;

    // Check if matches lost items
    const matchedType = item.type === 'lost' ? 'found' : 'lost';
    const hasMatchingType = userItems.some(i => i.type === matchedType);
    if (hasMatchingType) score += 10;

    return Math.min(100, score);
  }

  // Filter notifications by user preferences
  static filterNotificationsByPreference(notifications, userPreferences = {}) {
    const {
      minimumSimilarity = 60,
      includeLocationAlerts = true,
      includeNewItems = false,
      maxDaily = 10,
    } = userPreferences;

    return notifications
      .filter(notif => {
        if (notif.type === 'match_found' && notif.similarityScore < minimumSimilarity) {
          return false;
        }
        if (notif.type === 'location_risk' && !includeLocationAlerts) {
          return false;
        }
        if (notif.type === 'relevant_item' && !includeNewItems) {
          return false;
        }
        return true;
      })
      .slice(0, maxDaily);
  }

  // Get confidence level text
  static getConfidenceLevel(score) {
    if (score >= 90) return '🟢 Perfect';
    if (score >= 80) return '🟢 High';
    if (score >= 70) return '🟡 Good';
    if (score >= 60) return '🟡 Fair';
    return '⚫ Low';
  }

  // Batch process notifications
  static batchCreateNotifications(newItems, allItems, allUsers) {
    const allNotifications = [];

    newItems.forEach(newItem => {
      const itemNotifications = this.processNewItemNotifications(newItem, allItems, allUsers);
      allNotifications.push(...itemNotifications);
    });

    return allNotifications;
  }

  // Deduplicate similar notifications
  static deduplicateNotifications(notifications) {
    const seen = new Set();
    return notifications.filter(notif => {
      const key = `${notif.userId}_${notif.type}_${notif.itemId || notif.location}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Prioritize notifications
  static prioritizeNotifications(notifications) {
    return notifications.sort((a, b) => {
      // High-confidence matches first
      if (a.type === 'match_found' && b.type !== 'match_found') return -1;
      if (a.type !== 'match_found' && b.type === 'match_found') return 1;

      // Within match type, by similarity
      if (a.type === 'match_found' && b.type === 'match_found') {
        return b.similarityScore - a.similarityScore;
      }

      // Action required items first
      if (a.actionRequired && !b.actionRequired) return -1;
      if (!a.actionRequired && b.actionRequired) return 1;

      // Newer first
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  // Smart batch notification creation
  static async smartNotifyAllUsers(newItem, allItems, allUsers) {
    const notifications = [];
    const locationStats = aiEngine.LocationAnalyzer.analyzeLocationHotspots(allItems);
    const isHighRiskLocation = locationStats.hotspots.some(h => 
      h.location === newItem.location && h.lossProbability > 60
    );

    allUsers.forEach(user => {
      // Only notify about matches if same type opposite
      const oppositeType = newItem.type === 'lost' ? 'found' : 'lost';
      const userHasOppositeType = allItems.some(i => 
        i.userId === user.id && i.type === oppositeType
      );

      if (userHasOppositeType) {
        const matches = aiEngine.MatchingEngine.findMatches(newItem, allItems, 60);
        matches.slice(0, 1).forEach(match => {
          const notif = this.createMatchNotification(
            user.id,
            newItem,
            newItem,
            match.similarity
          );
          if (notif) notifications.push(notif);
        });
      }

      // Location risk notification
      if (isHighRiskLocation) {
        const alert = this.createLocationAlert(user.id, newItem.location, 65);
        if (alert) notifications.push(alert);
      }
    });

    return this.prioritizeNotifications(notifications);
  }
}

export default SmartNotificationManager;
