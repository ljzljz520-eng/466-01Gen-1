import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Clock, ChevronRight, Search } from 'lucide-react';
import Header from '@/components/Header';
import OrderCard from '@/components/OrderCard';
import { useAppStore } from '@/store/appStore';
import { api } from '@/lib/api';
import type { Order, ServiceType } from '@shared/types';
import { SERVICE_TYPE_LABELS, SERVICE_PRICES } from '@shared/types';

const serviceIcons: Record<ServiceType, string> = {
  cleaning: '🧹',
  cooking: '🍳',
  care: '🤝',
};

const serviceDescriptions: Record<ServiceType, string> = {
  cleaning: '专业保洁，洁净如新',
  cooking: '美味佳肴，温暖您的胃',
  care: '贴心陪护，安心托付',
};

export default function Home() {
  const navigate = useNavigate();
  const { currentUser, currentRole, setCurrentUser, setCurrentRole } = useAppStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem('currentUserId');
    const storedRole = localStorage.getItem('currentRole') as 'employer' | 'aide' | null;
    
    if (storedUserId && storedRole) {
      setCurrentRole(storedRole);
      api.users.get(storedUserId).then(user => {
        setCurrentUser(user);
        loadOrders(user.id, storedRole);
      }).catch(() => {
        autoLogin();
      });
    } else {
      autoLogin();
    }
  }, [currentRole]);

  const autoLogin = async () => {
    try {
      const role = currentRole;
      const phone = role === 'employer' ? '13800000001' : '13900000001';
      const user = await api.users.login(phone, role);
      setCurrentUser(user);
      loadOrders(user.id, role);
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
    }
  };

  const loadOrders = async (userId: string, role: string) => {
    try {
      const data = await api.orders.list({ role, userId });
      setOrders(data);
    } catch (error) {
      console.error('Load orders failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status));
  const historyOrders = orders.filter(o => ['completed', 'cancelled'].includes(o.status));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream-100 to-cream-50">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-pulse text-warmgray-400">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-100 to-cream-50 pb-20 md:pb-8">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-400 via-primary-500 to-secondary-500 p-8 md:p-12 text-white mb-8 animate-fade-in">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full" />
          <div className="absolute -right-10 bottom-0 w-40 h-40 bg-white/10 rounded-full" />
          <div className="relative z-10">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              您好，{currentUser?.name || '欢迎回家'}
            </h1>
            <p className="text-white/80 mb-6">
              {currentRole === 'employer'
                ? '找到合适的家政服务，让生活更轻松'
                : '找到合适的订单，赚取更多收入'}
            </p>

            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warmgray-400" />
              <input
                type="text"
                placeholder="搜索服务、地址..."
                className="w-full pl-12 pr-4 py-3 bg-white/95 rounded-full text-warmgray-700 placeholder-warmgray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>
        </section>

        {currentRole === 'employer' && (
          <section className="mb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-warmgray-800">快速发布</h2>
              <button
                onClick={() => navigate('/publish')}
                className="text-primary-600 text-sm font-medium flex items-center gap-1 hover:text-primary-700"
              >
                查看全部 <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(Object.keys(serviceIcons) as ServiceType[]).map((type, index) => (
                <div
                  key={type}
                  onClick={() => navigate(`/publish?type=${type}`)}
                  className="card card-hover cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-cream-200 flex items-center justify-center text-3xl">
                      {serviceIcons[type]}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-warmgray-800 text-lg">
                        {SERVICE_TYPE_LABELS[type]}
                      </h3>
                      <p className="text-sm text-warmgray-500 mt-1">
                        {serviceDescriptions[type]}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-primary-600 font-bold text-lg">
                          ¥{SERVICE_PRICES[type]}
                        </span>
                        <span className="text-warmgray-400 text-sm">/小时起</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeOrders.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-warmgray-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500" />
                进行中
              </h2>
              <span className="text-sm text-warmgray-500">{activeOrders.length} 个订单</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeOrders.map((order, index) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  view={currentRole}
                />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-warmgray-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary-500" />
              历史订单
            </h2>
            <button className="text-primary-600 text-sm font-medium flex items-center gap-1 hover:text-primary-700">
              查看全部 <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {historyOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {historyOrders.slice(0, 3).map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  view={currentRole}
                />
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-warmgray-500">暂无历史订单</p>
              {currentRole === 'employer' && (
                <button
                  onClick={() => navigate('/publish')}
                  className="btn-primary mt-4"
                >
                  立即发布需求
                </button>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
