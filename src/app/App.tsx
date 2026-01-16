import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

// Layout Components
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import Sidebar from '@/app/components/Sidebar';

// Pages
import LandingPage from '@/app/pages/LandingPage';
import LoginPage from '@/app/pages/LoginPage';
import SignupPage from '@/app/pages/SignupPage';

// Dashboard Pages
import DashboardHome from '@/app/pages/Dashboard/DashboardHome';
import ReportLostItem from '@/app/pages/Dashboard/ReportLostItem';
import ReportFoundItem from '@/app/pages/Dashboard/ReportFoundItem';
import Notifications from '@/app/pages/Dashboard/Notifications';
import History from '@/app/pages/Dashboard/History';
import Chatbot from '@/app/pages/Dashboard/Chatbot';

export default function App() {
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Check for existing user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  const DashboardLayout = ({ children }) => (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar isLoggedIn={true} onLogout={handleLogout} />
      <div className="flex flex-1 pt-16 w-full">
        {/* Sidebar - hidden on mobile/tablet, visible on desktop md and above */}
        <div className="hidden md:block md:w-auto md:flex-shrink-0">
          <Sidebar 
            isCollapsed={sidebarCollapsed} 
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
          />
        </div>
        
        {/* Main Content - responsive margins */}
        <main 
          className="flex-1 w-full md:w-0 transition-all duration-300"
          style={{ marginLeft: `${sidebarCollapsed ? 80 : 280}px` }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[calc(100vh-4rem)] w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );

  const PublicLayout = ({ children }) => (
    <div className="min-h-screen flex flex-col">
      <Navbar isLoggedIn={false} />
      <main className="flex-1 pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );

  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return <DashboardLayout>{children}</DashboardLayout>;
  };

  const PublicOnlyRoute = ({ children }) => {
    if (user) {
      return <Navigate to="/dashboard" replace />;
    }
    return <PublicLayout>{children}</PublicLayout>;
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/" 
          element={
            <PublicLayout>
              <LandingPage />
            </PublicLayout>
          } 
        />
        
        <Route 
          path="/login" 
          element={
            <PublicOnlyRoute>
              <LoginPage onLogin={handleLogin} />
            </PublicOnlyRoute>
          } 
        />
        
        <Route 
          path="/signup" 
          element={
            <PublicOnlyRoute>
              <SignupPage onLogin={handleLogin} />
            </PublicOnlyRoute>
          } 
        />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardHome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/report-lost"
          element={
            <ProtectedRoute>
              <ReportLostItem />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/report-found"
          element={
            <ProtectedRoute>
              <ReportFoundItem />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/chatbot"
          element={
            <ProtectedRoute>
              <Chatbot />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
