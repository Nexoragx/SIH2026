import React, { useState, useRef, useEffect } from 'react';
import { Shield, PhoneCall, Send, UserCheck, X, CheckCheck, Clock, Lock } from 'lucide-react';
import { ChatMessage, UserProfile } from '../../types';

interface VictimObserverChatProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onRequestCall: () => void;
}

export const VictimObserverChat: React.FC<VictimObserverChatProps> = ({
  isOpen,
  onClose,
  userProfile,
  messages,
  onSendMessage,
  onRequestCall,
}) => {
  const [text, setText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn">
      <div className="liquid-glass-panel rounded-t-3xl sm:rounded-3xl max-w-lg w-full h-[85vh] sm:h-[620px] flex flex-col shadow-2xl relative overflow-hidden bg-white">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/90 flex items-center justify-between bg-gradient-to-r from-emerald-50/90 to-teal-50/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/25">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900">Dr. Anita Joshi</h3>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.2 rounded-full">
                  ● District Observer
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Nodal Mental Health Unit, {userProfile.district || 'Nashik'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onRequestCall}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
              title="Request Urgent Call"
            >
              <PhoneCall className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Security Indicator */}
        <div className="bg-slate-50 px-4 py-1.5 border-b border-slate-100 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
          <Lock className="w-3 h-3 text-emerald-600" />
          <span>End-to-End Encrypted 1:1 Care Channel</span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-50/30">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.sender === 'victim' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-3xl p-3.5 text-xs sm:text-sm font-medium leading-relaxed ${
                  m.sender === 'victim'
                    ? 'bg-emerald-600 text-white rounded-br-xs shadow-xs'
                    : 'liquid-tile text-slate-800 rounded-bl-xs shadow-xs bg-white'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9px] text-slate-400 mt-1 px-1 flex items-center gap-1">
                <span>{m.timestamp}</span>
                {m.sender === 'victim' && <CheckCheck className="w-3 h-3 text-emerald-600" />}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-slate-200/80 bg-white flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message to Dr. Anita..."
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/30 bg-slate-50/50"
          />
          <button
            type="submit"
            className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-extrabold shadow-md shadow-emerald-600/25 transition flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
