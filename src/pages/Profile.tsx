import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  Wallet,
  ClipboardList,
  Settings,
  HelpCircle,
  ChevronRight,
  User,
  Award,
  Clock,
  TrendingUp,
} from 'lucide-react';
import Header from '@/components/Header';
import { useAppStore } from '@/store/appStore';
import { api } from '@/lib/api';
import type { Review } from '@shared/types';

export default function Profile() {
  const navigate = useNavigate();
  const { currentUser, currentRole, setCurrentUser, setCurrentRole, logout } = useAppStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [averageRating, setAverageRating] = useState(5.0);

  useEffect(() => {
    const storedUserId = localStorage.getItem('currentUserId');
    const storedRole = localStorage.getItem('currentRole') as 'employer' | 'aide' | null;
    
    if (storedUserId && storedRole) {
      setCurrentRole(storedRole);
      api.users.get(storedUserId).then(user => {
        setCurrentUser(user);
        loadReviews(user.id);
      }).catch(() => {});
    }
  }, [currentRole]);

  const loadReviews = async (userId: string) => {
    try {
      const result = await api.users.getReviews(userId);
      setReviews(result.reviews);
      setReviewCount(result.count);
      setAverageRating(result.rating);
    } catch (error) {
      console.error('Load reviews failed:', error);
    }
  };

  const menuItems = [
    { icon: ClipboardList, label: '我的订单', badge: '', color: 'text-primary-500', bg: 'bg-primary-50', onClick: () => navigate('/') },
    { icon: Wallet, label: '我的钱包', badge: currentUser ? `¥${currentUser.balance.toFixed(2)}` : '', color: 'text-secondary-500', bg: 'bg-secondary-50', onClick: () => {} },
    { icon: Star, label: '我的评价', badge: reviewCount > 0 ? `${reviewCount}条` : '', color: 'text-yellow-500', bg: 'bg-yellow-50', onClick: () => {} },
    { icon: Settings, label: '设置', badge: '', color: 'text-warmgray-500', bg: 'bg-warmgray-50', onClick: () => {} },
    { icon: HelpCircle, label: '帮助中心', badge: '', color: 'text-blue-500', bg: 'bg-blue-50', onClick: () => {} },
  ];

  const stats = currentRole === 'aide'
    ? [
        { label: '完成订单', value: reviewCount, icon: ClipboardList, color: 'text-primary-600' },
        { label: '好评率', value: `${Math.round(averageRating * 20)}%`, icon: Award, color: 'text-secondary-600' },
        { label: '累计收入', value: `¥${currentUser?.balance || 0}`, icon: TrendingUp, color: 'text-yellow-600' },
      ]
    : [
        { label: '发布订单', value: reviewCount, icon: ClipboardList, color: 'text-primary-600' },
        { label: '账户余额', value: `¥${currentUser?.balance || 0}`, icon: Wallet, color: 'text-secondary-600' },
        { label: '信用分', value: '优秀', icon: Award, color: 'text-yellow-600' },
      ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-100 to-cream-50 pb-20 md:pb-8">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-400 via-primary-500 to-secondary-500 p-8 text-white mb-6 animate-fade-in">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full" />
          <div className="absolute right-20 bottom-0 w-24 h-24 bg-white/10 rounded-full" />
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center text-4xl">
              {currentUser?.name?.charAt(0) || '用'}
            </div>
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold">
                {currentUser?.name || '用户'}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3 py-0.5 bg-white/20 rounded-full text-sm">
                  {currentRole === 'employer' ? '雇主' : '家政阿姨'}
                </span>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                  <span>{averageRating.toFixed(1)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-white/20 rounded-full text-sm hover:bg-white/30 transition-colors"
            >
              退出
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="card text-center animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <Icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <div className="text-xl font-bold text-warmgray-800">{stat.value}</div>
                <div className="text-xs text-warmgray-500">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="card mb-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="font-semibold text-warmgray-800 mb-4">功能菜单</h2>
          <div className="divide-y divide-cream-100">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="w-full flex items-center gap-4 py-4 hover:bg-cream-50 -mx-6 px-6 transition-colors first:pt-0 last:pb-0"
                >
                  <div className={`p-2 rounded-xl ${item.bg}`}>
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <span className="flex-1 text-left text-warmgray-700 font-medium">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="text-sm text-warmgray-500">{item.badge}</span>
                  )}
                  <ChevronRight className="w-5 h-5 text-warmgray-300" />
                </button>
              );
            })}
          </div>
        </div>

        {reviews.length > 0 && (
          <div className="card animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <h2 className="font-semibold text-warmgray-800 mb-4">最近评价</h2>
            <div className="space-y-4">
              {reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="p-4 bg-cream-50 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-medium text-primary-700">
                        用
                      </div>
                      <span className="font-medium text-warmgray-700 text-sm">
                        用户评价
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-warmgray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-warmgray-600">{review.content}</p>
                  <p className="text-xs text-warmgray-400 mt-2">
                    {new Date(review.createdAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
