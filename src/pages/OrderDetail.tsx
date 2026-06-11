import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Clock,
  PawPrint,
  FileText,
  Camera,
  X,
  Phone,
  Star,
  User,
} from 'lucide-react';
import Header from '@/components/Header';
import StatusTimeline from '@/components/StatusTimeline';
import CancelModal from '@/components/CancelModal';
import { useAppStore } from '@/store/appStore';
import { api } from '@/lib/api';
import type { Order, OrderStatus, CancelReason } from '@shared/types';
import { SERVICE_TYPE_LABELS, ORDER_STATUS_LABELS, CANCEL_REASON_LABELS } from '@shared/types';

const serviceIcons: Record<string, string> = {
  cleaning: '🧹',
  cooking: '🍳',
  care: '🤝',
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, currentRole } = useAppStore();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    try {
      const data = await api.orders.get(id!);
      setOrder(data);
    } catch (error: any) {
      console.error('Load order failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!currentUser || !order) return;
    
    setUpdating(true);
    try {
      const updated = await api.orders.accept(order.id, currentUser.id);
      setOrder(updated);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateStatus = async (status: OrderStatus) => {
    if (!currentUser || !order) return;
    
    setUpdating(true);
    try {
      const updated = await api.orders.updateStatus(order.id, status, currentUser.id);
      setOrder(updated);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async (reason: CancelReason, note: string) => {
    if (!currentUser || !order) return;
    
    try {
      const updated = await api.orders.cancel(order.id, reason, currentUser.id, note);
      setOrder(updated);
      setShowCancelModal(false);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleAddPhoto = async () => {
    if (!currentUser || !order) return;
    
    const photoUrl = `https://picsum.photos/seed/${Date.now()}/400/300`;
    try {
      const updated = await api.orders.addPhotos(order.id, currentUser.id, [photoUrl]);
      setOrder(updated);
    } catch (error: any) {
      alert(error.message);
    }
  };

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

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream-100 to-cream-50">
        <Header />
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="text-6xl">📋</div>
          <p className="text-warmgray-500">订单不存在</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const isAide = currentRole === 'aide';
  const canCancel = !['completed', 'cancelled'].includes(order.status);

  const nextStatus: Record<OrderStatus, OrderStatus | null> = {
    pending: null,
    accepted: 'departed',
    departed: 'arrived',
    arrived: 'completed',
    completed: null,
    cancelled: null,
  };

  const nextStatusLabel: Record<string, string> = {
    departed: '我已出发',
    arrived: '我已到达',
    completed: '完成服务',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-100 to-cream-50 pb-32 md:pb-8">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-warmgray-600 hover:text-warmgray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回
        </button>

        <div className="card mb-6 animate-fade-in">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-cream-200 flex items-center justify-center text-4xl">
                {serviceIcons[order.serviceType]}
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-warmgray-800">
                  {SERVICE_TYPE_LABELS[order.serviceType]}
                </h1>
                <p className="text-warmgray-500">
                  订单号：{order.id}
                </p>
              </div>
            </div>
            <span className={`tag ${
              order.status === 'completed'
                ? 'bg-green-100 text-green-700'
                : order.status === 'cancelled'
                ? 'bg-warmgray-100 text-warmgray-600'
                : order.status === 'pending'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-secondary-100 text-secondary-700'
            }`}>
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>

          <div className="p-4 bg-cream-50 rounded-2xl">
            <StatusTimeline
              status={order.status}
              departedAt={order.departedAt}
              arrivedAt={order.arrivedAt}
              completedAt={order.completedAt}
              cancelledAt={order.cancelledAt}
            />
          </div>
        </div>

        {(order.aideName || order.employerName) && (
          <div className="card mb-6 animate-slide-up">
            <h2 className="font-semibold text-warmgray-800 mb-4">
              {isAide ? '雇主信息' : '服务人员'}
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cream-300 to-cream-400 flex items-center justify-center text-warmgray-700 text-xl font-medium">
                {(isAide ? order.employerName : order.aideName)?.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-medium text-warmgray-800 text-lg">
                  {isAide ? order.employerName : order.aideName}
                </div>
                <div className="flex items-center gap-1 text-sm text-warmgray-500">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>4.9</span>
                  <span className="text-warmgray-300">·</span>
                  <span>25单</span>
                </div>
              </div>
              <button className="p-3 rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors">
                <Phone className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <div className="card mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="font-semibold text-warmgray-800 mb-4">服务信息</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-primary-50">
                <MapPin className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <div className="text-sm text-warmgray-500">服务地址</div>
                <div className="text-warmgray-800">{order.address}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-secondary-50">
                <Clock className="w-5 h-5 text-secondary-500" />
              </div>
              <div>
                <div className="text-sm text-warmgray-500">服务时间</div>
                <div className="text-warmgray-800">
                  {order.date} · {order.duration}小时
                </div>
              </div>
            </div>

            {order.hasPet && (
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-50">
                  <PawPrint className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <div className="text-sm text-warmgray-500">宠物情况</div>
                  <div className="text-warmgray-800">
                    有宠物：{order.petType || '未说明'}
                  </div>
                </div>
              </div>
            )}

            {order.requirements && (
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-purple-50">
                  <FileText className="w-5 h-5 text-purple-500" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-warmgray-500">特别要求</div>
                  <div className="text-warmgray-800">{order.requirements}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {order.photos && order.photos.length > 0 && (
          <div className="card mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="font-semibold text-warmgray-800 mb-4">
              服务照片 <span className="text-sm font-normal text-warmgray-400">({order.photos.length}张)</span>
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {order.photos.map((photo, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedPhoto(photo)}
                  className="aspect-square rounded-2xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <img
                    src={photo}
                    alt={`服务照片 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {order.cancelReason && (
          <div className="card mb-6 animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <h2 className="font-semibold text-warmgray-800 mb-3">取消原因</h2>
            <div className="p-4 bg-red-50 rounded-2xl">
              <div className="font-medium text-red-700">
                {CANCEL_REASON_LABELS[order.cancelReason]}
              </div>
              {order.cancelNote && (
                <p className="text-sm text-red-600 mt-2">{order.cancelNote}</p>
              )}
            </div>
          </div>
        )}

        <div className="card animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between">
            <span className="text-warmgray-600">订单金额</span>
            <div className="text-right">
              <span className="text-3xl font-bold text-primary-600">¥{order.price}</span>
              <p className="text-xs text-warmgray-400">{order.duration}小时 × 按服务类型计费</p>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-cream-200 p-4 md:relative md:mt-6 md:border-0 md:bg-transparent md:p-0">
        <div className="max-w-3xl mx-auto flex gap-3">
          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="flex-1 py-3 rounded-full border-2 border-warmgray-200 text-warmgray-600 font-medium hover:bg-warmgray-50 transition-colors"
            >
              取消订单
            </button>
          )}
          
          {isAide && order.status === 'pending' && (
            <button
              onClick={handleAccept}
              disabled={updating}
              className="flex-1 btn-primary"
            >
              {updating ? '接单中...' : '立即接单'}
            </button>
          )}
          
          {isAide && nextStatus[order.status] && (
            <button
              onClick={() => handleUpdateStatus(nextStatus[order.status]!)}
              disabled={updating}
              className="flex-1 btn-primary"
            >
              {updating ? '更新中...' : nextStatusLabel[nextStatus[order.status]!]}
            </button>
          )}
          
          {isAide && order.status === 'arrived' && (
            <button
              onClick={handleAddPhoto}
              className="flex-1 btn-secondary flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              上传照片
            </button>
          )}

          {!isAide && order.status === 'pending' && (
            <button
              onClick={() => navigate('/publish')}
              className="flex-1 btn-primary"
            >
              等待阿姨接单...
            </button>
          )}

          {order.status === 'completed' && (
            <button className="flex-1 btn-primary">
              评价服务
            </button>
          )}
        </div>
      </div>

      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        userRole={currentRole}
      />

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-warmgray-900/80 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedPhoto}
            alt="服务照片"
            className="max-w-full max-h-[80vh] rounded-2xl"
          />
        </div>
      )}
    </div>
  );
}
