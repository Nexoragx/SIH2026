import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

/* ============================================================
   1. BASE SKELETON PRIMITIVE
   ============================================================ */

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded' | 'pill';
  width?: string | number;
  height?: string | number;
  theme?: 'light' | 'dark' | 'emerald';
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rounded',
  width,
  height,
  theme = 'light',
  animate = true,
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'pill':
        return 'rounded-full';
      case 'rounded':
        return 'rounded-2xl';
      case 'rectangular':
        return 'rounded-md';
      case 'text':
      default:
        return 'rounded-md';
    }
  };

  const getThemeClass = () => {
    switch (theme) {
      case 'dark':
        return animate ? 'animate-shimmer-dark' : 'bg-slate-800';
      case 'emerald':
        return animate ? 'animate-shimmer-emerald' : 'bg-emerald-100';
      case 'light':
      default:
        return animate ? 'animate-shimmer' : 'bg-slate-200';
    }
  };

  return (
    <div
      className={`skeleton-box ${getVariantClass()} ${getThemeClass()} ${className}`}
      style={{
        width: width !== undefined ? width : undefined,
        height: height !== undefined ? height : undefined,
      }}
      aria-hidden="true"
    />
  );
};

/* ============================================================
   2. FULL PAGE / TAB SUSPENSE FALLBACK LOADER
   ============================================================ */

