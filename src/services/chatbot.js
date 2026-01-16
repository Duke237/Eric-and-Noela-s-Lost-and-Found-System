// Advanced AI Chatbot with NLP and Multi-turn Conversations
import { aiEngine } from './aiEngine.js';

class AIChatbot {
  constructor() {
    this.conversationHistory = [];
    this.currentContext = null;
    this.reportingSession = null;
  }

  // Main chat handler
  async chat(userMessage, userId) {
    const timestamp = new Date().toISOString();
    
    // Save user message
    this.conversationHistory.push({
      role: 'user',
      message: userMessage,
      timestamp,
    });

    // Get AI response
    const response = await this.generateResponse(userMessage, userId);
    
    // Save AI response
    this.conversationHistory.push({
      role: 'assistant',
      message: response.text,
      timestamp,
      suggestions: response.suggestions,
      actions: response.actions,
    });

    return response;
  }

  // Core response generation
  async generateResponse(userMessage, userId) {
    const lower = userMessage.toLowerCase().trim();
    
    // Intent classification
    const intent = this.classifyIntent(lower);
    
    // Route to appropriate handler
    switch (intent) {
      case 'report_lost':
        return this.handleReportLost(userMessage, userId);
      case 'report_found':
        return this.handleReportFound(userMessage, userId);
      case 'search_item':
        return this.handleSearchItem(userMessage, userId);
      case 'check_matches':
        return this.handleCheckMatches(userMessage, userId);
      case 'location_help':
        return this.handleLocationHelp(userMessage);
      case 'help':
        return this.handleHelp();
      case 'track_item':
        return this.handleTrackItem(userMessage, userId);
      default:
        return this.handleGeneralQuery(userMessage);
    }
  }

