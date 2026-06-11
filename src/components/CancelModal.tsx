import { useState } from 'react';
import { X, Calendar, UserX, CloudRain } from 'lucide-react';
import type { CancelReason } from '@shared/types';
import { CANCEL_REASON_LABELS } from '@shared/types';

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: CancelReason, note: string) => void;
  userRole: 'employer' | 'aide';
}

const reasonIcons: Record<CancelReason, any> = {
  employer_reschedule: Calendar,
  aide_no_show: UserX,
  weather: CloudRain,
};

const reasonDescriptions: Record<CancelReason, string> = {
  employer_reschedule: '雇主承担10%手续费，其余款项退回',
  aide_no_show: '全额退款，阿姨将被扣减费用和评分',
  weather: '双方免责，全额退款',
};

export default function CancelModal({ isOpen, onClose, onConfirm, userRole }: CancelModalProps) {
  const [selectedReason, setSelectedReason] = useState<CancelReason | null>(null);
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const availableReasons: CancelReason[] = userRole === 'employer'
    ? ['employer_reschedule', 'aide_no_show', 'weather']
    : ['weather'];

  const handleConfirm = () => {
    if (selectedReason) {
      onConfirm(selectedReason, note);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-warmgray-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-card-hover w-full max-w-md p-6 animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-cream-100 transition-colors"
        >
          <X className="w-5 h-5 text-warmgray-500" />
        </button>

        <h3 className="text-xl font-display font-bold text-warmgray-800 mb-1">取消订单</h3>
        <p className="text-warmgray-500 mb-6">请选择取消原因</p>

        <div className="space-y-3 mb-6">
          {availableReasons.map((reason) => {
            const Icon = reasonIcons[reason];
            const isSelected = selectedReason === reason;
            return (
              <button
                key={reason}
                onClick={() => setSelectedReason(reason)}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                  isSelected
                    ? 'border-primary-400 bg-primary-50'
                    : 'border-cream-200 hover:border-cream-300 hover:bg-cream-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl ${
                    isSelected ? 'bg-primary-100' : 'bg-cream-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-primary-600' : 'text-warmgray-500'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-warmgray-800">
                      {CANCEL_REASON_LABELS[reason]}
                    </div>
                    <div className="text-sm text-warmgray-500 mt-0.5">
                      {reasonDescriptions[reason]}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mb-6">
          <label className="label">补充说明（可选）</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="请输入取消的详细说明..."
            className="input-field min-h-[80px] resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 btn-secondary">
            再想想
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedReason}
            className={`flex-1 btn-primary ${!selectedReason ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            确认取消
          </button>
        </div>
      </div>
    </div>
  );
}
