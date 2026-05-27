import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, LayoutDashboard, CarFront, LogIn, UserPlus, Moon, Sun, ParkingCircle, CalendarDays, Coins, Settings } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="flex items-center gap-2.5">
                  <svg className="h-8 w-8" viewBox="0 0 512 512">
                    <circle cx="256" cy="256" r="240" className="fill-indigo-600 dark:fill-indigo-500" />
                    <circle cx="256" cy="256" r="200" fill="none" stroke="#ffffff" strokeWidth="20" strokeOpacity="0.25" />
                    <path d="M256,56 A200,200 0 0,1 416,376" fill="none" stroke="#ffffff" strokeWidth="20" strokeLinecap="round" />
                    <path d="M190,140 L280,140 C330,140 360,165 360,210 C360,255 330,280 280,280 L235,280 L235,380 L190,380 Z M235,185 L235,235 L275,235 C295,235 310,225 310,210 C310,195 295,185 275,185 Z" fill="#ffffff" />
                    <path d="M340,320 L300,370 L330,370 L290,430 L350,360 L320,360 Z" fill="#38bdf8" />
                  </svg>
                  <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-slate-350 bg-clip-text text-transparent">SmartParking</span>
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {user && (
                  <>
                    <Link to="/dashboard" className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                      <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                    </Link>
                    <Link to="/entry" className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                      <CarFront className="w-4 h-4 mr-2" /> Vehicle Entry
                    </Link>
                    <Link to="/exit" className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                      <LogOut className="w-4 h-4 mr-2" /> Vehicle Exit
                    </Link>
                    <Link to="/reservations" className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                      <CalendarDays className="w-4 h-4 mr-2" /> Reservations
                    </Link>
                    {user.role === 'Admin' && (
                      <>
                        <Link to="/slots" className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                          <Settings className="w-4 h-4 mr-2" /> Slots
                        </Link>
                        <Link to="/rates" className="border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                          <Coins className="w-4 h-4 mr-2" /> Rates
                        </Link>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                    {user.name} ({user.role})
                  </span>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login" className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium inline-flex items-center">
                    <LogIn className="w-4 h-4 mr-2" /> Login
                  </Link>
                  <Link to="/register" className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm">
                    <UserPlus className="w-4 h-4 mr-2" /> Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
