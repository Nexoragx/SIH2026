import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, X, Heart, Volume2, ShieldCheck, AlertCircle, Bot, User } from 'lucide-react';
import { ChatMessage, RiskLevel } from '../../types';

interface VictimChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: string;
  distressLevel: RiskLevel;
  onTriggerCrisis: () => void;
}

export const VictimChatbot: React.FC<VictimChatbotProps> = ({
  isOpen,
  onClose,
  currentLang,
  distressLevel,
  onTriggerCrisis,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const initialGreetings: { [key: string]: string } = {
    en: 'Namaste. I am Saathi, your confidential AI well-being companion. How are you feeling right now? I am here to listen and help you feel calm.',
    hi: 'नमस्ते। मैं आपका साथी (Saathi) हूँ। आप अभी कैसा महसूस कर रहे हैं? मैं आपकी बात सुनने और मन को शांत करने के लिए यहाँ हूँ।',
    bn: 'নমস্কার। আমি আপনার সঙ্গী (Saathi)। আপনি এখন কেমন অনুভব করছেন? আপনার মনের কথা শেয়ার করুন, আমি আপনার পাশে আছি।',
    ta: 'வணக்கம். நான் உங்கள் தோழன் சாத்தி (Saathi). நீங்கள் இப்போது எப்படி உணர்கிறீர்கள்? உங்களுடன் பேச நான் தயாராக உள்ளேன்.',
    te: 'నమస్కారం. నేను మీ సాథీ (Saathi). మీరు ఇప్పుడు ఎలా ఉన్నారు? మీ బాధను పంచుకోండి, మేము అండగా ఉంటాము.',
    mr: 'नमस्ते. मी आपला साथी (Saathi) आहे. आपल्याला सध्या कसे वाटते आहे? मी आपल्याला आधार देण्यासाठी सोबत आहे.',
  };

  useEffect(() => {
    if (messages.length === 0) {
      const greeting = initialGreetings[currentLang] || initialGreetings.en;
      setMessages([
        {
          id: 'welcome-1',
          sender: 'bot',
          timestamp: 'Just now',
          text: greeting,
        },
      ]);
    }
  }, [currentLang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const quickPrompts: { [key: string]: string[] } = {
    en: [
      'I am having trouble sleeping',
      'I feel scared and tense',
      'Can you guide me through breathing?',
      'How do I get legal relief aid?',
    ],
    hi: [
      'मुझे नींद नहीं आ रही है',
      'मुझे बहुत घबराहट और डर लग रहा है',
      'मुझे शांत सांस लेने का तरीका बताएं',
      'मुआवजा और कानूनी सहायता कैसे मिलेगी?',
    ],
    bn: [
      'আমার ঘুম হচ্ছে না',
      'আমার খুব ভয় লাগছে',
      'শান্ত হওয়ার শ্বাসক্রিয়া শেখান',
      'আইনি সাহায্য কীভাবে পাব?',
    ],
    ta: [
      'எனக்கு தூக்கம் வரவில்லை',
      'எனக்கு மிகவும் பயமாக உள்ளது',
      'சுவாசப் பயிற்சி செய்ய உதவுங்கள்',
    ],
    te: [
      'నాకు నిద్ర పట్టడం లేదు',
      'చాలా ఆందోళనగా ఉంది',
      'శ్వాస వ్యాయామం చూపించండి',
    ],
    mr: [
      'मला झोप येत नाहीये',
      'मला खूप भीती वाटते आहे',
      'श्वासाचा व्यायाम कसा करावा?',
    ],
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
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
      window.speechSynthesis.speak(utterance);
    }
  };

  const generateEmpatheticResponse = (userInput: string): string => {
    const textLower = userInput.toLowerCase();

    // Crisis keywords detection
    const crisisKeywords = ['suicide', 'die', 'end life', 'kill myself', 'give up', 'मरना', 'जान देना', 'সব শেষ', 'தற்கொலை', 'చనిపోవాలని'];
    if (crisisKeywords.some((w) => textLower.includes(w))) {
      setTimeout(() => onTriggerCrisis(), 1000);
      return currentLang === 'hi'
        ? 'कृपया धैर्य रखें। आप अकेले नहीं हैं — हमारी आपातकालीन टीम आपसे तुरंत संपर्क कर रही है।'
        : 'Please stay with me. You are not alone and help is reaching you right now.';
    }

    if (textLower.includes('sleep') || textLower.includes('नींद') || textLower.includes('ঘুম')) {
      return currentLang === 'hi'
        ? 'नींद न आना आघात के बाद बहुत स्वाभाविक है। आइए 4-7-8 श्वास व्यायाम करें या मंदिर की घंटियों का शांत संगीत सुनें।'
        : 'Difficulty sleeping is a very natural reaction to stressful events. Trying our 4-7-8 breathing pacer or relaxing soundscape can help release body tension.';
    }

    if (textLower.includes('fear') || textLower.includes('scared') || textLower.includes('डर') || textLower.includes('ভয়') || textLower.includes('பயம்')) {
      return currentLang === 'hi'
        ? 'मैं आपकी भावना को समझता हूँ। आपका डर पूरी तरह स्वाभाविक है। हम आपके साथ हैं और जिला सुरक्षा टीम को आपकी स्थिति ज्ञात है।'
        : 'Your feeling of fear is completely valid after everything you have been through. Please know you are safe here and our district protection unit is active.';
    }

    if (textLower.includes('legal') || textLower.includes('compensation') || textLower.includes('मुआवजा') || textLower.includes('আইন')) {
      return currentLang === 'hi'
        ? 'अत्याचार निवारण अधिनियम के तहत आपके कानूनी अधिकार और अंतरिम राहत मुआवजा सुनिश्चित है। आप 14566 पर भी सीधे परामर्श ले सकते हैं।'
        : 'Under the SC/ST Prevention of Atrocities Act, statutory relief compensation and legal protection are your rights. You can also dial 14566 toll-free.';
    }

    return currentLang === 'hi'
      ? 'आपकी बात बहुत महत्वपूर्ण है। मैं आपके साथ हर कदम पर हूँ। आप विश्राम के लिए हमारे शांत अभ्यासों का उपयोग कर सकते हैं।'
      : 'Thank you for sharing this with me. Taking one breath at a time is enough right now. Would you like to try a calming grounding exercise?';
  };

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'victim',
      timestamp: 'Just now',
      text: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = generateEmpatheticResponse(text);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        timestamp: 'Just now',
        text: reply,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn">
      <div className="liquid-glass-panel rounded-t-3xl sm:rounded-3xl max-w-lg w-full h-[85vh] sm:h-[620px] flex flex-col shadow-2xl relative overflow-hidden bg-white">
        {/* Chatbot Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/90 flex items-center justify-between bg-gradient-to-r from-indigo-50/90 to-purple-50/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/25">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-extrabold text-slate-900">ANVAYA Saathi (साथी)</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Compassionate Multilingual Mental Health Companion
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-50/40">
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
                    ? 'bg-indigo-600 text-white rounded-br-xs shadow-xs'
                    : 'liquid-tile text-slate-800 rounded-bl-xs shadow-xs bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span>{m.text}</span>
                  {m.sender === 'bot' && (
                    <button
                      type="button"
                      onClick={() => speakText(m.text)}
                      className="text-slate-400 hover:text-indigo-600 p-1 rounded transition flex-shrink-0"
                      title="Listen"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <span className="text-[9px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 w-24">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]"></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggested Prompts */}
        <div className="p-2 border-t border-slate-200/80 bg-white overflow-x-auto no-scrollbar flex gap-1.5">
          {(quickPrompts[currentLang] || quickPrompts.en).map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(prompt)}
              className="px-3 py-1.5 rounded-xl bg-indigo-50/80 hover:bg-indigo-100 text-indigo-800 text-[11px] font-bold border border-indigo-200/60 whitespace-nowrap transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 sm:p-4 border-t border-slate-200/80 bg-white flex gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message in your language..."
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/30 bg-slate-50/50"
          />
          <button
            type="submit"
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-extrabold shadow-md shadow-indigo-600/25 transition flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
