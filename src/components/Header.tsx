import { Link, useNavigate } from 'react-router-dom';
import { Home, Plus, User, Briefcase, Bell } from 'lucide-react';
import { useAppStore } from '@/store/appStore';

export default function Header() {
  const navigate = useNavigate();
  const { currentUser, currentRole, switchRole } = useAppStore();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-cream-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center">
            <span className="text-white text-xl">🏠</span>
          </div>
          <span className="font-display font-bold text-xl text-warmgray-800">暖家</span>
        </Link>

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className="px-4 py-2 rounded-full text-warmgray-600 hover:text-primary-600 hover:bg-primary-50 transition-all font-medium"
            >
              首页
            </Link>
            {currentRole === 'employer' ? (
              <Link
                to="/publish"
                className="px-4 py-2 rounded-full text-warmgray-600 hover:text-primary-600 hover:bg-primary-50 transition-all font-medium"
              >
                发布需求
              </Link>
            ) : (
              <Link
                to="/hall"
                className="px-4 py-2 rounded-full text-warmgray-600 hover:text-primary-600 hover:bg-primary-50 transition-all font-medium"
              >
                接单大厅
              </Link>
            )}
            <Link
              to="/profile"
              className="px-4 py-2 rounded-full text-warmgray-600 hover:text-primary-600 hover:bg-primary-50 transition-all font-medium"
            >
              个人中心
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => switchRole(currentRole === 'employer' ? 'aide' : 'employer')}
              className="px-3 py-1.5 text-sm bg-cream-100 text-warmgray-700 rounded-full hover:bg-cream-200 transition-colors"
            >
              {currentRole === 'employer' ? '切换到阿姨端' : '切换到雇主端'}
            </button>

            <button className="relative p-2 rounded-full hover:bg-cream-100 transition-colors">
              <Bell className="w-5 h-5 text-warmgray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-cream-300 to-cream-400 flex items-center justify-center text-warmgray-700 font-medium hover:ring-2 hover:ring-primary-300 transition-all"
            >
              {currentUser?.name?.charAt(0) || '用'}
            </button>
          </div>
        </div>
      </div>

      <nav className="md:hidden flex justify-around py-2 border-t border-cream-100">
        <Link to="/" className="flex flex-col items-center gap-0.5 text-warmgray-500 hover:text-primary-500">
          <Home className="w-5 h-5" />
          <span className="text-xs">首页</span>
        </Link>
        {currentRole === 'employer' ? (
          <Link to="/publish" className="flex flex-col items-center gap-0.5 text-warmgray-500 hover:text-primary-500">
            <Plus className="w-5 h-5" />
            <span className="text-xs">发布</span>
          </Link>
        ) : (
          <Link to="/hall" className="flex flex-col items-center gap-0.5 text-warmgray-500 hover:text-primary-500">
            <Briefcase className="w-5 h-5" />
            <span className="text-xs">接单</span>
          </Link>
        )}
        <Link to="/profile" className="flex flex-col items-center gap-0.5 text-warmgray-500 hover:text-primary-500">
          <User className="w-5 h-5" />
          <span className="text-xs">我的</span>
        </Link>
      </nav>
    </header>
  );
}
