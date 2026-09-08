import React, { useState, useEffect } from 'react';
import {
  Heart,
  Calendar,
  PhoneCall,
  Ambulance,
  MessageSquare,
  ArrowRight,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { assessmentApi, supportApi } from '../../api';

interface VictimDashboardProps {
  onStartCheckin: () => void;
  onOpenSupport: () => void;
  onOpenChat: () => void;
  onOpenEmergency: () => void;
  onOpenSchedule: () => void;
  currentLang?: string;
}

export const VictimDashboard: React.FC<VictimDashboardProps> = ({
  onStartCheckin,
  onOpenSupport,
  onOpenChat,
  onOpenEmergency,
  onOpenSchedule,
}) => {
  const [scheduleData, setScheduleData] = useState<{
    days_remaining: number;
    completed_sessions: number;
    next_due_date: string;
  }>({
    days_remaining: 5,
    completed_sessions: 3,
    next_due_date: 'Saturday, 12 Sep 2026',
  });

  const [historyData, setHistoryData] = useState<any[]>([
    { date: '25 Aug', status: 'Stable', value: 80 },
    { date: '30 Aug', status: 'Needs attention', value: 65 },
    { date: '04 Sep', status: 'Needs attention', value: 60 },
    { date: '08 Sep', status: 'Stable', value: 75 },
  ]);

  const [wellbeingStatus, setWellbeingStatus] = useState<{
    label: string;
    subtext: string;
    dotColor: string;
    textColor: string;
    bgColor: string;
    borderColor: string;
  }>({
    label: 'Stable',
    subtext: 'Your recent check-in indicates positive emotional balance.',
    dotColor: 'bg-emerald-600',
    textColor: 'text-emerald-950',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  });

  useEffect(() => {
    // Fetch schedule from backend
    supportApi.getCheckinSchedule()
      .then((res) => {
        setScheduleData({
          days_remaining: res.days_remaining || 5,
          completed_sessions: res.completed_sessions || 3,
          next_due_date: res.next_due_date || 'Upcoming',
        });
      })
      .catch(() => {});

    // Fetch assessment history from backend
    assessmentApi.getVictimHistory()
      .then((res) => {
        if (res.history && res.history.length > 0) {
          const points = res.history.slice(0, 5).reverse().map((item, idx) => {
            const rawScore = item.distress_score || 30;
            // Invert score for victim wellbeing: 100 is best wellbeing, 0 is severe distress
            const wellbeingVal = Math.max(10, Math.min(100, 100 - rawScore));
            const statusLabel =
              wellbeingVal >= 70
                ? 'Stable'
                : wellbeingVal >= 45
                ? 'Needs attention'
                : 'Extra support recommended';
            const dateStr = item.created_at
              ? new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
              : `Session ${idx + 1}`;
            return {
              date: dateStr,
              status: statusLabel,
              value: wellbeingVal,
            };
          });
          setHistoryData(points);

          const latest = points[points.length - 1];
          if (latest.status === 'Stable') {
            setWellbeingStatus({
              label: 'Stable',
              subtext: 'Your recent check-in indicates positive emotional balance.',
              dotColor: 'bg-emerald-600',
              textColor: 'text-emerald-950',
              bgColor: 'bg-emerald-50',
              borderColor: 'border-emerald-200',
            });
          } else if (latest.status === 'Needs attention') {
            setWellbeingStatus({
              label: 'Needs attention',
              subtext: 'Gentle stress signs noticed. Take things one step at a time.',
              dotColor: 'bg-amber-600',
              textColor: 'text-amber-950',
              bgColor: 'bg-amber-50',
              borderColor: 'border-amber-200',
            });
          } else {
            setWellbeingStatus({
              label: 'Extra support recommended',
              subtext: 'Caring support is ready to listen whenever you want to talk.',
              dotColor: 'bg-orange-600',
              textColor: 'text-orange-950',
              bgColor: 'bg-orange-50',
              borderColor: 'border-orange-200',
            });
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-8 animate-fadeIn">
      {/* 1. Header (Confidential, no prominent victim name) */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
            ANVAYA
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs font-semibold text-slate-500">
            Confidential Safeguarding
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
          Your wellbeing matters.
        </h1>
        <p className="text-sm font-medium text-slate-700 mt-1">
          We are here to support you at your own pace. You are not alone.
        </p>
      </div>

      {/* 2. Primary CTA: How are you feeling today? */}
      <div className="anvaya-card p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-lg">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>Confidential Check-in</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
              How are you feeling today?
            </h2>
            <p className="text-sm text-slate-700 font-medium leading-relaxed">
              Take a short, gentle check-in to reflect on your sleep, energy, and peace of mind.
            </p>
          </div>

          <button
            type="button"
            onClick={onStartCheckin}
            className="w-full sm:w-auto px-7 py-3.5 bg-black hover:bg-slate-900 active:scale-95 text-white font-extrabold text-sm rounded-xl transition flex items-center justify-center gap-2.5 shadow-md cursor-pointer"
          >
            <span>Start Check-in</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* 3. Wellbeing Status & Next Check-in (2-Column Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Wellbeing Status Card */}
        <div className="anvaya-card p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
              Your recent wellbeing
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Last check-in
            </span>
          </div>

          <div className={`p-4 rounded-xl border ${wellbeingStatus.borderColor} ${wellbeingStatus.bgColor} flex items-start gap-3`}>
            <span className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${wellbeingStatus.dotColor}`}></span>
            <div>
              <div className="text-base font-black text-black">
                {wellbeingStatus.label}
              </div>
              <p className="text-xs font-medium text-slate-700 mt-0.5">
                {wellbeingStatus.subtext}
              </p>
            </div>
          </div>
        </div>

        {/* Next Check-in Card */}
        <div className="anvaya-card p-6 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                Next check-in
              </span>
              <Calendar className="w-4 h-4 text-slate-500" />
            </div>

            <div className="mt-3">
              <div className="text-2xl font-black text-black">
                In {scheduleData.days_remaining} days
              </div>
              <p className="text-xs font-medium text-slate-700 mt-1">
                Due: {scheduleData.next_due_date}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">
              {scheduleData.completed_sessions} check-ins completed
            </span>
            <button
              type="button"
              onClick={onOpenSchedule}
              className="text-xs font-extrabold text-black hover:underline cursor-pointer"
            >
              View schedule →
            </button>
          </div>
        </div>
      </div>

      {/* 4. Progress / Trend: Your wellbeing over time */}
      <div className="anvaya-card p-6 sm:p-7 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-black text-black">
              Your wellbeing over time
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              Simple trajectory based on your completed check-ins.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-800 bg-slate-100 px-3 py-1 rounded-full self-start">
            <TrendingUp className="w-3.5 h-3.5 text-black" />
            <span>Reflective Trend</span>
          </div>
        </div>

        <div className="h-48 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fill: '#000000', fontSize: 11, fontWeight: 700 }} stroke="#E2E8F0" />
              <YAxis domain={[0, 100]} tick={{ fill: '#000000', fontSize: 11, fontWeight: 600 }} stroke="#E2E8F0" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-2.5 rounded-xl border border-slate-300 shadow-md text-xs font-bold text-black">
                        <div>{data.date}</div>
                        <div className="text-slate-700 text-[11px] font-medium mt-0.5">
                          Status: {data.status}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#000000"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#000000', strokeWidth: 2, stroke: '#FFFFFF' }}
                activeDot={{ r: 6, fill: '#000000' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Support Section: Three attractive cards */}
      <div className="space-y-3">
        <h3 className="text-base font-black text-black">
          Immediate Support Channels
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Chat with support */}
          <div
            onClick={onOpenChat}
            className="anvaya-tile p-5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-slate-400 transition flex flex-col justify-between space-y-3 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-black flex items-center justify-center font-bold text-lg">
                💬
              </div>
              <div>
                <h4 className="text-sm font-black text-black group-hover:underline">
                  Talk to someone
                </h4>
                <p className="text-xs font-medium text-slate-600">
                  Chat with support
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-700 font-medium">
              Confidential, gentle companion to share your thoughts in a safe space.
            </p>
            <div className="text-xs font-extrabold text-black flex items-center gap-1">
              <span>Start conversation</span>
              <span>→</span>
            </div>
          </div>

          {/* Card 2: Helpline */}
          <div
            onClick={onOpenSupport}
            className="anvaya-tile p-5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-slate-400 transition flex flex-col justify-between space-y-3 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-black flex items-center justify-center font-bold text-lg">
                ☎
              </div>
              <div>
                <h4 className="text-sm font-black text-black group-hover:underline">
                  Helpline
                </h4>
                <p className="text-xs font-medium text-slate-600">
                  Get immediate support
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-700 font-medium">
              Toll-free 24x7 support: Tele-MANAS (14416) and Atrocity Helpline (14566).
            </p>
            <div className="text-xs font-extrabold text-black flex items-center gap-1">
              <span>View helplines</span>
              <span>→</span>
            </div>
          </div>

          {/* Card 3: Emergency (Reserved Red Emergency CTA) */}
          <div
            onClick={onOpenEmergency}
            className="p-5 bg-red-50 border border-red-200 rounded-xl cursor-pointer hover:border-red-400 transition flex flex-col justify-between space-y-3 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-lg">
                🚑
              </div>
              <div>
                <h4 className="text-sm font-black text-red-950">
                  Emergency
                </h4>
                <p className="text-xs font-medium text-red-900">
                  Get emergency assistance
                </p>
              </div>
            </div>
            <p className="text-xs text-red-900 font-medium">
              Immediate crisis response and 108 medical / psychological safety net.
            </p>
            <div className="text-xs font-extrabold text-red-700 flex items-center gap-1">
              <span>Request emergency aid</span>
              <span>→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VictimDashboard;
