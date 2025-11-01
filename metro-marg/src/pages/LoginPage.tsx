import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { GlassCard, GlassButton, GlassInput } from '@/components/GlassComponents';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  
  useEffect(() => {
    if (location.state?.message) {
      setInfoMessage(location.state.message);
    }
  }, [location]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(formData.email, formData.password);
      const redirect = searchParams.get('redirect') || '/';
      navigate(redirect);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-12 h-12 bg-metro-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
              M
            </div>
            <span className="text-3xl font-bold text-neutral-900">
              Metro <span className="text-metro-blue-500">मार्ग</span>
            </span>
          </Link>
        </div>

        <GlassCard variant="medium" className="p-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2 text-center">
            Welcome Back
          </h1>
          <p className="text-neutral-700 mb-8 text-center">
            Sign in to your account
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                Email
              </label>
              <GlassInput
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                icon={<Mail className="w-5 h-5" />}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                Password
              </label>
              <GlassInput
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                icon={<Lock className="w-5 h-5" />}
                required
              />
            </div>

            {infoMessage && (
              <div className="p-4 bg-metro-blue-50 border border-metro-blue-500 rounded-md text-metro-blue-700 text-sm">
                {infoMessage}
              </div>
            )}

            {error && (
              <div className="p-4 bg-error-100 border border-error-500 rounded-md text-error-500 text-sm">
                {error}
              </div>
            )}

            <GlassButton
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </GlassButton>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 p-4 bg-success-50 border border-success-500 rounded-md">
            <p className="text-sm font-semibold text-success-700 mb-2">
              🎯 Demo Accounts (For Testing)
            </p>
            <div className="space-y-2 text-xs text-success-700">
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, email: 'demo@metromar.com', password: 'Demo123456!' })}
                  className="text-metro-blue-600 hover:text-metro-blue-700 font-semibold underline"
                >
                  demo@metromar.com
                </button>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Password:</span>
                <code className="bg-white px-2 py-1 rounded">Demo123456!</code>
              </div>
              <p className="text-xs italic mt-2">
                Click the email to auto-fill credentials
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-neutral-700">
              Don't have an account?{' '}
              <Link to="/signup" className="text-metro-blue-500 hover:text-metro-blue-700 font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
