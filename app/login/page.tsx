'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Toast from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(username, password);
      if (user.is_admin) {
        router.push('/admin/dashboard');
      } else {
        router.push('/teacher/dashboard');
      }
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <img 
            src="/badge.png" 
            alt="JinjaSS Badge" 
            className="w-24 h-24 mx-auto mb-6 object-contain"
          />
          <h1 className="text-6xl font-heading font-bold text-white mb-6">
            Jinja<span className="text-teal">SS</span>
          </h1>
          <p className="text-xl text-gray-300 font-body max-w-md mx-auto">
            School Election Voting Portal
          </p>
          <div className="mt-12 w-32 h-1 bg-teal mx-auto rounded-full" />
          <div className="mt-8">
            <a 
              href="https://herman-software-website.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-teal transition-colors font-body text-sm"
            >
              Developed by <span className="font-semibold text-gray-300 hover:text-teal">HERMAN SOFTWARE SOLUTIONS</span>
            </a>
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <img 
              src="/badge.png" 
              alt="JinjaSS Badge" 
              className="w-20 h-20 mx-auto mb-4 object-contain"
            />
            <h1 className="text-4xl font-heading font-bold text-navy">
              Jinja<span className="text-teal">SS</span>
            </h1>
            <div className="mt-4">
              <a 
                href="https://herman-software-website.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-teal transition-colors font-body text-xs"
              >
                Developed by <span className="font-semibold">HERMAN SOFTWARE SOLUTIONS</span>
              </a>
            </div>
          </div>

          <h2 className="text-3xl font-heading font-bold text-navy mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-medium font-body mb-8">
            Sign in to access the voting portal
          </p>

          <form onSubmit={handleSubmit}>
            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full mt-4"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </motion.div>
      </div>

      <Toast
        message={error}
        type="error"
        show={!!error}
        onClose={() => setError('')}
      />
    </div>
  );
}