export interface PageLoaderProps {
  message?: string;
  subtext?: string;
  compact?: boolean;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  message = 'Loading ANVAYA Portal...',
  subtext = 'Synchronizing encrypted neural health telemetry',
  compact = false,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center ${
        compact ? 'py-16' : 'min-h-[55vh] py-20'
      } px-4 text-center animate-fade-in`}
    >
      <div className="relative mb-6">
        {/* Outer glowing pulsing aura */}
        <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-indigo-500/20 via-pink-500/20 to-emerald-500/20 blur-xl animate-ripple" />

        {/* Dual spinning indicator rings */}
        <div className="w-16 h-16 rounded-full border-2 border-indigo-200/40 border-t-indigo-600 animate-spin" />
        <div className="absolute inset-1.5 rounded-full border-2 border-rose-200/30 border-b-rose-500 animate-spin-slow" />

        {/* Center Pulsing Heart Emblem */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md animate-heart-pulse">
            <Heart className="w-4.5 h-4.5 fill-white" />
          </div>
        </div>
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center justify-center gap-1.5">
          <span>{message}</span>
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
        </h3>
        <p className="text-xs text-slate-500 font-medium">{subtext}</p>
      </div>

      {/* Shimmer loading progress bar */}
      <div className="w-48 h-1.5 bg-slate-200/80 rounded-full overflow-hidden mt-5">
        <div className="w-full h-full animate-shimmer" />
      </div>
    </div>
  );
};

/* ============================================================
   3. DASHBOARD OVERVIEW SKELETON (VICTIM DASHBOARD)
   ============================================================ */

export const DashboardOverviewSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      {/* Top Banner Skeleton */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/70 border border-slate-200/70 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Skeleton variant="circular" width={28} height={28} />
              <Skeleton variant="pill" width={140} height={22} />
            </div>
            <Skeleton variant="rounded" width={260} height={32} />
            <Skeleton variant="text" width={380} height={16} />
          </div>
          <div className="flex gap-2.5 w-full sm:w-auto">
            <Skeleton variant="rounded" width={130} height={42} />
            <Skeleton variant="rounded" width={130} height={42} />
          </div>
        </div>
      </div>

      {/* Assigned Observer Card Skeleton */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Skeleton variant="rounded" width={44} height={44} theme="dark" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton variant="text" width={150} height={16} theme="dark" />
              <Skeleton variant="pill" width={100} height={18} theme="dark" />
            </div>
            <Skeleton variant="text" width={240} height={12} theme="dark" />
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Skeleton variant="rounded" width={130} height={36} theme="dark" />
          <Skeleton variant="rounded" width={130} height={36} theme="dark" />
        </div>
      </div>

      {/* Grid: Distress Score Card + Check-in History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white/70 border border-slate-200/70 shadow-xs space-y-4">
          <Skeleton variant="text" width={140} height={18} />
          <div className="flex items-center justify-center py-4">
            <Skeleton variant="circular" width={130} height={130} />
          </div>
          <div className="space-y-2">
            <Skeleton variant="text" width="100%" height={14} />
            <Skeleton variant="text" width="80%" height={14} />
          </div>
        </div>

        <div className="lg:col-span-2 p-6 rounded-3xl bg-white/70 border border-slate-200/70 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton variant="text" width={180} height={20} />
            <Skeleton variant="pill" width={80} height={24} />
          </div>
          <div className="grid grid-cols-7 gap-2 pt-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton variant="rounded" width="100%" height={80} />
                <Skeleton variant="text" width={24} height={12} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Action Tiles Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 rounded-2xl bg-white/70 border border-slate-200/70 shadow-xs space-y-3">
            <Skeleton variant="rounded" width={36} height={36} />
            <Skeleton variant="text" width="70%" height={16} />
            <Skeleton variant="text" width="90%" height={12} />
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============================================================
   4. TABLE SKELETON (ADMIN, OBSERVER & CASELOAD)
   ============================================================ */

export interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  showHeader?: boolean;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  cols = 5,
  showHeader = true,
}) => {
  return (
    <div className="w-full bg-white/80 rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs animate-fade-in">
      {showHeader && (
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" width={20} height={20} />
            <Skeleton variant="text" width={160} height={18} />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton variant="rounded" width={120} height={32} />
            <Skeleton variant="rounded" width={80} height={32} />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/50">
              {[...Array(cols)].map((_, i) => (
                <th key={i} className="p-3.5 sm:p-4">
                  <Skeleton variant="text" width="60%" height={14} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[...Array(rows)].map((_, r) => (
              <tr key={r} className="hover:bg-slate-50/40 transition">
                {[...Array(cols)].map((_, c) => (
                  <td key={c} className="p-3.5 sm:p-4">
                    {c === 0 ? (
                      <div className="flex items-center gap-2.5">
                        <Skeleton variant="circular" width={28} height={28} />
                        <div className="space-y-1">
                          <Skeleton variant="text" width={110} height={14} />
                          <Skeleton variant="text" width={70} height={10} />
                        </div>
                      </div>
                    ) : c === cols - 1 ? (
                      <div className="flex items-center gap-2">
                        <Skeleton variant="rounded" width={64} height={28} />
                        <Skeleton variant="rounded" width={64} height={28} />
                      </div>
                    ) : (
                      <Skeleton variant="text" width={c % 2 === 0 ? '75%' : '50%'} height={14} />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ============================================================
   5. STAT CARD SKELETON
   ============================================================ */

export const StatCardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in`}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="p-5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton variant="text" width="50%" height={14} />
            <Skeleton variant="circular" width={32} height={32} />
          </div>
          <Skeleton variant="rounded" width="40%" height={28} />
          <Skeleton variant="text" width="70%" height={12} />
        </div>
      ))}
    </div>
  );
};

/* ============================================================
   6. CARD GRID SKELETON (DOCTOR DIRECTORY, RESOURCES, EXERCISES)
   ============================================================ */

export interface CardGridSkeletonProps {
  count?: number;
  columns?: 2 | 3 | 4;
}

export const CardGridSkeleton: React.FC<CardGridSkeletonProps> = ({
  count = 6,
  columns = 3,
}) => {
  const colClass =
    columns === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : columns === 4
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`grid ${colClass} gap-5 animate-fade-in`}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-3xl bg-white/80 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <Skeleton variant="circular" width={44} height={44} />
              <Skeleton variant="pill" width={70} height={22} />
            </div>
            <Skeleton variant="text" width="75%" height={18} />
            <Skeleton variant="text" width="95%" height={14} />
            <Skeleton variant="text" width="60%" height={14} />
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <Skeleton variant="text" width={60} height={12} />
            <Skeleton variant="rounded" width={90} height={32} />
          </div>
        </div>
      ))}
    </div>
  );
};

/* ============================================================
   7. HOPE WALL SKELETON
   ============================================================ */

