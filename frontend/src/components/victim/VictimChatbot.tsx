import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, Heart, ShieldCheck, PhoneCall } from 'lucide-react';
import { ChatMessage, RiskLevel } from '../../types';
import { supportApi } from '../../api';

interface VictimChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: string;
  distressLevel?: RiskLevel;
  onTriggerCrisis: () => void;
}

export const VictimChatbot: React.FC<VictimChatbotProps> = ({
  isOpen,
  onClose,
  currentLang,
  onTriggerCrisis,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [sessionId] = useState<string>(() => `CHAT-${Date.now().toString().slice(-6)}`);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-1',
          sender: 'bot',
          timestamp: 'Just now',
          text: "Hello. I am ANVAYA Support, your confidential companion. How are things feeling for you today? I'm here to listen at your own pace.",
        },
      ]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const quickPrompts = [
    "I haven't been sleeping well lately",
    "Feeling a little overwhelmed today",
    "Would like to try a calming breath",
    "Just wanted to check in quietly",
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'victim',
      timestamp: 'Just now',
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Call backend empathetic chat service with safety detection
      const res = await supportApi.sendChatMessage(text, sessionId, currentLang);

      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        timestamp: 'Just now',
        text: res.reply,
      };
      setMessages((prev) => [...prev, botMsg]);

      // If crisis keywords detected, trigger immediate crisis workflow
      if (res.crisis_flag) {
        setTimeout(() => {
          onTriggerCrisis();
        }, 1200);
      }
    } catch {
      // Fallback gentle offline response
      const fallbackMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        timestamp: 'Just now',
        text: "Thank you for sharing this with me. Take things one moment at a time. Caring support is always available whenever you need it.",
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="anvaya-card rounded-3xl max-w-lg w-full h-[620px] max-h-[92vh] shadow-2xl border border-slate-200 bg-white flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center font-bold">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-black">
                  ANVAYA Support
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                Confidential • Non-clinical companion
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-600 hover:text-black transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-slate-50/40">
          {/* Non-clinical disclaimer pill */}
          <div className="text-center">
            <span className="inline-block text-[11px] font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Support companion • Not a substitute for professional medical care
            </span>
          </div>

          {messages.map((msg) => {
            const isUser = msg.sender === 'victim';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-black text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-bold">
                    A
                  </div>
                )}

                <div
                  className={`max-w-[82%] p-3.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed ${
                    isUser
                      ? 'bg-black text-white rounded-tr-xs'
                      : 'bg-white border border-slate-200 text-black shadow-2xs rounded-tl-xs'
                  }`}
                >
                  <p className={isUser ? 'text-white' : 'text-black'}>{msg.text}</p>
                  <div
                    className={`text-[10px] mt-1 text-right font-medium ${
                      isUser ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold pl-9">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
              <span>Thinking gently...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Strip */}
        <div className="px-4 py-2 border-t border-slate-200 bg-white flex gap-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(p)}
              className="flex-shrink-0 text-[11px] font-bold text-black bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 transition cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your thoughts here..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs sm:text-sm text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition font-medium"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className={`p-2.5 rounded-xl transition ${
                inputMessage.trim()
                  ? 'bg-black text-white hover:bg-slate-800 cursor-pointer shadow-xs'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VictimChatbot;
