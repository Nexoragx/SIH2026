import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, Heart, ShieldCheck, PhoneCall, Volume2, VolumeX, Sparkles, Globe } from 'lucide-react';
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
  currentLang: initialLang,
  onTriggerCrisis,
}) => {
  const [currentLang, setCurrentLang] = useState<string>(initialLang || 'en');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [sessionId] = useState<string>(() => `CHAT-${Date.now().toString().slice(-6)}`);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const welcomeMessages: { [key: string]: string } = {
    en: "Namaste. I am ANVAYA Saathi, your caring, confidential companion. How are you feeling today? I am here to listen without judgment.",
    hi: "नमस्ते। मैं अन्वय साथी (ANVAYA Saathi) हूँ, आपका गोपनीय और स्नेही सहायक। आज आपका मन कैसा है? मैं आपकी बात सुनने के लिए यहाँ हूँ।",
    bn: "নমস্কার। আমি অন্বয় সাথী (ANVAYA Saathi), আপনার গোপনীয় এবং সহানুভূতিশীল সাথী। আজ আপনার কেমন লাগছে? আমি আপনার কথা শুনতে পাশে আছি।",
    ta: "வணக்கம். நான் அன்வயா சாதி (ANVAYA Saathi), உங்கள் ரகசிய மற்றும் அக்கறையான துணை. இன்று உங்கள் உணர்வு எப்படி இருக்கிறது? நான் கேட்க தயாராக உள்ளேன்.",
    te: "నమస్కారం. నేను అన్వయ సాథి (ANVAYA Saathi), మీ గోప్యమైన మరియు శ్రద్ధగల సహచరిని. ఈ రోజు మీకు ఎలా అనిపిస్తుంది? నేను వినడానికి ఇక్కడే ఉన్నాను.",
    mr: "नमस्ते. मी अन्वय साथी (ANVAYA Saathi) आहे, आपला काळजीवाहू आणि विश्वासू सोबती. आज आपल्याला कसे वाटत आहे? मी आपले म्हणणे ऐकण्यासाठी येथे आहे.",
  };

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-1',
          sender: 'bot',
          timestamp: 'Just now',
          text: welcomeMessages[currentLang] || welcomeMessages.en,
        },
      ]);
    }
  }, [currentLang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const speakText = (text: string, msgId: string) => {
    if ('speechSynthesis' in window) {
      if (speakingMsgId === msgId) {
        window.speechSynthesis.cancel();
        setSpeakingMsgId(null);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const langMap: { [key: string]: string } = {
        en: 'en-IN',
        hi: 'hi-IN',
        bn: 'bn-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        mr: 'mr-IN',
      };
      utterance.lang = langMap[currentLang] || 'en-IN';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.onstart = () => setSpeakingMsgId(msgId);
      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!isOpen) return null;

  const quickPromptsByLang: { [key: string]: string[] } = {
    en: [
      "I haven't been sleeping well lately",
      "Feeling a little overwhelmed today",
      "Would like to try a calming breath",
      "Just wanted to check in quietly",
    ],
    hi: [
      "मुझे रात में नींद नहीं आ रही है",
      "आज बहुत घबराहट महसूस हो रही है",
      "शांत करने वाला प्राणायाम करना है",
      "बस थोड़ी बात करना चाहता हूँ",
    ],
    bn: [
      "কয়েকদিন ধরে ঘুম হচ্ছে না",
      "আজ খুব অস্থির লাগছে",
      "শ্বাস-প্রশ্বাসের ব্যায়াম করতে চাই",
      "একটু শান্তভাবে কথা বলতে চাই",
    ],
    ta: [
      "சமீபத்தில் தூக்கம் வரவில்லை",
      "இன்று மிகவும் பதற்றமாக இருக்கிறது",
      "சுவாசப் பயிற்சி செய்ய விரும்புகிறேன்",
      "அமைதியாக பேச விரும்புகிறேன்",
    ],
    te: [
      "గత కొన్ని రోజులుగా నిద్ర పట్టడం లేదు",
      "ఈ రోజు చాలా భయంగా అనిపిస్తుంది",
      "శ్వాస వ్యాయామం చేయాలనుకుంటున్నాను",
      "ప్రశాంతంగా మాట్లాడాలనుకుంటున్నాను",
    ],
    mr: [
      "रात्री शांत झोप लागत नाही",
      "आज खूप ताण जाणवत आहे",
      "श्वसनाचा व्यायाम करायचा आहे",
      "शांतपणे बोलायचे आहे",
    ],
  };

  const currentPrompts = quickPromptsByLang[currentLang] || quickPromptsByLang.en;

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
      const res = await supportApi.sendChatMessage(text, sessionId, currentLang);

      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        timestamp: 'Just now',
        text: res.reply,
      };
      setMessages((prev) => [...prev, botMsg]);

      if (res.crisis_flag) {
        setTimeout(() => {
          onTriggerCrisis();
        }, 1200);
      }
    } catch {
      const fallbackReplies: { [key: string]: string } = {
        en: "Thank you for sharing this with me. Take things one moment at a time. Caring support is always available whenever you need it.",
        hi: "मुझसे अपनी बात साझा करने के लिए धन्यवाद। हर कदम पर धैर्य रखें। आपके लिए यहाँ सदैव सहायता उपलब्ध है।",
        bn: "আপনার কথা জানানোর জন্য ধন্যবাদ। ধৈর্য রাখুন, আপনার পাশে সবসময় যত্নশীল সমর্থন রয়েছে।",
        ta: "பகிர்ந்து கொண்டதற்கு நன்றி. நீங்கள் தனியாக இல்லை, உங்களுக்கு உதவ நாங்கள் தயாராக உள்ளோம்.",
        te: "మీ భావాలను పంచుకున్నందుకు ధన్యవాదాలు. మీకు ఎల్లప్పుడూ సరైన సహాయం అందుబాటులో ఉంటుంది.",
        mr: "आपल्या भावना व्यक्त केल्याबद्दल धन्यवाद. आपण एकटे नाही, आम्ही सदैव आपल्या पाठीशी आहोत.",
      };
      const fallbackMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        timestamp: 'Just now',
        text: fallbackReplies[currentLang] || fallbackReplies.en,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="anvaya-card rounded-3xl max-w-lg w-full h-[640px] max-h-[92vh] shadow-2xl border border-slate-200 bg-white flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-indigo-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <span>ANVAYA Saathi</span>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                Empathetic Multilingual AI Companion • 24x7 Support
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher Pill */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1 text-xs">
              <Globe className="w-3 h-3 text-slate-500" />
              <select
                value={currentLang}
                onChange={(e) => setCurrentLang(e.target.value)}
                className="bg-transparent text-[11px] font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="bn">বাংলা</option>
                <option value="ta">தமிழ்</option>
                <option value="te">తెలుగు</option>
                <option value="mr">मराठी</option>
              </select>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-600 hover:text-black transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-slate-50/40">
          <div className="text-center">
            <span className="inline-block text-[10px] font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Trauma-informed supportive companion • 100% confidential
            </span>
          </div>

          {messages.map((msg) => {
            const isUser = msg.sender === 'victim';
            const isSpeaking = speakingMsgId === msg.id;
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-bold">
                    A
                  </div>
                )}

                <div
                  className={`max-w-[82%] p-3.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed relative ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tr-xs'
                      : 'bg-white border border-slate-200 text-slate-900 shadow-2xs rounded-tl-xs'
                  }`}
                >
                  <p className={isUser ? 'text-white' : 'text-slate-900'}>{msg.text}</p>
                  
                  <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-100/30">
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => speakText(msg.text, msg.id)}
                        className={`flex items-center gap-1 text-[10px] font-bold transition ${
                          isSpeaking ? 'text-indigo-600 animate-pulse' : 'text-slate-500 hover:text-indigo-600'
                        }`}
                        title="Listen to response (Text-to-Speech)"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{isSpeaking ? 'Speaking...' : 'Listen'}</span>
                      </button>
                    )}
                    <span
                      className={`text-[9px] font-medium ml-auto ${
                        isUser ? 'text-slate-300' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold pl-9">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
              <span>ANVAYA Saathi is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Strip */}
        <div className="px-4 py-2 border-t border-slate-200 bg-white flex gap-1.5 overflow-x-auto no-scrollbar">
          {currentPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(p)}
              className="flex-shrink-0 text-[11px] font-bold text-slate-800 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 px-3 py-1.5 rounded-xl border border-slate-200 transition cursor-pointer"
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
              placeholder="Share what is on your mind..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition font-medium"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className={`p-2.5 rounded-xl transition ${
                inputMessage.trim()
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer shadow-xs'
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
