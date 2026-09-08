import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';

interface OptionalHistoryCardProps {
  onContinue: (text: string) => void;
  onSkip: () => void;
  onBack?: () => void;
}

export const OptionalHistoryCard: React.FC<OptionalHistoryCardProps> = ({
  onContinue,
  onSkip,
  onBack,
}) => {
  const [text, setText] = useState<string>('');
  const maxLength = 1000;

  const handleContinue = () => {
    onContinue(text.trim());
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10 animate-fadeInScale">
      <div className="anvaya-card p-6 sm:p-10 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
        {/* Header Badge */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Optional Sharing • Step 2 of 2
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {text.length} / {maxLength}
          </span>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
            Would you like to share anything?
          </h2>
          <p className="text-sm font-medium text-slate-700">
            You can tell us what has been happening in your own words. This is completely optional and private.
          </p>
        </div>

        {/* Text Area */}
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, maxLength))}
            placeholder="You can tell us what has been happening... Take your time."
            rows={6}
            className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50/70 text-sm text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition resize-none font-medium leading-relaxed"
          />
        </div>

        {/* Confidentiality Reminder */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-700 font-medium">
          <span className="text-black font-bold">🔒</span>
          <span>
            Your words are stored in your confidential support record and used only to connect you with caring assistance.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="text-xs font-bold text-slate-600 hover:text-black transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onSkip}
              className="px-4 py-2.5 text-xs font-extrabold text-slate-700 hover:text-black hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Skip
            </button>

            <button
              type="button"
              onClick={handleContinue}
              className="px-6 py-2.5 bg-black hover:bg-slate-900 active:scale-95 text-white text-xs font-extrabold rounded-xl transition flex items-center gap-2 shadow-md cursor-pointer"
            >
              <span>{text.trim().length > 0 ? 'Save & Continue' : 'Continue'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptionalHistoryCard;
