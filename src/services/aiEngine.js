// AI Engine for Lost & Found System
// Implements intelligent matching, image comparison, NLP, fraud detection, and location prediction

// ============================================
// 1. IMAGE COMPARISON & RECOGNITION
// ============================================

class ImageAnalyzer {
  // Analyze image color histogram (simplified)
  static async getImageFingerprint(imageBase64) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 50;
        canvas.height = 50;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 50, 50);
        
        const imageData = ctx.getImageData(0, 0, 50, 50);
        const data = imageData.data;
        
        // Simple color histogram
        let colorSum = 0;
        for (let i = 0; i < data.length; i += 4) {
          colorSum += (data[i] + data[i + 1] + data[i + 2]) / 3;
        }
        
        const fingerprint = {
          avgColor: Math.floor(colorSum / (data.length / 4)),
          brightness: Math.floor(colorSum / (data.length / 4)),
          timestamp: new Date().getTime(),
        };
        
        resolve(fingerprint);
      };
      img.onerror = () => resolve(null);
      img.src = imageBase64;
    });
  }

  // Compare two image fingerprints (0-100 similarity score)
  static async compareImages(image1Base64, image2Base64) {
    const fp1 = await this.getImageFingerprint(image1Base64);
    const fp2 = await this.getImageFingerprint(image2Base64);
    
    if (!fp1 || !fp2) return 0;
    
    const colorDiff = Math.abs(fp1.avgColor - fp2.avgColor);
    const brightnessDiff = Math.abs(fp1.brightness - fp2.brightness);
    
    const similarity = Math.max(0, 100 - (colorDiff + brightnessDiff) / 2);
    return Math.round(similarity);
  }
}

// ============================================
// 2. NATURAL LANGUAGE PROCESSING (NLP)
// ============================================

class NLPEngine {
  static colors = ['red', 'blue', 'green', 'black', 'white', 'silver', 'gold', 'brown', 'pink', 'gray', 'purple', 'yellow', 'orange', 'navy'];
  static itemTypes = ['phone', 'wallet', 'bag', 'watch', 'keychain', 'earbuds', 'laptop', 'tablet', 'card', 'glasses', 'umbrella', 'shoes', 'jacket'];
  
  // Extract keywords and attributes from description
  static extractKeywords(description) {
    const lower = description.toLowerCase();
    
    // Extract colors
    const colors = this.colors.filter(color => lower.includes(color));
    
    // Extract item types
    const itemTypes = this.itemTypes.filter(type => lower.includes(type));
    
    // Extract locations
    const locationPatterns = /(?:at|near|at the|in the|inside|outside|on the)\s+([a-z\s]+)(?:\.|,|$)/gi;
    const locations = [];
    let match;
    while ((match = locationPatterns.exec(lower)) !== null) {
      locations.push(match[1].trim());
    }
    
    // Extract time references
    const timeKeywords = ['today', 'yesterday', 'morning', 'afternoon', 'evening', 'night', 'week', 'month'];
    const times = timeKeywords.filter(time => lower.includes(time));
    
    // Extract condition words
    const conditions = [];
    if (lower.includes('broken') || lower.includes('damaged')) conditions.push('damaged');
    if (lower.includes('new') || lower.includes('brand new')) conditions.push('new');
    if (lower.includes('old') || lower.includes('worn')) conditions.push('old');
    
    return {
      colors,
      itemTypes,
      locations,
      times,
      conditions,
      keywords: lower.split(/\s+/).filter(w => w.length > 3),
    };
  }

  // Score matching based on keywords
  static scoreKeywordMatch(keywords1, keywords2) {
    let matches = 0;
    let total = Math.max(keywords1.length, keywords2.length);
    
    keywords1.forEach(keyword => {
      if (keywords2.includes(keyword)) matches++;
    });
    
    return total > 0 ? Math.round((matches / total) * 100) : 0;
  }

  // Convert description to structured data
  static parseDescription(description) {
    const keywords = this.extractKeywords(description);
    return {
      mainDescription: description,
      extractedColors: keywords.colors,
      itemType: keywords.itemTypes[0] || 'item',
      suggestedLocations: keywords.locations,
      timeFrame: keywords.times[0] || 'recently',
      condition: keywords.conditions[0] || 'unknown',
      confidence: Math.min(100, (keywords.colors.length + keywords.itemTypes.length) * 25),
    };
  }
}

// ============================================
// 3. INTELLIGENT ITEM MATCHING
// ============================================

