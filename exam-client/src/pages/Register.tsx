import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const roles = ['Student', 'Teacher'];

const Register = ({ onSwitchToLogin }: { onSwitchToLogin: () => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      toast.error('Please fill all fields!');
      return;
    }
    setLoading(true);
    try {
      await authAPI.register({ name, email, password, role });
      toast.success('Registration successful! Please login.');
      onSwitchToLogin();
    } catch (error) {
      toast.error('Registration failed. Email may already exist!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-2xl border border-blue-500/20 bg-blue-500/5"
      >
        <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
        <p className="text-gray-400 mb-8">Register to get started</p>

        <div className="mb-4">
          <label className="text-gray-400 text-sm mb-2 block">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-3 rounded-xl bg-[#0a0f1e] border border-blue-500/20 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="mb-4">
          <label className="text-gray-400 text-sm mb-2 block">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-3 rounded-xl bg-[#0a0f1e] border border-blue-500/20 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="mb-4">
          <label className="text-gray-400 text-sm mb-2 block">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-4 py-3 rounded-xl bg-[#0a0f1e] border border-blue-500/20 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="mb-6">
          <label className="text-gray-400 text-sm mb-3 block">Select Role</label>
          <div className="flex gap-3">
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  role === r
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'border border-blue-500/30 text-gray-400 hover:border-blue-500 hover:text-blue-400'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <motion.button
          onClick={handleRegister}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 disabled:opacity-70"
          style={{ background: 'linear-gradient(90deg, #2563eb, #3b82f6)' }}
        >
          {loading ? 'Registering...' : 'Register'}
        </motion.button>

        <p className="text-gray-400 text-center mt-6">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            Login
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;