  // Intent classification
  classifyIntent(message) {
    const intents = {
      report_lost: ['lost', 'i lost', 'missing', 'cant find', 'have you seen'],
      report_found: ['found', 'i found', 'picked up', 'someone lost'],
      search_item: ['search', 'find', 'looking for', 'where is'],
      check_matches: ['any matches', 'similar', 'match found', 'found my item'],
      location_help: ['where', 'location', 'area', 'where to search', 'hotspot'],
      track_item: ['track', 'status', 'updates', 'news about'],
      help: ['help', 'what can you do', 'guide me', 'how to'],
    };

    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        return intent;
      }
    }
    return 'general';
  }

  // Handle report lost item
  handleReportLost(userMessage, userId) {
    if (!this.reportingSession) {
      this.reportingSession = { type: 'lost', step: 0, data: {} };
    }

    const steps = [
      {
        question: '📱 What item did you lose? (name, brand, type)',
        key: 'itemName',
      },
      {
        question: '📍 Where did you lose it? (location)',
        key: 'location',
      },
      {
        question: '📅 When did you lose it? (date)',
        key: 'date',
      },
      {
        question: '🎨 Can you describe it? (color, condition, special features)',
        key: 'description',
      },
      {
        question: '📧 How can someone contact you? (email or phone)',
        key: 'contactInfo',
      },
    ];

    const currentStep = this.reportingSession.step;
    
    if (currentStep < steps.length) {
      // Save answer from previous step
      if (currentStep > 0) {
        const previousStep = steps[currentStep - 1];
        this.reportingSession.data[previousStep.key] = userMessage;
      }

      const nextStep = steps[currentStep];
      this.reportingSession.step++;

      if (currentStep === steps.length - 1) {
        return {
          text: `Perfect! 🎉 I've collected all the information. Let me create your report:\n\n📋 Summary:\n- Item: ${this.reportingSession.data.itemName}\n- Location: ${this.reportingSession.data.location}\n- Date: ${this.reportingSession.data.date}\n- Description: ${this.reportingSession.data.description}\n\nWould you like me to submit this report?`,
          suggestions: ['Yes, submit', 'Cancel', 'Edit information'],
          actions: [{ type: 'finalize_report', data: this.reportingSession.data }],
        };
      }

      return {
        text: nextStep.question,
        suggestions: ['Skip this', 'Cancel report'],
        actions: [],
      };
    }

    return {
      text: 'Lost item reporting process started! 📋\n\nI\'ll help you report your lost item step by step.',
      suggestions: ['Continue', 'Cancel'],
      actions: [],
    };
  }

  // Handle report found item
  handleReportFound(userMessage, userId) {
    if (!this.reportingSession) {
      this.reportingSession = { type: 'found', step: 0, data: {} };
    }

    const steps = [
      {
        question: '📦 What item did you find? (name, brand, type)',
        key: 'itemName',
      },
      {
        question: '📍 Where did you find it? (location)',
        key: 'location',
      },
      {
        question: '📅 When did you find it? (date)',
        key: 'date',
      },
      {
        question: '🎨 Describe it in detail (color, condition, any identifying marks)',
        key: 'description',
      },
      {
        question: '📧 How can the owner contact you? (email or phone)',
        key: 'contactInfo',
      },
    ];

    const currentStep = this.reportingSession.step;
    
    if (currentStep < steps.length) {
      if (currentStep > 0) {
        const previousStep = steps[currentStep - 1];
        this.reportingSession.data[previousStep.key] = userMessage;
      }

      const nextStep = steps[currentStep];
      this.reportingSession.step++;

      if (currentStep === steps.length - 1) {
        return {
          text: `Excellent! 🎉 Found item report ready:\n\n📋 Summary:\n- Item: ${this.reportingSession.data.itemName}\n- Location: ${this.reportingSession.data.location}\n- Date: ${this.reportingSession.data.date}\n- Description: ${this.reportingSession.data.description}\n\nReady to submit?`,
          suggestions: ['Yes, submit', 'Cancel', 'Edit'],
          actions: [{ type: 'finalize_report', data: this.reportingSession.data }],
        };
      }

      return {
        text: nextStep.question,
        suggestions: ['Skip', 'Cancel'],
        actions: [],
      };
    }

    return {
      text: 'Found item reporting initiated! 📦\n\nLet\'s document what you found to help reunite it with its owner.',
      suggestions: ['Continue', 'Cancel'],
      actions: [],
    };
  }

  // Handle search for items
  handleSearchItem(userMessage, userId) {
    return {
      text: '🔍 I can help you search for items! Tell me:\n\n- What are you looking for?\n- What category? (Electronics, Accessories, etc)\n- Where did you lose/see it?\n- Any specific details?',
      suggestions: [
        'I lost my wallet',
        'Looking for a blue bag',
        'Search by location',
        'View all items',
      ],
      actions: [{ type: 'open_search' }],
    };
  }

  // Handle check for matches
  handleCheckMatches(userMessage, userId) {
    return {
      text: '✨ Let me search for potential matches in our system...\n\nTell me:\n- What item are you looking for?\n- When did you lose/find it?\n- Where exactly?',
      suggestions: [
        'Show recent matches',
        'High confidence matches only',
        'Search by category',
      ],
      actions: [{ type: 'run_smart_match' }],
    };
  }

  // Handle location-based help
  handleLocationHelp(userMessage) {
    const locations = [
      'Campus/School',
      'Shopping Mall',
      'Public Transport',
      'Office Building',
      'Park/Outdoor',
    ];

    return {
      text: '📍 Location Intelligence:\n\nI can provide you with:\n- High-loss areas (hotspots)\n- Where items are most likely recovered\n- Tips for each location type\n\nWhich location are you interested in?',
      suggestions: locations,
      actions: [{ type: 'show_hotspots' }],
    };
  }

  // Handle general help request
  handleHelp() {
    return {
      text: `👋 Hi! I'm your AI Assistant for the Lost & Found System.\n\nHere's what I can help with:\n\n📋 **Report Items**\n- "I lost my wallet" - Report a lost item\n- "I found a phone" - Report a found item\n\n🔍 **Search & Match**\n- "Search for my lost item" - Find potential matches\n- "Show matches for my item" - Get AI-powered suggestions\n\n📍 **Location Help**\n- "Where are hotspots?" - See high-loss areas\n- "Where to search?" - Get location predictions\n\n✨ **Tracking**\n- "Track my item" - Get updates on your reports\n- "Any matches?" - Check for new matches\n\n🛡️ **Safety**\n- I use AI to detect fraud and keep the system safe\n- Your data is secure\n\nWhat would you like to do?`,
      suggestions: [
        'Report lost item',
        'Report found item',
        'Search for item',
        'Check matches',
      ],
      actions: [],
    };
  }

  // Handle track item
  handleTrackItem(userMessage, userId) {
    return {
      text: '📊 Item Tracking\n\nWhich item would you like to track?\n- Your lost items\n- Your found items\n- Matches for specific item\n\nI\'ll show you all updates and potential matches!',
      suggestions: ['Show my lost items', 'Show my found items', 'Check for matches'],
      actions: [{ type: 'show_user_items' }],
    };
  }

  // Handle general queries
  handleGeneralQuery(userMessage) {
    const responses = {
      hello: '👋 Hello! How can I help you with your lost or found items today?',
      thanks: '😊 You\'re welcome! Anything else I can help with?',
      hi: '👋 Hi there! What can I assist you with?',
      default: `I understand you said: "${userMessage}"\n\nI can help you:\n- Report lost items\n- Report found items\n- Search for items\n- Get location insights\n\nWhat would you like to do?`,
    };

    let response = responses.default;
    
    if (userMessage.includes('hello') || userMessage === 'hi') {
      response = responses.hello;
    } else if (userMessage.includes('thanks') || userMessage.includes('thank')) {
      response = responses.thanks;
    }

    return {
      text: response,
      suggestions: [
        'Report lost item',
        'Report found item',
        'Search items',
        'Help',
      ],
      actions: [],
    };
  }

  // Reset conversation
  resetConversation() {
    this.conversationHistory = [];
    this.currentContext = null;
    this.reportingSession = null;
  }

  // Get conversation history
  getHistory() {
    return this.conversationHistory;
  }

  // Save conversation to localStorage
  saveConversation(userId) {
    localStorage.setItem(
      `chatHistory_${userId}`,
      JSON.stringify(this.conversationHistory)
    );
  }

  // Load conversation from localStorage
  loadConversation(userId) {
    const saved = localStorage.getItem(`chatHistory_${userId}`);
    if (saved) {
      this.conversationHistory = JSON.parse(saved);
    }
  }
}

// Export singleton instance
export const chatbot = new AIChatbot();
