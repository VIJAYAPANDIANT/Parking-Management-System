import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, Eye, EyeOff, ShieldCheck, Car, Calendar, Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSocialAuth = async (mockEmail, mockPassword) => {
    setError('');
    setLoading(true);
    setActiveProvider(null);
    try {
      const res = await axios.post('/api/auth/login', { email: mockEmail, password: mockPassword });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Social Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-slate-900 text-slate-100 rounded-2xl shadow-inner">
      {/* Decorative Animated Ambient Background Blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-600 rounded-full filter blur-[100px] opacity-30 animate-pulse duration-4000"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600 rounded-full filter blur-[120px] opacity-20 animate-pulse duration-6000"></div>
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-500 rounded-full filter blur-[80px] opacity-15 animate-bounce duration-[10s]"></div>

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Product Showcase (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-8 pr-8 text-left">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Next Generation Parking Management</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
              SmartParking System
            </h1>
            <p className="text-lg text-slate-350 leading-relaxed">
              Effortlessly manage active occupancy, book slots in advance, and handle exits dynamically with custom rates. A beautiful and modern tool for seamless vehicle operations.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400 shrink-0">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Live Visual Yard</h3>
                <p className="text-sm text-slate-400">See exactly which slots are open or occupied at a glance with our interactive layout map.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 bg-purple-600/20 border border-purple-500/30 rounded-xl text-purple-400 shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Pre-Booking Reservation</h3>
                <p className="text-sm text-slate-400">Reserve slots for cars or bikes ahead of time to guarantee smooth checking in upon arrival.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Secure Access</h3>
                <p className="text-sm text-slate-400">Role-based privileges safeguard slots, statistics, and billing configurations.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Glassmorphism Login Form */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="backdrop-blur-md bg-white/5 dark:bg-black/30 border border-white/10 rounded-3xl shadow-2xl p-8 space-y-6">
            <div className="space-y-2 text-center lg:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-white">Sign In</h2>
              <p className="text-sm text-slate-400">Enter your details to manage your parking spaces</p>
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5 text-left">
                <label className="text-sm font-medium text-slate-350">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </span>
                  <input
                    type="email"
                    required
                    className="w-full bg-slate-800/50 border border-slate-700/60 rounded-xl pl-11 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-sm font-medium text-slate-350">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full bg-slate-800/50 border border-slate-700/60 rounded-xl pl-11 pr-12 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-200 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm py-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
                  <input
                    type="checkbox"
                    className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <a href="#forgot" className="text-indigo-400 hover:text-indigo-300 font-medium">Forgot password?</a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                <LogIn className="w-5 h-5" />
                <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              </button>
            </form>

            <div className="relative flex items-center justify-center my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/55"></div>
              </div>
              <span className="relative z-10 px-3 bg-slate-900/0 text-xs uppercase text-slate-500">Or continue with</span>
            </div>

            {/* Social Logins Mockup */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => setActiveProvider('Google')}
                className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                <span>Google</span>
              </button>
              <button 
                type="button"
                onClick={() => setActiveProvider('GitHub')}
                className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                <span>GitHub</span>
              </button>
            </div>

            <div className="text-center text-sm text-slate-400 pt-2">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                Create account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Google Mock Account Chooser Modal */}
      {activeProvider === 'Google' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-slate-200 text-center space-y-4 animate-scaleUp">
            <div className="flex justify-center">
              <svg className="w-10 h-10" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">Sign in with Google</h3>
              <p className="text-xs text-slate-500">to continue to SmartParking System</p>
            </div>
            
            <div className="divide-y divide-slate-150 border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <button 
                onClick={() => handleSocialAuth('sweet@gmail.com', 'queen')}
                className="w-full p-3.5 flex items-center gap-3 text-left hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-550 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                  Q
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-800">Queen (Admin)</p>
                  <p className="text-[10px] text-slate-500 truncate">sweet@gmail.com</p>
                </div>
              </button>
              
              <button 
                onClick={() => handleSocialAuth('user@gmail.com', 'user123')}
                className="w-full p-3.5 flex items-center gap-3 text-left hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-green-550 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                  J
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-800">John Doe (Standard User)</p>
                  <p className="text-[10px] text-slate-500 truncate">user@gmail.com</p>
                </div>
              </button>
            </div>
            
            <div className="pt-2 flex gap-2">
              <button 
                onClick={() => setActiveProvider(null)}
                className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GitHub Mock Consent Modal */}
      {activeProvider === 'GitHub' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1117] text-slate-200 rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-slate-800 text-center space-y-4 animate-scaleUp">
            <div className="flex justify-center text-white">
              <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Authorize SmartParking</h3>
              <p className="text-xs text-slate-400">SmartParking wants to access your GitHub public profile</p>
            </div>
            
            <div className="space-y-2 pt-2">
              <button 
                onClick={() => handleSocialAuth('sweet@gmail.com', 'queen')}
                className="w-full py-2.5 bg-[#238636] hover:bg-[#2ea043] text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Authorize as Queen (Admin)</span>
              </button>
              <button 
                onClick={() => handleSocialAuth('user@gmail.com', 'user123')}
                className="w-full py-2.5 bg-[#238636] hover:bg-[#2ea043] text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Authorize as John Doe (User)</span>
              </button>
              <button 
                onClick={() => setActiveProvider(null)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-350 font-bold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
