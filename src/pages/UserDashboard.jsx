import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  Package,
  MapPin,
  Heart,
  User,
  Lock,
  LogOut,
  Ticket,
  Bell,
  LifeBuoy,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { logoutUser, selectUser } from '../store/slices/authSlice';

const navItems = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/overview' },
  { id: 'orders', label: 'My Orders', icon: Package, path: '/dashboard/orders' },
  { id: 'addresses', label: 'Addresses', icon: MapPin, path: '/dashboard/addresses' },
  { id: 'wishlist', label: 'Wishlist', icon: Heart, path: '/dashboard/wishlist' },
  { id: 'profile', label: 'Profile', icon: User, path: '/dashboard/profile' },
  { id: 'password', label: 'Change Password', icon: Lock, path: '/dashboard/password' },
  { id: 'coupons', label: 'Coupons', icon: Ticket, path: '/dashboard/coupons' },
  { id: 'notifications', label: 'Notifications', icon: Bell, path: '/dashboard/notifications' },
  { id: 'support', label: 'Support', icon: LifeBuoy, path: '/dashboard/support' },
];

const UserDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  // Get initials
  const getInitials = () => {
    if (!user?.name) return 'U';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Navbar />

      <div className="flex-1 py-4 px-4">
        <div className="mx-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden sticky top-6">
                {/* User Info */}
                <div className="p-5 border-b border-gray-200 dark:border-gray-800 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#00C2D6] dark:bg-orange-900/30 mx-auto flex items-center justify-center text-2xl font-bold text-white">
                    {getInitials()}
                  </div>
                  <h3 className="mt-2 font-semibold text-gray-900 dark:text-white">
                    {user?.name || 'User'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email || ''}
                  </p>
                </div>

                {/* Navigation */}
                <nav className="p-3 space-y-0.5">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.id}
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            isActive
                              ? 'bg-[#00C2D6]/10 dark:bg-orange-900/20 text-[#00C2D6] dark:text-orange-400'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`
                        }
                      >
                        <Icon size={18} />
                        {item.label}
                      </NavLink>
                    );
                  })}
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-gray-200 dark:border-gray-800">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              <div className="bg-white/20 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UserDashboard;