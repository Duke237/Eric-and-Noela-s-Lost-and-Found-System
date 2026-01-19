/**
 * AI Matching Service
 * Handles intelligent item matching and smart notifications
 * When a new item is reported, this service:
 * 1. Finds matching items using AI engine
 * 2. Creates targeted notifications for affected users
 * 3. Logs all matching results
 */

const { pool } = require('../db');

class AIMatchingService {
  /**
   * Process a newly created item and find matches using AI
   * @param {Object} newItem - The newly created item
   * @param {number} newItem.id - Item ID
   * @param {string} newItem.type - 'lost' or 'found'
   * @param {number} newItem.user_id - User ID who reported the item
   * @param {string} newItem.item_name - Item name
   * @param {string} newItem.description - Item description
   * @param {string} newItem.location - Location reported
   * @param {string} newItem.date - Date reported
   * @param {string} newItem.category - Item category
   * @returns {Promise<{success: boolean, matches: Array, notificationsCreated: number}>}
   */
  static async processNewItem(newItem) {
    try {
      console.log(`\n🤖 [AI MATCHING SERVICE] Processing new ${newItem.type} item: "${newItem.item_name}"`);
      
      const connection = await pool.getConnection();
      
      // Get all active items except the one just created
      const [allItems] = await connection.query(
        'SELECT * FROM items WHERE id != ? AND status = "active"',
        [newItem.id]
      );
      
      console.log(`📊 Checking against ${allItems.length} existing items...`);
      
      // Find matching items
      const matches = this.findMatches(newItem, allItems);
      
      console.log(`✨ Found ${matches.length} potential matches`);
      
      let notificationsCreated = 0;
      
      // If this is a FOUND item, notify the owners of matching LOST items
      if (newItem.type === 'found' && matches.length > 0) {
        for (const match of matches) {
          try {
            const notification = await this.createMatchNotification(
              connection,
              match.item.user_id, // Person who reported the lost item
              newItem, // The found item
              match.item, // The lost item
              match.similarity
            );
            
            if (notification) {
              notificationsCreated++;
              console.log(`✅ Notification created for user ${match.item.user_id} (Similarity: ${match.similarity}%)`);
            }
          } catch (error) {
            console.error(`❌ Failed to create notification for user ${match.item.user_id}:`, error.message);
          }
        }
      }
      
      // If this is a LOST item, notify the owners of matching FOUND items
      if (newItem.type === 'lost' && matches.length > 0) {
        for (const match of matches) {
          try {
            const notification = await this.createMatchNotification(
              connection,
              match.item.user_id, // Person who found the matching item
              match.item, // The found item
              newItem, // The lost item
              match.similarity
            );
            
            if (notification) {
              notificationsCreated++;
              console.log(`✅ Notification created for user ${match.item.user_id} (Similarity: ${match.similarity}%)`);
            }
          } catch (error) {
            console.error(`❌ Failed to create notification for user ${match.item.user_id}:`, error.message);
          }
        }
      }
      
      await connection.release();
      
      console.log(`📈 AI Matching Summary: ${notificationsCreated} notifications created from ${matches.length} matches\n`);
      
      return {
        success: true,
        matches: matches,
        notificationsCreated: notificationsCreated
      };
    } catch (error) {
      console.error('❌ [AI MATCHING SERVICE] Error:', error.message);
      return {
        success: false,
        error: error.message,
        matches: [],
        notificationsCreated: 0
      };
    }
  }

  /**
   * Find matching items using AI similarity scoring
   * @private
   */
  static findMatches(targetItem, allItems, threshold = 60) {
    const matches = [];
    
    for (const item of allItems) {
      // Don't match items of the same type
      if (item.type === targetItem.type) {
        continue;
      }
      
      const similarity = this.calculateSimilarity(targetItem, item);
      
      if (similarity >= threshold) {
        matches.push({
          item,
          similarity
        });
      }
    }
    
    // Sort by similarity (highest first) and return top 5
    return matches
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
  }

