import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  FileText, 
  Bell, 
  Shield, 
  MapPin,
  Zap,
  MessageCircle,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  Lock,
  Users,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Brain,
  Eye,
  Heart,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Floating dots component with enhanced animation
  const FloatingDots = ({ count = 20 }) => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -50, 0],
            x: [0, Math.random() * 30 - 15, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 5 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeInOut',
          }}
          className="absolute w-1.5 h-1.5 bg-blue-400 rounded-full blur-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
          }}
        />
      ))}
    </div>
  );

  const services = [
    {
      icon: FileText,
      title: 'Report Lost Items',
      description: 'Quickly submit details of items you\'ve lost and let the system start searching for matches.',
      color: 'from-red-500 to-pink-500',
    },
    {
      icon: Bell,
      title: 'Report Found Items',
      description: 'Help others by reporting items you\'ve found and making recovery possible.',
      color: 'from-green-500 to-teal-500',
    },
    {
      icon: Zap,
      title: 'Smart Item Matching',
      description: 'Our system intelligently compares lost and found reports to identify possible matches.',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: MapPin,
      title: 'Location-Based Alerts',
      description: 'Get notified when you are in areas where item loss is common.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Lightbulb,
      title: 'AI Chatbot Assistance',
      description: 'Receive instant guidance, tips, and support through our smart chatbot.',
      color: 'from-cyan-500 to-blue-500',
    },
  ];

  const howItWorks = [
    {
      step: '01',
      icon: FileText,
      title: 'Report an Item',
      description: 'Submit details about a lost or found item in just a few steps.',
    },
    {
      step: '02',
      icon: Zap,
      title: 'Smart Monitoring',
      description: 'Our system continuously checks for matching reports.',
    },
    {
      step: '03',
      icon: Bell,
      title: 'Get Alerts',
      description: 'Receive real-time notifications when matches are detected.',
    },
    {
      step: '04',
      icon: Sparkles,
      title: 'Recover What Matters',
      description: 'Reconnect with your item safely and quickly.',
    },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Premium Sticky Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          navScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-xl' 
            : 'bg-white/50 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
            >
              Lost & Found
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Home</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">About</a>
              <a href="#services" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Services</a>
              <a href="#more-info" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">More Information</a>
            </div>

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 text-blue-600 font-semibold backdrop-blur-sm bg-white/30 border border-blue-200 rounded-lg hover:bg-white/50 transition-all shadow-sm"
                >
                  Login
                </motion.button>
              </Link>
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Get Started
                </motion.button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden pb-4 space-y-3"
            >
              <a href="#home" className="block text-gray-700 hover:text-blue-600 font-medium">Home</a>
              <a href="#about" className="block text-gray-700 hover:text-blue-600 font-medium">About</a>
              <a href="#services" className="block text-gray-700 hover:text-blue-600 font-medium">Services</a>
              <a href="#more-info" className="block text-gray-700 hover:text-blue-600 font-medium">More Information</a>
              <Link to="/login" className="block">
                <button className="w-full px-4 py-2 text-blue-600 font-semibold border-2 border-blue-600 rounded-lg">Login</button>
              </Link>
              <Link to="/signup" className="block">
                <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg">Get Started</button>
              </Link>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* Premium Hero Section */}
      <section id="home" className="relative pt-40 pb-24 overflow-hidden min-h-screen flex items-center">
        {/* Multi-layer background with depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 z-0">
          <div className="absolute inset-0 bg-black opacity-30"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 opacity-10 rounded-full blur-3xl -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 opacity-10 rounded-full blur-3xl -ml-48 -mb-48"></div>
        </div>

        <FloatingDots count={25} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-white leading-tight"
            >
              Lost Something <br />
              <span className="bg-gradient-to-r from-blue-300 via-blue-200 to-cyan-300 bg-clip-text text-transparent">
                Important?
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed font-light"
            >
              Let's help you find it. Report lost or found items, get smart alerts, and recover your belongings faster using our intelligent community-driven platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-6 justify-center mb-10"
            >
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(239, 68, 68, 0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl shadow-2xl text-lg hover:shadow-2xl transition-all flex items-center gap-2"
                >
                  <AlertCircle className="w-5 h-5" />
                  Report Lost Item
                </motion.button>
              </Link>
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(34, 197, 94, 0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl shadow-2xl text-lg hover:shadow-2xl transition-all flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Report Found Item
                </motion.button>
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-blue-200 text-sm italic font-light"
            >
              ✨ Trusted by communities. Powered by smart technology. Built for people.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Intro Section - Split Layout */}
      <section id="home-intro" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-5xl font-bold text-gray-900 mb-6">
                A Smarter Way to Recover Lost Items
              </h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Losing something valuable can be stressful. Our platform simplifies the recovery process by combining community support, smart matching, and location-aware alerts — all in one easy-to-use system.
              </p>
              <div className="flex gap-4">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <Zap className="w-8 h-8 text-blue-600 mb-2" />
                  <p className="text-sm font-semibold text-gray-900">Smart Technology</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl">
                  <Users className="w-8 h-8 text-green-600 mb-2" />
                  <p className="text-sm font-semibold text-gray-900">Community Driven</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl">
                  <Lock className="w-8 h-8 text-purple-600 mb-2" />
                  <p className="text-sm font-semibold text-gray-900">Secure & Private</p>
                </div>
              </div>
            </motion.div>

            {/* Right: Visual */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl p-8 space-y-6">
                  <div className="h-12 bg-gradient-to-r from-blue-300 to-blue-400 rounded-lg opacity-40"></div>
                  <div className="h-4 bg-gray-300 rounded opacity-30 w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded opacity-30 w-1/2"></div>
                  <div className="space-y-3 pt-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-blue-200 rounded-lg opacity-50"></div>
                      <div className="flex-1 h-4 bg-gray-300 rounded opacity-30"></div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-green-200 rounded-lg opacity-50"></div>
                      <div className="flex-1 h-4 bg-gray-300 rounded opacity-30"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-24 bg-gradient-to-br from-white via-blue-50 to-indigo-50 overflow-hidden">
        <div className="absolute top-10 right-0 w-96 h-96 bg-blue-200 opacity-10 rounded-full blur-3xl -mr-48"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-10">
              About Our Platform
            </h2>
            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
              <p className="text-xl">
                The Lost and Found system was created to solve a common but frustrating problem — losing personal belongings in busy environments.
              </p>
              <p>
                We believe technology should bring people together, not complicate things. That's why we designed a platform that is simple, secure, and focused on helping people reconnect with what they've lost.
              </p>
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-8 rounded-2xl mt-8 shadow-lg">
                <p className="text-2xl font-bold">
                  Our goal is to reduce loss, increase recovery rates, and create safer, more responsible communities.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section - Premium Glassmorphism Cards */}
      <section id="services" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-300 opacity-5 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              What We Offer
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools designed to help you recover lost items
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -15, boxShadow: '0 30px 60px rgba(0,0,0,0.1)' }}
                className="group relative p-8 bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}></div>
                
                <div className="relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} p-3 mb-6 shadow-lg`}
                  >
                    <service.icon className="w-full h-full text-white" />
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                  
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="mt-6 flex items-center gap-2 text-blue-600 font-semibold group-hover:text-blue-700 transition-colors"
                  >
                    Learn more <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Interactive Steps */}
      <section id="how-it-works" className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200 opacity-5 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Four simple steps to recover your lost items quickly and safely
            </p>
          </motion.div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-32 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="group relative"
                >
                  {/* Step Card */}
                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group-hover:border-blue-300 relative z-10">
                    {/* Step Number Circle */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="absolute -top-6 left-8 w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                    >
                      {item.step}
                    </motion.div>

                    <div className="pt-8">
                      <motion.div
                        whileHover={{ scale: 1.15 }}
                        className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mb-6 mx-auto"
                      >
                        <item.icon className="w-8 h-8 text-blue-600" />
                      </motion.div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">{item.title}</h3>
                      <p className="text-gray-600 text-center leading-relaxed">{item.description}</p>
                    </div>
                  </div>

                  {/* Arrow indicator */}
                  {index < howItWorks.length - 1 && (
                    <motion.div
                      animate={{ x: [0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="hidden lg:block absolute top-32 -right-6 text-blue-400"
                    >
                      <ArrowRight className="w-6 h-6" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* More Information Section */}
      <section id="more-info" className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden text-white">
        <FloatingDots count={15} />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl font-bold mb-12 text-center">
              Why Choose This Platform?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                'Designed with simplicity and beauty in mind',
                'Secure and reliable reporting system',
                'Community-driven recovery process',
                'Intelligent alerts and smart assistance',
                'Accessible on all devices',
                'Built with care and innovation'
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all"
                >
                  <Sparkles className="w-6 h-6 flex-shrink-0" />
                  <p className="text-lg font-medium">{item}</p>
                </motion.div>
              ))}
            </div>
            <p className="mt-12 text-center text-xl text-blue-100 italic font-light">
              Whether you've lost something or found an item, this platform gives you the tools to take action confidently.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Chatbot Section - Chat Bubble Style */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-200 opacity-5 rounded-full blur-3xl -mr-48"></div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-8">
              Your Smart Assistant, Always Ready
            </h2>
            
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl p-12 shadow-xl border border-cyan-200">
              <div className="flex justify-end mb-6">
                <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl rounded-tr-none max-w-xs shadow-md">
                  <p className="text-sm">How can I help you recover your lost items?</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex-shrink-0"></div>
                  <div className="bg-gray-100 px-6 py-3 rounded-2xl rounded-tl-none max-w-xs shadow-md">
                    <p className="text-sm text-gray-700">Our intelligent chatbot is available 24/7 to guide you through reporting items, answer your questions, and alert you when you're in high-risk areas for item loss.</p>
                  </div>
                </div>
              </div>

              <p className="mt-8 text-center text-lg text-blue-600 font-semibold">
                It's like having a personal assistant focused on protecting what matters to you.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section - Maximum Impact */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700"></div>
        <div className="absolute inset-0 bg-black/30"></div>
        <FloatingDots count={30} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
              Don't Let Lost Items Stay Lost
            </h2>
            <p className="text-xl text-blue-100 mb-12 leading-relaxed">
              Join thousands of users helping each other recover belongings through trust, technology, and community support. Your item might be closer than you think.
            </p>
            <Link to="/signup">
              <motion.button
                whileHover={{ scale: 1.08, boxShadow: '0 0 50px rgba(255, 255, 255, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-5 bg-white text-indigo-600 font-bold text-xl rounded-xl shadow-2xl hover:shadow-3xl transition-all inline-flex items-center gap-3"
              >
                Get Started Now <ArrowRight className="w-6 h-6" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="bg-gray-950 text-gray-300 py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-4">
                Lost & Found
              </h3>
              <p className="text-sm leading-relaxed">
                Helping you reconnect with what matters most through community, technology, and trust.
              </p>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h4 className="font-semibold text-white mb-4">Navigation</h4>
              <ul className="space-y-3">
                <li><a href="#home" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Services</a></li>
                <li><a href="#more-info" className="hover:text-white transition-colors">More Information</a></li>
              </ul>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <h4 className="font-semibold text-white mb-4">Account</h4>
              <ul className="space-y-3">
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
              </ul>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <h4 className="font-semibold text-white mb-4">Get Started</h4>
              <p className="text-sm mb-4">
                Join thousands helping each other recover lost belongings.
              </p>
              <Link to="/signup">
                <button className="w-full px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow">
                  Get Started
                </button>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500"
          >
            <p>© 2026 ERIC & NOELA'S Lost & Found System. All rights reserved.</p>
            <p className="mt-2">Built with care, trust, and innovation.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
