import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, MessageCircle, Send, ShieldCheck, UserCheck, X, RefreshCw, User, ShieldAlert } from 'lucide-react';
import { supportApi, HopeWallPost } from '../../api/supportApi';

interface CommunityWallProps {
  isOpen?: boolean;
  onClose?: () => void;
  currentLang?: string;
  currentUser?: { name?: string; username?: string; role?: string } | null;
}

export const CommunityWall: React.FC<CommunityWallProps> = ({
  isOpen,
  onClose,
  currentLang = 'en',
  currentUser,
}) => {
  const [messages, setMessages] = useState<HopeWallPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newMessage, setNewMessage] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>(currentUser?.name || currentUser?.username || '');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [likedIds, setLikedIds] = useState<{ [key: string]: boolean }>({});
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await supportApi.getHopeWallPosts();
      if (res && res.posts) {
        setMessages(res.posts);
      }
    } catch (err) {
      console.error('Failed to load hope wall posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (currentUser?.name || currentUser?.username) {
      setAuthorName(currentUser.name || currentUser.username || '');
    }
  }, [currentUser]);

  if (isOpen === false) return null;

  const handleLike = async (id: string) => {
    // Optimistic UI update
    setLikedIds((prev) => ({ ...prev, [id]: !prev[id] }));
    setMessages((msgs) =>
      msgs.map((m) => {
        if (m.id === id) {
          const currentlyLiked = likedIds[id];
          return {
            ...m,
            likes: currentlyLiked ? Math.max(0, m.likes - 1) : m.likes + 1,
          };
        }
        return m;
      })
    );

    try {
      const res = await supportApi.likeHopeWallPost(id);
      if (res && res.likes !== undefined) {
        setMessages((msgs) =>
          msgs.map((m) => (m.id === id ? { ...m, likes: res.likes } : m))
        );
      }
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handlePostMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || submitting) return;

    const chosenAuthor = isAnonymous
      ? 'Anonymous Survivor'
      : authorName.trim() || currentUser?.name || currentUser?.username || 'Community Member';

    setSubmitting(true);
    try {
      const res = await supportApi.createHopeWallPost({
        message: newMessage.trim(),
        author: chosenAuthor,
        district: 'Survivor Community, India',
        category: 'Survivor of Violence',
      });

      if (res && res.post) {
        setMessages((prev) => [res.post, ...prev]);
        setNewMessage('');
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 4500);
      }
    } catch (err) {
      console.error('Failed to post message:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Recently';
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
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
              Real-time messages of courage and solidarity from survivors across India
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchPosts}
            title="Refresh feed"
            className="p-2 rounded-xl bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200 transition cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
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
      </div>

      {/* Message Feed */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[500px]">
        {showSuccessToast && (
          <div className="p-3.5 pastel-emerald rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Your message of hope was posted to the real-time community wall.</span>
          </div>
        )}

        {loading && messages.length === 0 ? (
          <div className="space-y-4 py-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full skeleton-box animate-shimmer" />
                    <div className="space-y-1.5">
                      <div className="w-24 h-3.5 rounded-md skeleton-box animate-shimmer" />
                      <div className="w-32 h-2.5 rounded-md skeleton-box animate-shimmer" />
                    </div>
                  </div>
                  <div className="w-20 h-5 rounded-full skeleton-box animate-shimmer" />
                </div>
                <div className="w-full h-4 rounded-md skeleton-box animate-shimmer" />
                <div className="w-3/4 h-4 rounded-md skeleton-box animate-shimmer" />
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="w-28 h-6 rounded-xl skeleton-box animate-shimmer" />
                  <div className="w-20 h-3 rounded-md skeleton-box animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Heart className="w-8 h-8 mx-auto text-rose-300 mb-2 animate-heart-pulse" />
            <p className="text-xs font-bold">Be the first to share an encouraging thought today.</p>
          </div>
        ) : (
          messages.map((item, idx) => {
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
                      {item.author ? item.author[0].toUpperCase() : 'S'}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{item.author}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {item.district} • {formatTime(item.created_at)}
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
                  <span className="text-[10px] text-slate-500 font-semibold">Real-time Verified Wall</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Post Message Input Bar with Author Selector */}
      <div className="p-4 border-t border-indigo-100/60 bg-white/95 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between text-xs px-1 gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-600">Posting as:</span>
            {isAnonymous ? (
              <span className="text-[11px] font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                Anonymous Survivor
              </span>
            ) : (
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Your Name (e.g. Priya S.)"
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[150px] sm:max-w-[180px]"
              />
            )}
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] font-bold text-slate-600 hover:text-slate-900">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <span>Post Anonymously</span>
          </label>
        </div>

        <form onSubmit={handlePostMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write a supportive thought, quote or encouragement for others..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || submitting}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
              newMessage.trim() && !submitting
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white cursor-pointer shadow-md shadow-rose-500/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Posting...' : 'Post'}</span>
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
