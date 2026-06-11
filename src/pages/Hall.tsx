import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Clock, TrendingUp } from 'lucide-react';
import Header from '@/components/Header';
import OrderCard from '@/components/OrderCard';
import { useAppStore } from '@/store/appStore';
import { api } from '@/lib/api';
import type { Order, ServiceType } from '@shared/types';
import { SERVICE_TYPE_LABELS } from '@shared/types';

export default function Hall() {
  const navigate = useNavigate();
  const { currentUser, currentRole, setCurrentUser, setCurrentRole } = useAppStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<ServiceType | 'all'>('all');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const storedUserId = localStorage.getItem('currentUserId');
    const storedRole = localStorage.getItem('currentRole') as 'employer' | 'aide' | null;
    
    if (storedUserId && storedRole) {
      setCurrentRole(storedRole);
      api.users.get(storedUserId).then(user => {
        setCurrentUser(user);
      }).catch(() => {});
    }
    
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await api.orders.list({ status: 'pending' });
      setOrders(data);
    } catch (error) {
      console.error('Load orders failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filterType !== 'all' && order.serviceType !== filterType) return false;
    if (searchText && !order.address.includes(searchText) && !order.requirements.includes(searchText)) return false;
    return true;
  });

  const stats = [
    { label: '今日新单', value: orders.length, icon: TrendingUp, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: '今日收入', value: '¥0', icon: Clock, color: 'text-secondary-600', bg: 'bg-secondary-50' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-100 to-cream-50 pb-20 md:pb-8">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary-500 via-secondary-600 to-primary-500 p-8 md:p-10 text-white mb-8 animate-fade-in">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full" />
          <div className="absolute left-10 bottom-0 w-32 h-32 bg-white/10 rounded-full" />
          
          <div className="relative z-10">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              接单大厅
            </h1>
            <p className="text-white/80 mb-6">
              选择合适的订单，开始您的工作
            </p>

            <div className="relative max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warmgray-400" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="搜索地址、需求关键词..."
                className="w-full pl-12 pr-4 py-3 bg-white/95 rounded-full text-warmgray-700 placeholder-warmgray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="card animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${stat.bg}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-warmgray-800">{stat.value}</div>
                    <div className="text-sm text-warmgray-500">{stat.label}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-warmgray-800">
            可接订单
          </h2>
          <button className="flex items-center gap-2 text-warmgray-600 hover:text-warmgray-800 transition-colors">
            <Filter className="w-5 h-5" />
            筛选
          </button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-5 py-2 rounded-full whitespace-nowrap font-medium transition-all ${
              filterType === 'all'
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-200'
                : 'bg-white text-warmgray-600 hover:bg-cream-100'
            }`}
          >
            全部
          </button>
          {(Object.keys(SERVICE_TYPE_LABELS) as ServiceType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-5 py-2 rounded-full whitespace-nowrap font-medium transition-all ${
                filterType === type
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-200'
                  : 'bg-white text-warmgray-600 hover:bg-cream-100'
              }`}
            >
              {SERVICE_TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse text-warmgray-400">加载中...</div>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order, index) => (
              <OrderCard
                key={order.id}
                order={order}
                view="aide"
              />
            ))}
          </div>
        ) : (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-warmgray-700 mb-2">
              暂无待接订单
            </h3>
            <p className="text-warmgray-500">
              稍后再来看看，新订单会不断更新
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