export const HopeWallSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Category Pills Skeleton */}
      <div className="flex flex-wrap gap-2 pb-2">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} variant="pill" width={i === 0 ? 60 : 90 + (i % 3) * 15} height={34} />
        ))}
      </div>

      {/* Hope Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-3xl bg-white/80 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Skeleton variant="circular" width={32} height={32} />
                  <div className="space-y-1">
                    <Skeleton variant="text" width={90} height={14} />
                    <Skeleton variant="text" width={50} height={10} />
                  </div>
                </div>
                <Skeleton variant="pill" width={64} height={20} />
              </div>
              <Skeleton variant="text" width="100%" height={16} />
              <Skeleton variant="text" width="85%" height={16} />
              <Skeleton variant="text" width="45%" height={16} />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <Skeleton variant="pill" width={60} height={26} />
              <Skeleton variant="text" width={40} height={12} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============================================================
   8. DOCTOR DIRECTORY SKELETON
   ============================================================ */

export const DoctorDirectorySkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white/90 border border-slate-200 shadow-xs space-y-4"
          >
            <div className="flex items-start gap-3.5">
              <Skeleton variant="circular" width={48} height={48} />
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <Skeleton variant="text" width={140} height={16} />
                  <Skeleton variant="pill" width={60} height={20} />
                </div>
                <Skeleton variant="text" width={110} height={12} />
                <Skeleton variant="text" width={180} height={12} />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <Skeleton variant="text" width={90} height={12} />
              <Skeleton variant="text" width={110} height={12} />
            </div>

            <div className="flex gap-2">
              <Skeleton variant="rounded" width="50%" height={36} />
              <Skeleton variant="rounded" width="50%" height={36} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============================================================
   9. CHATBOT SKELETON
   ============================================================ */

export const ChatbotSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col h-full space-y-4 p-4 animate-fade-in">
      {/* Bot message bubble skeleton */}
      <div className="flex items-start gap-3 max-w-[80%]">
        <Skeleton variant="circular" width={34} height={34} />
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 flex-1">
          <Skeleton variant="text" width="90%" height={14} />
          <Skeleton variant="text" width="70%" height={14} />
        </div>
      </div>

      {/* User message bubble skeleton */}
      <div className="flex items-end justify-end gap-3 self-end max-w-[70%]">
        <div className="p-3.5 rounded-2xl bg-indigo-600/20 border border-indigo-200 space-y-1.5 flex-1">
          <Skeleton variant="text" width="80%" height={14} />
        </div>
      </div>

      {/* Bot response bubble skeleton */}
      <div className="flex items-start gap-3 max-w-[85%]">
        <Skeleton variant="circular" width={34} height={34} />
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 flex-1">
          <Skeleton variant="text" width="95%" height={14} />
          <Skeleton variant="text" width="85%" height={14} />
          <Skeleton variant="text" width="50%" height={14} />
        </div>
      </div>

      {/* Action pill suggestions skeleton */}
      <div className="flex gap-2 pt-4 overflow-x-auto">
        <Skeleton variant="pill" width={120} height={30} />
        <Skeleton variant="pill" width={140} height={30} />
        <Skeleton variant="pill" width={100} height={30} />
      </div>
    </div>
  );
};

/* ============================================================
   10. ASSESSMENT QUESTIONNAIRE SKELETON
   ============================================================ */

export const AssessmentSkeleton: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-white/80 border border-slate-200/80 shadow-xs space-y-6 animate-fade-in">
      {/* Progress bar skeleton */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton variant="text" width={80} height={12} />
          <Skeleton variant="text" width={40} height={12} />
        </div>
        <Skeleton variant="rounded" width="100%" height={8} />
      </div>

      {/* Question Header Skeleton */}
      <div className="space-y-2.5 py-2">
        <Skeleton variant="pill" width={90} height={22} />
        <Skeleton variant="text" width="90%" height={24} />
        <Skeleton variant="text" width="60%" height={14} />
      </div>

      {/* Options Matrix Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <Skeleton variant="text" width="80%" height={16} />
            <Skeleton variant="text" width="50%" height={12} />
          </div>
        ))}
      </div>

      {/* Navigation Buttons Skeleton */}
      <div className="flex justify-between pt-4 border-t border-slate-100">
        <Skeleton variant="rounded" width={90} height={40} />
        <Skeleton variant="rounded" width={110} height={40} />
      </div>
    </div>
  );
};
