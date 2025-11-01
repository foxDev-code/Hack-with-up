import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GlassCard, GlassButton, GlassInput } from '@/components/GlassComponents';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';

export function SignUpPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const result: any = await signUp(formData.email, formData.password, formData.fullName);
      
      // Show success message
      setSuccess(true);
      
      // Check if email confirmation is required
      if (result?.user && !result?.session) {
        // Email confirmation required
        setError('');
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Registration successful! Please check your email to confirm your account before logging in.' 
            } 
          });
        }, 3000);
      } else {
        // No email confirmation needed - user is logged in
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
      
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center px-4 py-12">
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
            Create Account
          </h1>
          <p className="text-neutral-700 mb-8 text-center">
            Join Metro मार्ग today
          </p>

          <form onSubmit={handleSignUp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                Full Name
              </label>
              <GlassInput
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                icon={<User className="w-5 h-5" />}
                required
              />
            </div>

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

            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                Confirm Password
              </label>
              <GlassInput
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                icon={<Lock className="w-5 h-5" />}
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-error-100 border border-error-500 rounded-md text-error-500 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-success-100 border border-success-500 rounded-md text-success-700 text-sm">
                ✓ Account created successfully! Please check your email to confirm your account.
              </div>
            )}

            <GlassButton
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading || success}
              className="w-full"
            >
              {loading ? 'Creating account...' : success ? 'Success!' : 'Sign Up'}
            </GlassButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-neutral-700">
              Already have an account?{' '}
              <Link to="/login" className="text-metro-blue-500 hover:text-metro-blue-700 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