class MatchingEngine {
  // Calculate similarity score between two items (0-100)
  static calculateSimilarity(lostItem, foundItem) {
    let score = 0;
    let factors = 0;

    // Category matching (30 points max)
    if (lostItem.category === foundItem.category) {
      score += 30;
    } else if (this.categorySimilarity(lostItem.category, foundItem.category) > 0.5) {
      score += 15;
    }
    factors += 30;

    // Item name matching (20 points max)
    const nameSimilarity = this.stringSimilarity(lostItem.itemName, foundItem.itemName);
    score += nameSimilarity * 20;
    factors += 20;

    // Color matching from description (15 points max)
    const lostKeywords = NLPEngine.extractKeywords(lostItem.description);
    const foundKeywords = NLPEngine.extractKeywords(foundItem.description);
    const colorMatch = this.arrayIntersection(lostKeywords.colors, foundKeywords.colors).length;
    if (colorMatch > 0) {
      score += Math.min(15, colorMatch * 10);
    }
    factors += 15;

    // Location matching (20 points max)
    const locationSimilarity = this.stringSimilarity(lostItem.location, foundItem.location);
    score += locationSimilarity * 20;
    factors += 20;

    // Date proximity (15 points max)
    const dateDiff = this.dateDifference(lostItem.date, foundItem.date);
    if (dateDiff <= 3) {
      score += Math.max(15 - dateDiff * 3, 5);
    }
    factors += 15;

    return Math.round((score / factors) * 100);
  }

  // Find best matches for an item
  static findMatches(targetItem, allItems, threshold = 40) {
    const matches = allItems
      .filter(item => item.id !== targetItem.id && item.type !== targetItem.type)
      .map(item => ({
        item,
        similarity: this.calculateSimilarity(targetItem, item),
      }))
      .filter(m => m.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity);

    return matches;
  }

  // Helper: String similarity (0-1)
  static stringSimilarity(str1, str2) {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    if (s1 === s2) return 1;
    
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  // Levenshtein distance algorithm
  static levenshteinDistance(s1, s2) {
    const distances = [];
    for (let i = 0; i <= s1.length; i++) {
      distances[i] = [i];
    }
    for (let j = 0; j <= s2.length; j++) {
      distances[0][j] = j;
    }
    
    for (let i = 1; i <= s1.length; i++) {
      for (let j = 1; j <= s2.length; j++) {
        if (s1[i - 1] === s2[j - 1]) {
          distances[i][j] = distances[i - 1][j - 1];
        } else {
          distances[i][j] = Math.min(
            distances[i - 1][j - 1] + 1,
            distances[i][j - 1] + 1,
            distances[i - 1][j] + 1
          );
        }
      }
    }
    
    return distances[s1.length][s2.length];
  }

  // Category similarity
  static categorySimilarity(cat1, cat2) {
    const electronicsCategories = ['Electronics', 'Phone', 'Laptop', 'Tablet', 'Watch'];
    const accessoryCategories = ['Accessories', 'Wallet', 'Bag', 'Keys', 'Jewelry'];
    
    const cat1Group = electronicsCategories.includes(cat1) ? 'electronics' : 'accessories';
    const cat2Group = electronicsCategories.includes(cat2) ? 'electronics' : 'accessories';
    
    return cat1Group === cat2Group ? 1 : 0;
  }

  // Date difference in days
  static dateDifference(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.abs(Math.floor((d1 - d2) / (1000 * 60 * 60 * 24)));
  }

  // Array intersection
  static arrayIntersection(arr1, arr2) {
    return arr1.filter(item => arr2.includes(item));
  }
}

// ============================================
// 4. FRAUD DETECTION
// ============================================

class FraudDetector {
  // Analyze user behavior for suspicious patterns
  static analyzeBehavior(userId, allItems, allNotifications) {
    const userItems = allItems.filter(item => item.userId === userId);
    const userNotifications = allNotifications.filter(n => n.userId === userId);
    
    const flags = [];
    const riskScore = 0;

    // Check for rapid reporting (multiple items in short time)
    if (userItems.length >= 5) {
      const dates = userItems.map(i => new Date(i.createdAt));
      const timeDiffs = [];
      for (let i = 1; i < dates.length; i++) {
        timeDiffs.push((dates[i] - dates[i - 1]) / (1000 * 60)); // minutes
      }
      const avgTimeDiff = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
      if (avgTimeDiff < 60) {
        flags.push({ type: 'rapid_reporting', severity: 'medium', message: 'Multiple items reported quickly' });
      }
    }

    // Check for conflicting reports (same location, opposite types)
    const locations = {};
    userItems.forEach(item => {
      if (!locations[item.location]) locations[item.location] = [];
      locations[item.location].push(item.type);
    });

    Object.entries(locations).forEach(([loc, types]) => {
      if (types.includes('lost') && types.includes('found')) {
        flags.push({ type: 'conflicting_reports', severity: 'high', message: `Reported both lost and found at ${loc}` });
      }
    });

    // Check for no contact info
    const noContactItems = userItems.filter(i => !i.contactInfo || i.contactInfo.trim() === '');
    if (noContactItems.length > 2) {
      flags.push({ type: 'missing_contact', severity: 'low', message: 'Multiple reports with no contact info' });
    }

    // Check for multiple claims on same item
    const itemClaims = {};
    userNotifications.forEach(notif => {
      if (notif.itemId) {
        itemClaims[notif.itemId] = (itemClaims[notif.itemId] || 0) + 1;
      }
    });

    Object.entries(itemClaims).forEach(([itemId, claims]) => {
      if (claims > 3) {
        flags.push({ type: 'excessive_claims', severity: 'high', message: 'Multiple claims on single item' });
      }
    });

    return {
      userId,
      riskLevel: flags.length > 2 ? 'high' : flags.length > 0 ? 'medium' : 'low',
      flags,
      needsReview: flags.some(f => f.severity === 'high'),
    };
  }

