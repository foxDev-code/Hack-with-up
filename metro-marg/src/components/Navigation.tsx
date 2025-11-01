import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { GlassButton } from './GlassComponents';
import { motion, AnimatePresence } from 'framer-motion';

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-normal ${
        isScrolled 
          ? 'bg-white/60 backdrop-blur-glass-strong shadow-glass' 
          : 'bg-white/50 backdrop-blur-glass-strong'
      } border-b border-white/30`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-metro-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              M
            </div>
            <span className="text-2xl font-bold text-neutral-900">
              Metro <span className="text-metro-blue-500">मार्ग</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/route-finder" className="text-neutral-700 hover:text-metro-blue-500 font-medium transition-colors">
              Route Finder
            </Link>
            <Link to="/live-tracking" className="text-neutral-700 hover:text-metro-blue-500 font-medium transition-colors">
              Live Tracking
            </Link>
            {user ? (
              <>
                <Link to="/book-ticket" className="text-neutral-700 hover:text-metro-blue-500 font-medium transition-colors">
                  Book Ticket
                </Link>
                <Link to="/my-tickets" className="text-neutral-700 hover:text-metro-blue-500 font-medium transition-colors">
                  My Tickets
                </Link>
                <Link to="/profile" className="text-neutral-700 hover:text-metro-blue-500 font-medium transition-colors">
                  Profile
                </Link>
                <Link to="/help" className="text-neutral-700 hover:text-metro-blue-500 font-medium transition-colors">
                  Help
                </Link>
                <Link to="/admin" className="text-neutral-700 hover:text-metro-aqua-500 font-medium transition-colors">
                  Admin
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-neutral-700 hover:text-error-500 font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <GlassButton variant="secondary" size="sm">
                    Sign In
                  </GlassButton>
                </Link>
                <Link to="/signup">
                  <GlassButton variant="primary" size="sm">
                    Sign Up
                  </GlassButton>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-neutral-700 hover:text-metro-blue-500"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-glass-intense border-t border-white/30"
          >
            <div className="px-4 py-4 space-y-3">
              <Link 
                to="/route-finder" 
                className="block px-4 py-2 text-neutral-700 hover:bg-white/50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Route Finder
              </Link>
              <Link 
                to="/live-tracking" 
                className="block px-4 py-2 text-neutral-700 hover:bg-white/50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Live Tracking
              </Link>
              {user ? (
                <>
                  <Link 
                    to="/book-ticket" 
                    className="block px-4 py-2 text-neutral-700 hover:bg-white/50 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Book Ticket
                  </Link>
                  <Link 
                    to="/my-tickets" 
                    className="block px-4 py-2 text-neutral-700 hover:bg-white/50 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Tickets
                  </Link>
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-neutral-700 hover:bg-white/50 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-error-500 hover:bg-white/50 rounded-md transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="block"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <GlassButton variant="secondary" size="sm" className="w-full">
                      Sign In
                    </GlassButton>
                  </Link>
                  <Link 
                    to="/signup" 
                    className="block"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <GlassButton variant="primary" size="sm" className="w-full">
                      Sign Up
                    </GlassButton>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
