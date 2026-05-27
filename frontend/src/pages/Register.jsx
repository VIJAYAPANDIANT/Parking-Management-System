import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, User, Mail, Lock, Eye, EyeOff, ShieldAlert, KeyRound, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User');
  const [adminSecretKey, setAdminSecretKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/register', { 
        name, 
        email, 
        password, 
        role, 
        admin_secret_key: role === 'Admin' ? adminSecretKey : undefined 
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error('Registration Error:', err);
      if (!err.response) {
        setError('Server is unreachable. Make sure the backend is running on port 5000.');
      } else {
        setError(err.response?.data?.error || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-slate-900 text-slate-100 rounded-2xl shadow-inner">
      {/* Decorative Animated Ambient Background Blobs */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-indigo-600 rounded-full filter blur-[100px] opacity-35 animate-pulse duration-4000"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-600 rounded-full filter blur-[120px] opacity-20 animate-pulse duration-6000"></div>

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center font-sans">
        {/* Left Side: Dynamic Showcase */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-6 pr-6 text-left">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Join SmartParking</span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
              Create Your Account
            </h1>
            <p className="text-sm text-slate-350 leading-relaxed">
              Register to access either your User booking dashboard or Admin yard management panel. Control rates, manage vehicle slots, and process entries/exits effortlessly.
            </p>
          </div>

          <div className="border border-slate-700/50 rounded-2xl p-4 bg-slate-800/40 space-y-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-400" />
              Developer Testing Tip
            </h3>
            <p className="text-xs text-slate-400 leading-normal">
              To test Admin capabilities (like editing slots and managing dynamic rates), select the <b>Admin</b> role and enter the secret key: <span className="font-mono text-indigo-300 font-bold bg-slate-900 px-1.5 py-0.5 rounded">admin123</span>.
            </p>
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="lg:col-span-7 w-full max-w-lg mx-auto">
          <div className="backdrop-blur-md bg-white/5 dark:bg-black/30 border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="space-y-1.5 text-center lg:text-left">
              <h2 className="text-2xl font-bold tracking-tight text-white">Get Started</h2>
              <p className="text-xs text-slate-400">Fill in the fields below to create a new profile</p>
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl">
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center justify-center gap-2 text-green-400 text-sm text-center bg-green-500/10 border border-green-500/20 p-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
                <span>Account created! Redirecting to login...</span>
              </div>
            )}

            <form className="space-y-3.5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1 text-left">
                  <label className="text-xs font-medium text-slate-350">Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                      <User className="w-4.5 h-4.5" />
                    </span>
                    <input
                      type="text"
                      required
                      className="w-full bg-slate-800/50 border border-slate-700/60 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                      placeholder="Queen"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-xs font-medium text-slate-350">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                      <Mail className="w-4.5 h-4.5" />
                    </span>
                    <input
                      type="email"
                      required
                      className="w-full bg-slate-800/50 border border-slate-700/60 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                      placeholder="queen@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-medium text-slate-350">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <Lock className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full bg-slate-800/50 border border-slate-700/60 rounded-xl pl-9 pr-10 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-xs font-medium text-slate-350">Account Type (Role)</label>
                <div className="grid grid-cols-2 gap-3.5">
                  <button
                    type="button"
                    onClick={() => setRole('User')}
                    className={`py-2 px-4 rounded-xl border text-sm font-semibold transition-all ${
                      role === 'User'
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                        : 'bg-slate-800/50 border-slate-750 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    Standard User
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('Admin')}
                    className={`py-2 px-4 rounded-xl border text-sm font-semibold transition-all ${
                      role === 'Admin'
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                        : 'bg-slate-800/50 border-slate-750 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    Yard Admin
                  </button>
                </div>
              </div>

              {role === 'Admin' && (
                <div className="space-y-1 text-left animate-fadeIn">
                  <label className="text-xs font-medium text-indigo-300 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-indigo-400" />
                    Admin Activation Key
                  </label>
                  <input
                    type="text"
                    required={role === 'Admin'}
                    className="w-full bg-slate-850 border border-indigo-500/40 rounded-xl px-4 py-2 text-white placeholder-slate-550 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                    placeholder="Enter key to authorize Admin permissions"
                    value={adminSecretKey}
                    onChange={e => setAdminSecretKey(e.target.value)}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading || success}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2"
              >
                <UserPlus className="w-4.5 h-4.5" />
                <span>{loading ? 'Creating Account...' : 'Register'}</span>
              </button>
            </form>

            <div className="text-center text-sm text-slate-400 pt-1">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                Login here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