  /**
   * Calculate similarity score between two items (0-100)
   * Based on: category, item name, colors, location, and date
   * @private
   */
  static calculateSimilarity(item1, item2) {
    let score = 0;
    let factors = 0;

    // 1. CATEGORY MATCHING (30 points max)
    if (item1.category && item2.category) {
      if (item1.category === item2.category) {
        score += 30;
        console.log(`   📦 Category match: ${item1.category}`);
      } else if (this.isCategorySimilar(item1.category, item2.category)) {
        score += 15;
      }
    }
    factors += 30;

    // 2. ITEM NAME MATCHING (25 points max)
    if (item1.item_name && item2.item_name) {
      const nameSimilarity = this.calculateStringSimilarity(item1.item_name, item2.item_name);
      const nameBonus = Math.round(nameSimilarity * 25);
      score += nameBonus;
      if (nameBonus > 10) {
        console.log(`   📝 Item name similarity: ${nameSimilarity.toFixed(2)} (${nameBonus} points)`);
      }
    }
    factors += 25;

    // 3. COLOR MATCHING (20 points max) - extracted from description
    if (item1.description && item2.description) {
      const colors1 = this.extractColors(item1.description);
      const colors2 = this.extractColors(item2.description);
      
      const colorMatches = colors1.filter(c => colors2.includes(c)).length;
      if (colorMatches > 0) {
        const colorBonus = Math.min(20, colorMatches * 10);
        score += colorBonus;
        console.log(`   🎨 Color match: ${colors1.join(', ')} ↔ ${colors2.join(', ')} (${colorBonus} points)`);
      }
    }
    factors += 20;

    // 4. LOCATION MATCHING (20 points max)
    if (item1.location && item2.location) {
      const locationSimilarity = this.calculateStringSimilarity(item1.location, item2.location);
      const locationBonus = Math.round(locationSimilarity * 20);
      score += locationBonus;
      if (locationBonus > 8) {
        console.log(`   📍 Location similarity: ${locationSimilarity.toFixed(2)} (${locationBonus} points)`);
      }
    }
    factors += 20;

    // 5. DATE PROXIMITY (15 points max) - items reported close in time are more likely matches
    if (item1.date && item2.date) {
      const daysDiff = this.dateDifference(item1.date, item2.date);
      let dateBonus = 0;
      
      if (daysDiff <= 1) {
        dateBonus = 15; // Same day or next day
      } else if (daysDiff <= 3) {
        dateBonus = 10; // Within 3 days
      } else if (daysDiff <= 7) {
        dateBonus = 5; // Within a week
      }
      
      score += dateBonus;
      if (dateBonus > 0) {
        console.log(`   📅 Date proximity: ${daysDiff} days apart (${dateBonus} points)`);
      }
    }
    factors += 15;

    const finalScore = Math.round((score / factors) * 100);
    return finalScore;
  }

  /**
   * Calculate string similarity using Levenshtein distance
   * Returns a value between 0 and 1
   * @private
   */
  static calculateStringSimilarity(str1, str2) {
    const s1 = (str1 || '').toLowerCase().trim();
    const s2 = (str2 || '').toLowerCase().trim();
    
    if (s1 === s2) return 1;
    if (s1.length === 0 || s2.length === 0) return 0;
    
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   * @private
   */
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

  /**
   * Extract colors from description text
   * @private
   */
  static extractColors(description) {
    if (!description) return [];
    
    const colorList = [
      'red', 'blue', 'green', 'black', 'white', 'silver', 'gold',
      'brown', 'pink', 'gray', 'grey', 'purple', 'yellow', 'orange',
      'navy', 'cream', 'beige', 'bronze', 'copper', 'rose', 'maroon',
      'turquoise', 'teal', 'magenta', 'cyan', 'indigo', 'violet'
    ];
    
    const lower = description.toLowerCase();
    return colorList.filter(color => lower.includes(color));
  }

  /**
   * Check if two categories are similar
   * @private
   */
  static isCategorySimilar(cat1, cat2) {
    const electronics = ['Electronics', 'Phone', 'Laptop', 'Tablet', 'Watch', 'Camera', 'Headphones'];
    const accessories = ['Accessories', 'Wallet', 'Bag', 'Keys', 'Jewelry', 'Keychain', 'Belt', 'Scarf'];
    const clothing = ['Clothing', 'Jacket', 'Shoes', 'Hat', 'Coat', 'Shirt', 'Pants'];
    
    const isInGroup = (category, group) => group.some(item => item.toLowerCase() === category.toLowerCase());
    
    if (isInGroup(cat1, electronics) && isInGroup(cat2, electronics)) return true;
    if (isInGroup(cat1, accessories) && isInGroup(cat2, accessories)) return true;
    if (isInGroup(cat1, clothing) && isInGroup(cat2, clothing)) return true;
    
    return false;
  }

  /**
   * Calculate difference in days between two dates
   * @private
   */
  static dateDifference(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.abs(Math.floor((d1 - d2) / (1000 * 60 * 60 * 24)));
  }

  /**
   * Create a smart match notification
   * @private
   */
  static async createMatchNotification(connection, userId, foundItem, lostItem, similarity) {
    try {
      const itemTypeEmoji = foundItem.type === 'found' ? '✅' : '🔍';
      const matchTypeEmoji = similarity > 80 ? '🎉' : '👀';
      
      const title = `${matchTypeEmoji} Your ${similarity > 80 ? 'Perfect' : 'Possible'} Match Found!`;
      
      const message = `
${matchTypeEmoji} Good news! A ${foundItem.type === 'found' ? 'FOUND' : 'LOST'} item matches your report!

📦 Item: ${foundItem.item_name}
📍 Location: ${foundItem.location}
📅 Date: ${foundItem.date}
✨ Match Confidence: ${similarity}%

${similarity > 75 ? '🔥 This is a STRONG match! Contact the person immediately!' : 'Review this match and contact if interested.'}
`.trim();

      const [result] = await connection.query(
        `INSERT INTO notifications (user_id, item_id, item_name, location, type, date, image, message, read_status, is_viewed) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE, FALSE)`,
        [
          userId,
          foundItem.id,
          foundItem.item_name,
          foundItem.location,
          'match_found',
          foundItem.date,
          foundItem.image ? Buffer.from(foundItem.image, 'base64') : null,
          message
        ]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error creating match notification:', error.message);
      throw error;
    }
  }
}

module.exports = AIMatchingService;
