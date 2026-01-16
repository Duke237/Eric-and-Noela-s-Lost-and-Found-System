import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { aiAPI } from '../../services/api';
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  MapPin, 
  Shield, 
  MessageCircle,
  AlertCircle,
  CheckCircle,
  Flame,
} from 'lucide-react';

export default function AIDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [hotspots, setHotspots] = useState(null);
  const [userTrust, setUserTrust] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    loadAIData();
  }, []);

  const loadAIData = async () => {
    try {
      const hotspotsData = await aiAPI.getHotspots();
      const trustData = await aiAPI.checkUserTrust(currentUser.id);
      
      setHotspots(hotspotsData.data);
      setUserTrust(trustData.trustAnalysis);
      setLoading(false);
    } catch (error) {
      console.error('Error loading AI data:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-12 h-12 text-blue-600" />
            <h1 className="text-5xl font-bold text-gray-900">AI Intelligence</h1>
          </div>
          <p className="text-xl text-gray-600">Powered by advanced AI for smarter item recovery</p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Zap },
            { id: 'hotspots', label: 'Hotspots', icon: Flame },
            { id: 'trust', label: 'Trust Score', icon: Shield },
            { id: 'features', label: 'AI Features', icon: Brain },
          ].map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:shadow-md'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin text-blue-600 mb-4">
              <Brain className="w-12 h-12" />
            </div>
            <p className="text-gray-600">Loading AI insights...</p>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid md:grid-cols-2 gap-8"
              >
                {/* AI Capabilities */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-2xl p-8 shadow-lg"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-500" />
                    AI Capabilities
                  </h2>
                  <div className="space-y-4">
                    {[
                      { name: 'Smart Matching', desc: 'AI compares items and finds matches', icon: CheckCircle },
                      { name: 'Image Analysis', desc: 'Visual similarity comparison', icon: CheckCircle },
                      { name: 'NLP Processing', desc: 'Understands item descriptions', icon: CheckCircle },
                      { name: 'Fraud Detection', desc: 'Identifies suspicious behavior', icon: Shield },
                      { name: 'Location Prediction', desc: 'Predicts where items are found', icon: MapPin },
                      { name: 'Smart Notifications', desc: 'Intelligent alerts only', icon: AlertCircle },
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <feature.icon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-900">{feature.name}</p>
                          <p className="text-sm text-gray-600">{feature.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* System Status */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 shadow-lg text-white"
                >
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Brain className="w-6 h-6" />
                    System Status
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-blue-100 text-sm">AI Engine</p>
                      <p className="text-2xl font-bold">🟢 Active</p>
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">Smart Matching</p>
                      <p className="text-2xl font-bold">✨ Enabled</p>
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">Fraud Detection</p>
                      <p className="text-2xl font-bold">🛡️ Monitoring</p>
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">Hotspot Analysis</p>
                      <p className="text-2xl font-bold">📍 Tracking</p>
                    </div>
                    <div className="pt-4 border-t border-blue-400">
                      <p className="text-blue-100 text-sm">AI Confidence Level</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-2 bg-blue-400 rounded-full overflow-hidden">
                          <div className="h-full bg-green-400 rounded-full" style={{width: '85%'}}></div>
                        </div>
                        <p className="font-bold">85%</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Hotspots Tab */}
            {activeTab === 'hotspots' && hotspots && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid md:grid-cols-2 gap-8"
              >
                {/* High Risk Locations */}
                <div className="bg-red-50 rounded-2xl p-8 shadow-lg border-2 border-red-200">
                  <h2 className="text-2xl font-bold text-red-900 mb-6 flex items-center gap-2">
                    <Flame className="w-6 h-6" />
                    High Risk Areas
                  </h2>
                  {hotspots.highRiskLocations.length > 0 ? (
                    <div className="space-y-4">
                      {hotspots.highRiskLocations.map((hotspot, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{ scale: 1.02 }}
                          className="bg-white p-4 rounded-lg border-l-4 border-red-500"
                        >
                          <p className="font-bold text-gray-900">{hotspot.location}</p>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                            <div>
                              <p className="text-gray-600">Loss Probability</p>
                              <p className="text-xl font-bold text-red-600">{hotspot.lossProbability}%</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Total Reports</p>
                              <p className="text-xl font-bold text-gray-900">{hotspot.totalReports}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No high-risk areas identified yet</p>
                  )}
                </div>

                {/* High Recovery Locations */}
                <div className="bg-green-50 rounded-2xl p-8 shadow-lg border-2 border-green-200">
                  <h2 className="text-2xl font-bold text-green-900 mb-6 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6" />
                    High Recovery Areas
                  </h2>
                  {hotspots.highRecoveryLocations.length > 0 ? (
                    <div className="space-y-4">
                      {hotspots.highRecoveryLocations.map((hotspot, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{ scale: 1.02 }}
                          className="bg-white p-4 rounded-lg border-l-4 border-green-500"
                        >
                          <p className="font-bold text-gray-900">{hotspot.location}</p>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                            <div>
                              <p className="text-gray-600">Recovery Rate</p>
                              <p className="text-xl font-bold text-green-600">{hotspot.recoveryRate}%</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Items Found</p>
                              <p className="text-xl font-bold text-gray-900">{hotspot.recoveryCount}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No recovery data available yet</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Trust Score Tab */}
            {activeTab === 'trust' && userTrust && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-blue-600" />
                  Your Trust Score
                </h2>

                <div className="mb-8">
                  <div className="flex items-end justify-between mb-2">
                    <p className="text-gray-600">Overall Risk Level</p>
                    <p className="text-3xl font-bold text-blue-600">{userTrust.riskLevel.toUpperCase()}</p>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        userTrust.riskLevel === 'low' ? 'bg-green-500' :
                        userTrust.riskLevel === 'medium' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{width: userTrust.riskLevel === 'low' ? '80%' : userTrust.riskLevel === 'medium' ? '50%' : '30%'}}
                    ></div>
                  </div>
                </div>

                {userTrust.flags.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4">Flags & Concerns</h3>
                    <div className="space-y-3">
                      {userTrust.flags.map((flag, idx) => (
                        <div
                          key={idx}
                          className={`p-4 rounded-lg border-l-4 ${
                            flag.severity === 'high' ? 'bg-red-50 border-red-500' :
                            flag.severity === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                            'bg-blue-50 border-blue-500'
                          }`}
                        >
                          <p className="font-semibold text-gray-900">{flag.type.replace(/_/g, ' ').toUpperCase()}</p>
                          <p className="text-sm text-gray-600">{flag.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {userTrust.flags.length === 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                    <p className="text-gray-900 font-semibold">Excellent Trust Score!</p>
                    <p className="text-gray-600 text-sm mt-1">No concerns detected. You're a trusted member of our community.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* AI Features Tab */}
            {activeTab === 'features' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid md:grid-cols-2 gap-8"
              >
                {[
                  {
                    title: 'Smart Matching Engine',
                    icon: TrendingUp,
                    desc: 'Analyzes items by name, color, location, and date to find the best matches automatically.',
                    features: ['Levenshtein Distance', 'Category Analysis', 'Date Proximity'],
                    color: 'blue',
                  },
                  {
                    title: 'Image Recognition',
                    icon: Zap,
                    desc: 'Compares uploaded images using color histograms and visual fingerprinting.',
                    features: ['Color Analysis', 'Brightness Matching', 'Visual Similarity'],
                    color: 'purple',
                  },
                  {
                    title: 'Natural Language Processing',
                    icon: MessageCircle,
                    desc: 'Extracts keywords and meaning from free-text descriptions automatically.',
                    features: ['Keyword Extraction', 'Color Detection', 'Item Classification'],
                    color: 'green',
                  },
                  {
                    title: 'Fraud Detection',
                    icon: Shield,
                    desc: 'Monitors for suspicious patterns and prevents false ownership claims.',
                    features: ['Behavior Analysis', 'Pattern Recognition', 'Report Validation'],
                    color: 'red',
                  },
                  {
                    title: 'Location Prediction',
                    icon: MapPin,
                    desc: 'Uses historical data to predict where lost items are most likely found.',
                    features: ['Hotspot Analysis', 'Recovery Patterns', 'Area Clustering'],
                    color: 'orange',
                  },
                  {
                    title: 'Smart Notifications',
                    icon: AlertCircle,
                    desc: 'Sends intelligent alerts only when high-confidence matches are found.',
                    features: ['Similarity Filtering', 'Priority Ranking', 'Spam Prevention'],
                    color: 'pink',
                  },
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`bg-gradient-to-br from-${feature.color}-50 to-${feature.color}-100 rounded-2xl p-6 shadow-lg border border-${feature.color}-200`}
                  >
                    <div className={`flex items-center gap-2 mb-4 text-${feature.color}-600`}>
                      <feature.icon className="w-6 h-6" />
                      <h3 className="font-bold text-gray-900">{feature.title}</h3>
                    </div>
                    <p className="text-gray-700 text-sm mb-4">{feature.desc}</p>
                    <div className="space-y-2">
                      {feature.features.map((f, fidx) => (
                        <div key={fidx} className="flex items-center gap-2 text-sm text-gray-700">
                          <div className={`w-2 h-2 rounded-full bg-${feature.color}-600`}></div>
                          {f}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
