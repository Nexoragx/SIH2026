import React, { useEffect, useState } from 'react';
import { Calendar, Clock, X, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { supportApi } from '../../api';

interface CheckinScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartEarly: () => void;
}

export const CheckinScheduleModal: React.FC<CheckinScheduleModalProps> = ({
  isOpen,
  onClose,
  onStartEarly,
}) => {
  const [schedule, setSchedule] = useState<{
    interval_days: number;
    cadence_label: string;
    next_due_date: string;
    days_remaining: number;
    completed_sessions: number;
    status: string;
  }>({
    interval_days: 7,
    cadence_label: 'Weekly (7 days)',
    next_due_date: 'Upcoming',
    days_remaining: 7,
    completed_sessions: 0,
    status: 'SCHEDULED',
  });

  useEffect(() => {
    if (isOpen) {
      supportApi.getCheckinSchedule()
        .then((res) => setSchedule(res))
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-black transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-black flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-black">
              Check-in Schedule
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              Adaptive wellbeing check-in cadence
            </p>
          </div>
        </div>

        {/* Schedule Summary Card */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Frequency:</span>
            <span className="text-xs font-black text-black">{schedule.cadence_label}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Next Due Date:</span>
            <span className="text-xs font-black text-black">{schedule.next_due_date}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Time Remaining:</span>
            <span className="text-xs font-bold text-slate-800">{schedule.days_remaining} days</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <span className="text-xs font-semibold text-slate-600">Completed Sessions:</span>
            <span className="text-xs font-black text-black">{schedule.completed_sessions} check-ins</span>
          </div>
        </div>

        {/* Explanatory Note */}
        <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-700 font-medium">
          <ShieldCheck className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
          <span>
            The schedule automatically adjusts based on your needs. You can always complete a check-in early whenever you feel like reflecting.
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-xs font-bold text-black rounded-xl transition"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onStartEarly();
            }}
            className="flex-1 py-3 bg-black hover:bg-slate-900 active:scale-95 text-xs font-extrabold text-white rounded-xl transition flex items-center justify-center gap-1.5 shadow-md"
          >
            <span>Start Early</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckinScheduleModal;
