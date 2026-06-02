// pages/Login.jsx — University-style professional login page

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';

export default function Login() {
  const [email,    setEmail]    = useState('superadmin@crddms.edu');
  const [password, setPassword] = useState('Password@123');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #A7D3F4 0%, transparent 50%), radial-gradient(circle at 80% 20%, #4F81BD 0%, transparent 50%)' }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Institution Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <GraduationCap size={44} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">CRDDMS</h1>
          <p className="text-white/75 text-sm mt-1">
            College Records Digitalization & Document Management System
          </p>
          <div className="w-12 h-0.5 bg-white/30 mx-auto mt-3" />
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-slate mb-1">Welcome Back</h2>
          <p className="text-sm text-slate/50 mb-6">Sign in to your institutional account</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-danger text-sm rounded-xl px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate/40" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-9"
                  placeholder="you@institution.edu"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate/40" />
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-9 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate/40 hover:text-slate"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-primary"
                />
                <span className="text-sm text-slate/70">Remember me</span>
              </label>
              <button type="button" className="text-sm text-secondary hover:underline">
                Forgot Password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="login-btn"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'Signing In…' : 'Sign In'}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 p-3 bg-accent/20 rounded-xl border border-accent/30">
            <p className="text-xs text-slate/60 text-center">
              <span className="font-semibold">Demo Credentials:</span>
              {' '}superadmin@crddms.edu / Password@123
            </p>
          </div>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          © 2024 CRDDMS • All Rights Reserved
        </p>
      </div>
    </div>
  );
}