  // Detect suspicious patterns in items
  static validateItemClaim(claimingUser, originalItem) {
    const issues = [];
    
    // Check if description is too similar to original (possible copy)
    const similarity = MatchingEngine.stringSimilarity(
      claimingUser.description,
      originalItem.description
    );
    if (similarity > 0.9) {
      issues.push({ type: 'copied_description', severity: 'high' });
    }

    // Check timing (claimed too soon after report)
    const timeDiff = new Date(claimingUser.createdAt) - new Date(originalItem.createdAt);
    if (timeDiff < 5 * 60 * 1000) { // Less than 5 minutes
      issues.push({ type: 'suspicious_timing', severity: 'high' });
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendsReview: issues.length > 0,
    };
  }
}

// ============================================
// 5. LOCATION PREDICTION
// ============================================

class LocationAnalyzer {
  // Analyze hotspots for item loss/recovery
  static analyzeLocationHotspots(allItems) {
    const locations = {};

    allItems.forEach(item => {
      if (!locations[item.location]) {
        locations[item.location] = { lost: 0, found: 0, total: 0 };
      }
      locations[item.location][item.type]++;
      locations[item.location].total++;
    });

    // Calculate loss probability for each location
    const hotspots = Object.entries(locations)
      .map(([location, data]) => ({
        location,
        lossCount: data.lost,
        recoveryCount: data.found,
        totalReports: data.total,
        lossProbability: Math.round((data.lost / data.total) * 100),
        recoveryRate: data.found > 0 ? Math.round((data.found / data.lost) * 100) : 0,
      }))
      .sort((a, b) => b.totalReports - a.totalReports);

    return {
      hotspots,
      highRiskLocations: hotspots.filter(h => h.lossProbability > 60),
      highRecoveryLocations: hotspots.filter(h => h.recoveryRate > 50),
    };
  }

  // Predict likely location where lost item might be found
  static predictItemLocation(lostItem, allItems) {
    const similarItems = allItems.filter(item => {
      return item.type === 'found' && 
             item.category === lostItem.category &&
             MatchingEngine.dateDifference(item.date, lostItem.date) <= 7;
    });

    if (similarItems.length === 0) return null;

    // Find most common location for similar found items
    const locationFreq = {};
    similarItems.forEach(item => {
      locationFreq[item.location] = (locationFreq[item.location] || 0) + 1;
    });

    const sortedLocations = Object.entries(locationFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      predictions: sortedLocations.map(([location, frequency]) => ({
        location,
        confidence: Math.round((frequency / similarItems.length) * 100),
        similarItemsFound: frequency,
      })),
      advice: 'Based on similar items, these are likely places to search',
    };
  }

  // Get location statistics
  static getLocationStats(location, allItems) {
    const items = allItems.filter(item => item.location === location);
    return {
      location,
      totalReports: items.length,
      lostItems: items.filter(i => i.type === 'lost').length,
      foundItems: items.filter(i => i.type === 'found').length,
      mostCommonCategories: this.getMostCommon(items.map(i => i.category)),
    };
  }

  static getMostCommon(arr) {
    const freq = {};
    arr.forEach(item => {
      freq[item] = (freq[item] || 0) + 1;
    });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([item, count]) => ({ item, count }));
  }
}

// ============================================
// 6. MAIN AI ENGINE EXPORT
// ============================================

export const aiEngine = {
  ImageAnalyzer,
  NLPEngine,
  MatchingEngine,
  FraudDetector,
  LocationAnalyzer,

  // Comprehensive analysis function
  analyzeItem: async (item, allItems) => {
    const nlpAnalysis = NLPEngine.parseDescription(item.description);
    const matches = MatchingEngine.findMatches(item, allItems.filter(i => i.id !== item.id), 30);
    const locationPrediction = LocationAnalyzer.predictItemLocation(item, allItems);
    const locationStats = LocationAnalyzer.getLocationStats(item.location, allItems);

    return {
      itemId: item.id,
      nlpAnalysis,
      suggestedMatches: matches.slice(0, 5),
      locationInsights: {
        prediction: locationPrediction,
        statistics: locationStats,
      },
      confidence: nlpAnalysis.confidence,
    };
  },

  // Get all hotspots
  getHotspots: (allItems) => LocationAnalyzer.analyzeLocationHotspots(allItems),

  // Analyze user for fraud
  checkUserTrust: (userId, allItems, allNotifications) => {
    return FraudDetector.analyzeBehavior(userId, allItems, allNotifications);
  },
};
