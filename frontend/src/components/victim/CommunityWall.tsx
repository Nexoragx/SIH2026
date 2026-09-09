import React, { useState } from 'react';
import { Heart, Sparkles, MessageCircle, Send, ShieldCheck, UserCheck, X } from 'lucide-react';

interface CommunityMessage {
  id: string;
  author: string;
  district: string;
  category: string;
  message: string;
  likes: number;
  timeAgo: string;
}

interface CommunityWallProps {
  isOpen?: boolean;
  onClose?: () => void;
  currentLang?: string;
}

export const CommunityWall: React.FC<CommunityWallProps> = ({
  isOpen,
  onClose,
  currentLang = 'en',
}) => {
  const [messages, setMessages] = useState<CommunityMessage[]>([
    {
      id: 'cw-1',
      author: 'A Brave Sister',
      district: 'Nashik, Maharashtra',
      category: 'Atrocity Survivor',
      message: 'When the incident happened, I thought my life was over. Today, after 4 months of support from our health observer and legal team, I can smile again. Please stay strong.',
      likes: 42,
      timeAgo: 'Yesterday',
    },
    {
      id: 'cw-2',
      author: 'Fellow Fighter',
      district: 'Hathras, UP',
      category: 'Survivor of Violence',
      message: 'Take it one breath at a time. The 4-7-8 breathing exercise in this app helped me through my worst panic attacks before court dates. You are not alone.',
      likes: 29,
      timeAgo: '2 days ago',
    },
    {
      id: 'cw-3',
      author: 'Community Member',
      district: 'Dharmapuri, Tamil Nadu',
      category: 'Witness & Survivor',
      message: 'The truth will bring you justice and dignity. Speak with your assigned doctor when you feel overwhelmed. We are walking this path together.',
      likes: 38,
      timeAgo: '3 days ago',
    },
    {
      id: 'cw-4',
      author: 'Resilient Voice',
      district: 'Gaya, Bihar',
      category: 'Atrocity Complainant',
      message: 'To anyone reading this today: you survived the hardest day of your life. Every sunrise after that is proof of your strength.',
      likes: 54,
      timeAgo: '4 days ago',
    },
  ]);

  const [newMessage, setNewMessage] = useState<string>('');
  const [likedIds, setLikedIds] = useState<{ [key: string]: boolean }>({});
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  if (isOpen === false) return null;

  const handleLike = (id: string) => {
    setLikedIds((prev) => {
      const isCurrentlyLiked = prev[id];
      const updated = { ...prev, [id]: !isCurrentlyLiked };

      setMessages((msgs) =>
        msgs.map((m) => {
          if (m.id === id) {
            return {
              ...m,
              likes: isCurrentlyLiked ? m.likes - 1 : m.likes + 1,
            };
          }
          return m;
        })
      );
      return updated;
    });
  };

  const handlePostMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newPost: CommunityMessage = {
      id: `cw-${Date.now()}`,
      author: 'Anonymous Survivor',
      district: 'Confidential District, India',
      category: 'Survivor Community',
      message: newMessage.trim(),
      likes: 1,
      timeAgo: 'Just now',
    };

    setMessages([newPost, ...messages]);
    setNewMessage('');
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
  };

  const content = (
    <div className="liquid-glass-panel rounded-3xl w-full flex flex-col overflow-hidden shadow-md border border-white/80 bg-white/85">
      {/* Header */}
      <div className="p-5 border-b border-indigo-100/60 flex items-center justify-between bg-gradient-to-r from-rose-50/70 via-indigo-50/60 to-purple-50/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
              <span>Survivor Hope & Community Wall</span>
              <Sparkles className="w-4 h-4 text-rose-500" />
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              Anonymous messages of courage and solidarity from fellow survivors across India
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Message Feed */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[600px]">
        {showSuccessToast && (
          <div className="p-3.5 pastel-emerald rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Your message of hope was posted anonymously to inspire other survivors.</span>
          </div>
        )}

        {messages.map((item, idx) => {
          const isLiked = likedIds[item.id];
          const pastelBgs = ['pastel-rose', 'pastel-indigo', 'pastel-teal', 'pastel-amber'];
          const cardStyle = pastelBgs[idx % pastelBgs.length];

          return (
            <div
              key={item.id}
              className={`p-4 sm:p-5 rounded-2xl ${cardStyle} shadow-2xs hover:shadow-md transition space-y-3`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/90 shadow-2xs flex items-center justify-center font-extrabold text-slate-800 text-xs">
                    {item.author[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">{item.author}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {item.district} • {item.timeAgo}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold text-indigo-900 bg-white/80 border border-indigo-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                  {item.category}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                "{item.message}"
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-black/5 text-xs">
                <button
                  type="button"
                  onClick={() => handleLike(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition cursor-pointer font-bold text-[11px] ${
                    isLiked
                      ? 'text-rose-700 bg-white border border-rose-300 shadow-2xs'
                      : 'text-slate-700 hover:bg-white/60'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                  <span>{item.likes} Encouragements</span>
                </button>
                <span className="text-[10px] text-slate-500 font-semibold">100% Anonymous & Moderated</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Post Message Input Bar */}
      <div className="p-4 border-t border-indigo-100/60 bg-white/90">
        <form onSubmit={handlePostMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Leave a short, supportive message of hope for other survivors..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
              newMessage.trim()
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white cursor-pointer shadow-md shadow-rose-500/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Post</span>
          </button>
        </form>
      </div>
    </div>
  );

  if (isOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
        <div className="max-w-2xl w-full max-h-[90vh]">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default CommunityWall;
