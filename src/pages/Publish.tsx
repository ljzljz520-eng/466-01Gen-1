import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, PawPrint, FileText, Check, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import { useAppStore } from '@/store/appStore';
import { api } from '@/lib/api';
import type { ServiceType } from '@shared/types';
import { SERVICE_TYPE_LABELS, SERVICE_PRICES } from '@shared/types';

const steps = [
  { id: 1, label: '服务类型' },
  { id: 2, label: '时间地点' },
  { id: 3, label: '补充信息' },
];

const serviceIcons: Record<ServiceType, string> = {
  cleaning: '🧹',
  cooking: '🍳',
  care: '🤝',
};

const serviceDescriptions: Record<ServiceType, string> = {
  cleaning: '日常清洁、深度保洁、擦玻璃等',
  cooking: '家常菜、营养餐、宝宝辅食等',
  care: '老人陪护、育儿、病人看护等',
};

export default function Publish() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAppStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [serviceType, setServiceType] = useState<ServiceType>(() => {
    const type = searchParams.get('type');
    return (type as ServiceType) || 'cleaning';
  });
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState(2);
  const [hasPet, setHasPet] = useState(false);
  const [petType, setPetType] = useState('');
  const [requirements, setRequirements] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const price = duration * SERVICE_PRICES[serviceType];

  const canProceed = () => {
    if (currentStep === 1) return !!serviceType;
    if (currentStep === 2) return address.trim() && date && duration > 0;
    if (currentStep === 3) return true;
    return false;
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!currentUser) return;
    
    setSubmitting(true);
    try {
      const order = await api.orders.create({
        employerId: currentUser.id,
        serviceType,
        address,
        date,
        duration,
        hasPet,
        petType: hasPet ? petType : undefined,
        requirements,
        price,
      });
      navigate(`/order/${order.id}`);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-100 to-cream-50 pb-20 md:pb-8">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-warmgray-600 hover:text-warmgray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回
        </button>

        <div className="card mb-6">
          <h1 className="font-display text-2xl font-bold text-warmgray-800 mb-6">发布需求</h1>
          
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                      step.id < currentStep
                        ? 'bg-primary-500 text-white'
                        : step.id === currentStep
                        ? 'bg-primary-500 text-white ring-4 ring-primary-100'
                        : 'bg-cream-100 text-warmgray-400'
                    }`}
                  >
                    {step.id < currentStep ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <span className={`mt-2 text-xs font-medium ${
                    step.id <= currentStep ? 'text-warmgray-700' : 'text-warmgray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 mb-6 bg-cream-200">
                    <div
                      className={`h-full transition-all duration-300 ${
                        step.id < currentStep ? 'bg-primary-400 w-full' : 'w-0'
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card animate-fade-in">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-lg text-warmgray-800 mb-4">选择服务类型</h2>
              {(Object.keys(serviceIcons) as ServiceType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setServiceType(type)}
                  className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${
                    serviceType === type
                      ? 'border-primary-400 bg-primary-50'
                      : 'border-cream-200 hover:border-cream-300 hover:bg-cream-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${
                      serviceType === type ? 'bg-primary-100' : 'bg-cream-100'
                    }`}>
                      {serviceIcons[type]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-warmgray-800 text-lg">
                          {SERVICE_TYPE_LABELS[type]}
                        </h3>
                        {serviceType === type && (
                          <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-warmgray-500 mt-1">
                        {serviceDescriptions[type]}
                      </p>
                      <div className="mt-2">
                        <span className="text-primary-600 font-bold">
                          ¥{SERVICE_PRICES[type]}
                        </span>
                        <span className="text-warmgray-400 text-sm"> /小时</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="font-semibold text-lg text-warmgray-800">时间与地点</h2>
              
              <div>
                <label className="label flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  服务地址
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="请输入详细地址，如：北京市朝阳区建国路88号"
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary-500" />
                    服务日期
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary-500" />
                    服务时长
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDuration(Math.max(1, duration - 1))}
                      className="w-10 h-12 rounded-xl bg-cream-100 text-warmgray-600 font-medium hover:bg-cream-200 transition-colors"
                    >
                      -
                    </button>
                    <div className="flex-1 text-center input-field py-3 font-semibold">
                      {duration} 小时
                    </div>
                    <button
                      onClick={() => setDuration(Math.min(12, duration + 1))}
                      className="w-10 h-12 rounded-xl bg-cream-100 text-warmgray-600 font-medium hover:bg-cream-200 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-cream-50 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-warmgray-600">预估费用</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-primary-600">¥{price}</span>
                    <p className="text-xs text-warmgray-400">
                      {SERVICE_PRICES[serviceType]}元/小时 × {duration}小时
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="font-semibold text-lg text-warmgray-800">补充信息</h2>
              
              <div>
                <label className="label flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-primary-500" />
                  家里有宠物吗？
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setHasPet(false)}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                      !hasPet
                        ? 'bg-primary-500 text-white'
                        : 'bg-cream-100 text-warmgray-600 hover:bg-cream-200'
                    }`}
                  >
                    没有
                  </button>
                  <button
                    onClick={() => setHasPet(true)}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                      hasPet
                        ? 'bg-primary-500 text-white'
                        : 'bg-cream-100 text-warmgray-600 hover:bg-cream-200'
                    }`}
                  >
                    有
                  </button>
                </div>
              </div>

              {hasPet && (
                <div className="animate-fade-in">
                  <label className="label">宠物类型</label>
                  <div className="flex flex-wrap gap-2">
                    {['猫', '狗', '鸟', '鱼', '其他'].map((pet) => (
                      <button
                        key={pet}
                        onClick={() => setPetType(pet)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          petType === pet
                            ? 'bg-primary-500 text-white'
                            : 'bg-cream-100 text-warmgray-600 hover:bg-cream-200'
                        }`}
                      >
                        {pet}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="label flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary-500" />
                  特别要求
                </label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="请描述您的具体需求，比如：需要重点打扫厨房、清淡口味、老人需要协助翻身等..."
                  className="input-field min-h-[120px] resize-none"
                />
                <p className="text-xs text-warmgray-400 mt-2">
                  详细的需求描述能帮助阿姨更好地为您服务
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl border border-primary-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-warmgray-600">服务类型</span>
                  <span className="font-medium text-warmgray-800">
                    {serviceIcons[serviceType]} {SERVICE_TYPE_LABELS[serviceType]}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-warmgray-600">服务时间</span>
                  <span className="font-medium text-warmgray-800">
                    {date} · {duration}小时
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-primary-100">
                  <span className="text-warmgray-700 font-medium">合计费用</span>
                  <span className="text-xl font-bold text-primary-600">¥{price}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-6">
          {currentStep > 1 ? (
            <button onClick={handlePrev} className="flex-1 btn-secondary">
              上一步
            </button>
          ) : (
            <button onClick={() => navigate(-1)} className="flex-1 btn-secondary">
              取消
            </button>
          )}
          
          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex-1 btn-primary flex items-center justify-center gap-2 ${
                !canProceed() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              下一步 <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !canProceed()}
              className={`flex-1 btn-primary ${
                submitting || !canProceed() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? '发布中...' : '确认发布'}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
