import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, Volume2, Sparkles, Globe, ArrowRight, Wind } from 'lucide-react';
import { ChatMessage, RiskLevel } from '../../types';
import { supportApi } from '../../api';

interface VictimChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: string;
  distressLevel?: RiskLevel;
  onTriggerCrisis: () => void;
  onNavigateToExercises?: (exerciseType?: string) => void;
  isCrisisAutoTriggered?: boolean;
}

// Dynamic Client-side Emotional Guidance & Motivational Engine
function generateDynamicGuidance(
  query: string,
  lang: string
): {
  text: string;
  exerciseSuggestion?: {
    type: 'breathing' | 'grounding' | 'journal' | 'sounds' | 'muscle' | 'emdr';
    title: string;
    description: string;
    buttonLabel: string;
  };
} {
  const q = query.toLowerCase();
  const l = ['hi', 'bn', 'ta', 'te', 'mr'].includes(lang) ? lang : 'en';

  // 1. Motivation / Strength / Overcoming difficulty
  if (
    q.includes('motivat') ||
    q.includes('strength') ||
    q.includes('hopeless') ||
    q.includes('give up') ||
    q.includes("can't do") ||
    q.includes('cant do') ||
    q.includes('why live') ||
    q.includes('hard') ||
    q.includes('हौसला') ||
    q.includes('हिम्मत') ||
    q.includes('প্রেরণা') ||
    q.includes('நம்பிக்கை') ||
    q.includes('ధైర్యం')
  ) {
    const replies: Record<string, string[]> = {
      en: [
        "You are far stronger than what tried to break you. 'The oak fought the wind and was broken; the willow bent when it must and survived.' What happened does not define your worth. Reclaiming your peace is your birthright.",
        "You have survived 100% of your hardest days so far. 'Stars can't shine without darkness.' Healing is not linear—take pride in your courage to keep taking gentle steps forward. I am right beside you.",
        "Every storm eventually runs out of rain. 'You don't have to see the whole staircase, just take the first step.' Believe in your inner resilience. Let us center your breath and steady your strength.",
      ],
      hi: [
        "आप उस दर्द से कहीं अधिक शक्तिशाली हैं जिसने आपको तोड़ने की कोशिश की। 'तूफानों से लड़कर ही नौका पार होती है, और हिम्मत करने वालों की कभी हार नहीं होती।' अपना हौसला बनाए रखें, मैं सदैव आपके साथ हूँ।",
        "हर काली रात के बाद एक सुनहरा सवेरा अवश्य आता है। 'पूरी सीढ़ी एक साथ नहीं देखनी, बस एक कदम आगे बढ़ाना है।' आपने हर मुश्किल दिन का डटकर मुकाबला किया है। खुद पर विश्वास रखें।",
      ],
      bn: [
        "আপনি আপনার কষ্টের চেয়ে অনেক বেশি শক্তিশালী। 'কঠিন সময় চিরকাল থাকে না, কিন্তু সাহসী মানুষ চিরকাল টিকে থাকে।' আপনি এখনো লড়াই চালিয়ে যাচ্ছেন, এটাই আপনার সবচেয়ে বড় সাহস।",
      ],
      ta: [
        "நீங்கள் நினைப்பதை விட மிகவும் வலிமையானவர். 'புயலுக்குப் பின் நிச்சயம் அமைதி உண்டு.' உங்கள் அமைதியை மீட்டெடுப்பது உங்கள் உரிமை. நான் உங்களுக்குத் துணையாக நிற்கிறேன்.",
      ],
      te: [
        "మిమ్మల్ని బాధపెట్టిన సంఘటనల కంటే మీరు చాలా శక్తివంతులు. 'చీకటి ఎంత గాఢంగా ఉంటే వెలుగు అంత ప్రకాశవంతంగా ఉంటుంది.' విజయం మీదే.",
      ],
      mr: [
        "आपण संकटांपेक्षा कितीतरी पटीने कणखर आहात. 'संकटे माणसाला घडवण्यासाठी येतात, संपवण्यासाठी नाही.' स्वतःवरील विश्वास ढळू देऊ नका. मी सोबत आहे.",
      ],
    };
    const list = replies[l] || replies.en;
    const idx = Math.abs(hashString(query)) % list.length;
    return {
      text: list[idx],
    };
  }

  // 2. Severe Panic / Acute Hyperventilation (Specific exercise recommendation)
  if (
    q.includes('panic attack') ||
    q.includes("can't breathe") ||
    q.includes('cant breathe') ||
    q.includes('hyperventilat') ||
    q.includes('head spinning') ||
    q.includes('घबराहट का दौरा')
  ) {
    const replies: Record<string, string[]> = {
      en: [
        "I hear the intense anxiety right now. Let's anchor your nervous system immediately. Look around your room and find 5 things you can see.",
      ],
      hi: [
        "घबराहट के इस पल में अपनी दोनों हथेलियों को महसूस करें। आइए 5-4-3-2-1 ग्राउंडिंग तकनीक से मन को शांत करें।",
      ],
    };
    const list = replies[l] || replies.en;
    const idx = Math.abs(hashString(query)) % list.length;
    return {
      text: list[idx],
      exerciseSuggestion: {
        type: 'grounding',
        title: '5-4-3-2-1 Sensory Grounding',
        description: 'Anchor your nervous system using your 5 senses to immediately interrupt panic spirals.',
        buttonLabel: 'Start 5-4-3-2-1 Grounding',
      },
    };
  }

  // 3. Sleep / Insomnia / Nightmares
  if (
    q.includes('sleep sound') ||
    q.includes('insomnia') ||
    q.includes('nightmare') ||
    q.includes('नींद नहीं आ रही') ||
    q.includes('ঘুম হচ্ছে না')
  ) {
    const replies: Record<string, string[]> = {
      en: [
        "Restless nights can make the world feel so heavy. 'Sleep is the best meditation.' Let go of the day's burden; whatever is unresolved will wait until sunrise. Allow your mind and body to rest now.",
      ],
      hi: [
        "अनिद्रा से मन और शरीर दोनों थक जाते हैं। आज की सारी चिंताओं को यहीं छोड़ दीजिए और शांति से सोइए।",
      ],
    };
    const list = replies[l] || replies.en;
    const idx = Math.abs(hashString(query)) % list.length;
    return {
      text: list[idx],
      exerciseSuggestion: {
        type: 'sounds',
        title: 'Calming Nature Soundscapes',
        description: 'Gentle acoustic frequencies, rainfall, and ocean waves to soothe your mind into restorative sleep.',
        buttonLabel: 'Play Calming Soundscapes',
      },
    };
  }

  // 4. Anger / Injustice (Explicit Journaling request)
  if (
    q.includes('write journal') ||
    q.includes('worry journal') ||
    q.includes('dissolving journal') ||
    q.includes('vent thoughts')
  ) {
    return {
      text: "Pour out your anger, hurt, and unspoken words into a private sanctuary that dissolves them safely.",
      exerciseSuggestion: {
        type: 'journal',
        title: 'Dissolving Worry & Trauma Journal',
        description: 'Pour out your anger, hurt, and unspoken words into a private sanctuary that dissolves them safely.',
        buttonLabel: 'Open Worry Journal',
      },
    };
  }

  // 5. Physical tension / Stiff muscles / Pain
  if (
    q.includes('muscle relaxation') ||
    q.includes('stiff shoulders') ||
    q.includes('clenched jaw') ||
    q.includes('body tense')
  ) {
    return {
      text: "Trauma and emotional distress often store themselves directly in our physical muscles. Let's consciously release that physical weight together.",
      exerciseSuggestion: {
        type: 'muscle',
        title: 'Progressive Muscle Relaxation',
        description: 'Somatic progressive relaxation to systematically melt tension stored in your shoulders, neck, and chest.',
        buttonLabel: 'Start Muscle Relaxation',
      },
    };
  }

  // 6. Direct Exercise / Calming Activity Request
  if (
    q.includes('exercise') ||
    q.includes('activit') ||
    q.includes('meditat') ||
    q.includes('breathing exercise') ||
    q.includes('start breathing') ||
    q.includes('calm me') ||
    q.includes('guide me') ||
    q.includes('कसरत') ||
    q.includes('व्यायाम')
  ) {
    return {
      text: "I have prepared our complete Therapeutic Healing Suite for you: 4-7-8 Pranayama Breathwork, 5-4-3-2-1 Somatic Grounding, Dissolving Worry Journal, and Calming Nature Soundscapes. Click below to begin right away.",
      exerciseSuggestion: {
        type: 'breathing',
        title: '4-7-8 Pranayama Breathwork',
        description: 'Scientifically calibrated breath pacer to trigger your parasympathetic nervous system and restore inner balance.',
        buttonLabel: 'Start Calming Exercise',
      },
    };
  }

  // 7. General Compassionate & Motivating Response (No exercise attachment by default!)
  const generalReplies: Record<string, string[]> = {
    en: [
      "I hear how heavy things feel right now, and I want you to know you don't have to carry this alone. 'Even the darkest night will pass and the sun will rise.' Take a slow, gentle breath—I am right here with you.",
      "Thank you for sharing your heart with me. 'Peace comes from within, one breath at a time.' Whatever you are facing, please be kind to yourself today. You are stronger and more cherished than you know.",
      "You are not alone on this path. 'Courage doesn’t always roar; sometimes courage is the quiet voice at the end of the day saying, I will try again tomorrow.' Let's take things one quiet step at a time.",
      "Take a gentle pause and let the tension in your shoulders melt away. You have survived every hard day so far, and you have the strength to heal. How can I best guide and support you in this moment?",
    ],
    hi: [
      "मैं समझ सकता हूँ कि इस समय आपका मन कितना भारी है। 'हर काली रात के बाद एक नया सवेरा आता है।' गहरी सांस लें, मैं सदैव आपके साथ हूँ।",
      "अपनी बात मुझसे साझा करने के लिए धन्यवाद। 'शांति हमारे भीतर ही है।' आज अपने आप पर दयालु रहें। आप बहुत मजबूत हैं।",
      "आप इस सफर में अकेले नहीं हैं। 'मुसीबतों के बीच ही इंसान की असली शक्ति निखरती है।' एक-एक कदम करके आगे बढ़ें।",
    ],
    bn: [
      "আমি বুঝতে পারছি আপনার মন কতটা ভারী। 'অন্ধকারের পরই নতুন ভোর আসে।' শান্তভাবে শ্বাস নিন, আমি আপনার পাশে আছি।",
      "আপনার কথা শেয়ার করার জন্য ধন্যবাদ। নিজেকে একটু সময় দিন, আপনি অনেক শক্তিশালী।",
    ],
    ta: [
      "உங்கள் மனபாரத்தை நான் உணர்கிறேன். 'ஒவ்வொரு கடினமான நேரமும் கடந்து போகும்.' நீங்கள் தனியாக இல்லை, நான் உங்களுடன் இருக்கிறேன்.",
    ],
    te: [
      "మీ బాధను నేను అర్థం చేసుకోగలను. 'చీకటి తర్వాతే వెలుగు వస్తుంది.' ప్రశాంతంగా శ్వాస తీసుకోండి, నేను మీతోనే ఉన్నాను.",
    ],
    mr: [
      "आपल्या मनातील अस्वस्थता मी समजू शकतो. 'कठीण प्रसंग कायम टिकत नाहीत, पण कणखर माणसे टिकून राहतात.' मी सोबत आहे.",
    ],
  };

  const list = generalReplies[l] || generalReplies.en;
  const idx = Math.abs(hashString(query)) % list.length;
  return {
    text: list[idx],
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export const VictimChatbot: React.FC<VictimChatbotProps> = ({
  isOpen,
  onClose,
  currentLang: initialLang,
  onTriggerCrisis,
  onNavigateToExercises,
  isCrisisAutoTriggered,
}) => {
  const [currentLang, setCurrentLang] = useState<string>(initialLang || 'en');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [sessionId] = useState<string>(() => `CHAT-${Date.now().toString().slice(-6)}`);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const welcomeMessages: { [key: string]: string } = {
    en: "Namaste. I am ANVAYA Saathi, your caring, confidential companion. How are you feeling today? I am here to listen without judgment, motivate your spirit, and support you at every step.",
    hi: "नमस्ते। मैं अन्वय साथी (ANVAYA Saathi) हूँ, आपका गोपनीय और स्नेही सहायक। आज आपका मन कैसा है? मैं आपकी बात सुनने और हौसला बढ़ाने के लिए सदैव यहाँ हूँ।",
    bn: "নমস্কার। আমি অন্বয় সাথী (ANVAYA Saathi), আপনার গোপনীয় এবং সহানুভূতিশীল সাথী। আজ আপনার কেমন লাগছে? আমি আপনার পাশে আছি এবং আপনাকে সাহায্য করতে প্রস্তুত।",
    ta: "வணக்கம். நான் அன்வயா சாதி (ANVAYA Saathi), உங்கள் ரகசிய மற்றும் அக்கறையான துணை. இன்று உங்கள் உணர்வு எப்படி இருக்கிறது? நான் உங்களுக்கு உதவ எப்போதும் தயாராக உள்ளேன்.",
    te: "నమస్కారం. నేను అన్వయ సాథి (ANVAYA Saathi), మీ గోప్యమైన మరియు శ్రద్ధగల సహచరిని. ఈ రోజు మీకు ఎలా అనిపిస్తుంది? నేను వినడానికి, ధైర్యం చెప్పడానికి సిద్ధంగా ఉన్నాను.",
    mr: "नमस्ते. मी अन्वय साथी (ANVAYA Saathi) आहे, आपला काळजीवाहू आणि विश्वासू सोबती. आज आपल्याला कसे वाटत आहे? मी धीर देण्यासाठी येथे आहे.",
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

  // Handle Crisis Auto-Initiate with Motivational Quotes, Doctor Booking Confirmation & Admin Alert
  useEffect(() => {
    if (isOpen && isCrisisAutoTriggered) {
      const crisisMotivationalQuotes: Record<string, string> = {
        en: "✨ \"You are far stronger than what tried to break you. The darkest nights produce the brightest stars.\"\n\nI am right beside you. Take a slow, grounding breath. You are in a safe space, you are heard, and you do not have to carry this storm alone.\n\n📅 1-on-1 Consultation Automatically Reserved: Dr. Anita Joshi (District Nodal Health Cell)\n🛡️ Care Administration & Crisis Support Team Notified in Real-Time (Priority P0)",
        hi: "✨ \"आप उस दर्द से कहीं अधिक शक्तिशाली हैं जिसने आपको तोड़ने की कोशिश की। तूफानों से लड़कर ही नौका पार होती है।\"\n\nमैं सदैव आपके साथ हूँ। एक गहरी और शांत सांस लें। आप सुरक्षित हैं, और आपको इस मुश्किल का सामना अकेले नहीं करना है।\n\n📅 1:1 डॉक्टर परामर्श सुरक्षित: डॉ. अनीता जोशी (जिला नोडल सेल)\n🛡️ एडमिन व संकट प्रबंधन टीम को सूचित किया गया (प्राथमिकता P0)",
        bn: "✨ \"আপনি আপনার কষ্টের চেয়ে অনেক বেশি শক্তিশালী। কঠিন সময় চিরকাল থাকে না, কিন্তু সাহসী মানুষ চিরকাল টিকে থাকে।\"\n\nআমি আপনার পাশেই আছি। একটি শান্ত ও গভীর শ্বাস নিন। আপনি সম্পূর্ণ নিরাপদ।\n\n📅 ১:১ ডাক্তার পরামর্শ বুক করা হয়েছে: ডঃ অনিতা জোশী (জেলা নোডাল সেল)\n🛡️ অ্যাডমিন ও ক্রাইসিস কেয়ার সেলকে অবিলম্বে অবহিত করা হয়েছে (Priority P0)",
        ta: "✨ \"நீங்கள் நினைப்பதை விட மிகவும் வலிமையானவர். புயலுக்குப் பின் நிச்சயம் அமைதி உண்டு.\"\n\nநான் உங்களுடன் இருக்கிறேன். அமைதியாக ஒரு முறை மூச்சை இழுத்து விடுங்கள். நீங்கள் பாதுகாப்பாக இருக்கிறீர்கள்.\n\n📅 1:1 அவசர மருத்துவ ஆலோசனை பதிவு செய்யப்பட்டது: டாக்டர் அனிதா ஜோஷி\n🛡️ நிர்வாக அவசரக் குழுவிற்கு தகவல் தெரிவிக்கப்பட்டுள்ளது (Priority P0)",
        te: "✨ \"మిమ్మల్ని బాధపెట్టిన సంఘటనల కంటే మీరు చాలా శక్తివంతులు. చీకటి ఎంత గాఢంగా ఉంటే వెలుగు అంత ప్రకాశవంతంగా ఉంటుంది.\"\n\nనేను మీకు తోడుగా ఉన్నాను. ప్రశాంతంగా ఊపిరి తీసుకోండి.\n\n📅 1:1 అత్యవసర సంప్రదింపులు బుక్ చేయబడ్డాయి: డాక్టర్ అనితా జోషి\n🛡️ అడ్మిన్ కేర్ టీమ్‌కు సమాచారం అందించబడింది (Priority P0)",
        mr: "✨ \"आपण संकटांपेक्षा कितीतरी पटीने कणखर आहात. संकटे माणसाला घडवण्यासाठी येतात, संपवण्यासाठी नाही.\"\n\nमी सदैव आपल्या सोबत आहे. शांतपणे एक दीर्घ श्वास घ्या. आपण सुरक्षित आहात.\n\n📅 1:1 डॉक्टर भेट निश्चित: डॉ. अनिता जोशी (जिल्हा नोडल सेल)\n🛡️ ॲडमिन व क्रायसिस टीमला सूचित करण्यात आले आहे (Priority P0)",
      };

      const crisisText = crisisMotivationalQuotes[currentLang] || crisisMotivationalQuotes.en;

      // Add crisis auto-message
      setMessages((prev) => {
        // Prevent duplicate crisis auto message
        if (prev.some((m) => m.id.startsWith('crisis-auto-'))) return prev;
        return [
          ...prev,
          {
            id: `crisis-auto-${Date.now()}`,
            sender: 'bot',
            timestamp: 'Just now',
            text: crisisText,
            exerciseSuggestion: {
              type: 'breathing',
              title: '4-7-8 Deep Grounding Breathwork',
              description: 'Let us take 4 slow breaths together to soothe your heartbeat and nervous system.',
              buttonLabel: 'Start Grounding Breathwork',
            },
          },
        ];
      });
    }
  }, [isOpen, isCrisisAutoTriggered, currentLang]);

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
      "I need motivation to keep going",
      "I feel overwhelmed and anxious",
      "Can't sleep well tonight",
      "Show me calming exercises",
    ],
    hi: [
      "मुझे आगे बढ़ने की हिम्मत चाहिए",
      "आज बहुत घबराहट महसूस हो रही है",
      "रात में नींद नहीं आ रही है",
      "मुझे शांत करने वाली एक्सरसाइज कराएं",
    ],
    bn: [
      "লড়াই চালিয়ে যাওয়ার অনুপ্রেরণা চাই",
      "আজ খুব অস্থির ও ভয় লাগছে",
      "কয়েকদিন ধরে ঘুম হচ্ছে না",
      "শান্তিদায়ক ব্যায়াম শুরু করুন",
    ],
    ta: [
      "எனக்கு தன்னம்பிக்கை மற்றும் தைரியம் தேவை",
      "இன்று மிகவும் பதற்றமாக இருக்கிறது",
      "சமீபத்தில் தூக்கம் வரவில்லை",
      "சுவாசப் பயிற்சிகளைத் தொடங்குங்கள்",
    ],
    te: [
      "నాకు ధైర్యం మరియు ప్రేరణ కావాలి",
      "ఈ రోజు చాలా భయంగా అనిపిస్తుంది",
      "గత కొన్ని రోజులుగా నిద్ర పట్టడం లేదు",
      "ప్రశాంతమైన వ్యాయామాలను చూపించండి",
    ],
    mr: [
      "मला पुढे जाण्यासाठी प्रेरणा हवी आहे",
      "आज खूप ताण आणि भीती वाटत आहे",
      "रात्री शांत झोप लागत नाही",
      "शांततेचे व्यायाम सुरू करा",
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

    // Crisis keyword quick check on client (<5ms)
    const lowerText = text.toLowerCase();
    const isCrisis =
      lowerText.includes('suicide') ||
      lowerText.includes('kill myself') ||
      lowerText.includes('want to die') ||
      lowerText.includes('mar jaunga') ||
      lowerText.includes('khatam karna') ||
      lowerText.includes('आत्महत्या');

    if (isCrisis) {
      const crisisReply: Record<string, string> = {
        en: "I hear your pain and I care about your life and safety deeply. You are not alone, and immediate compassionate help is here for you right now. Please connect with the 24/7 Tele-MANAS helpline (14416) or NHAA Helpline (14566) immediately.",
        hi: "मैं आपकी पीड़ा को समझता हूँ और आपकी सुरक्षा मेरे लिए अत्यंत महत्वपूर्ण है। आप अकेले नहीं हैं। कृपया तुरंत टेली-मानस हेल्पलाइन (14416) या 14566 पर संपर्क करें।",
        bn: "আপনার কষ্ট আমি বুঝতে পারছি এবং আপনার সুরক্ষা আমাদের কাছে সবচেয়ে গুরুত্বপূর্ণ। অনুগ্রহ করে এখনই ২৪/৭ টেলি-মানস (১৪৪১৬) বা ১৪৫৬৬ নম্বরে যোগাযোগ করুন।",
        ta: "உங்கள் வலியை நான் உணர்கிறேன். உங்கள் பாதுகாப்பு மிகவும் முக்கியமானது. தயவுசெய்து உடனடியாக டெலி-மானாஸ் (14416) அல்லது 14566 எண்ணை அழைக்கவும்.",
        te: "మీ బాధను నేను అర్థం చేసుకోగలను. దయచేసి వెంటనే టెలి-మానస్ (14416) లేదా 14566 కి కాల్ చేయండి. మేము మీకు తోడుగా ఉన్నాము.",
        mr: "मी आपल्या वेदना समजू शकतो. आपली सुरक्षितता सर्वात महत्त्वाची आहे. कृपया त्वरित 14416 किंवा 14566 या क्रमांकावर संपर्क साधा.",
      };
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          timestamp: 'Just now',
          text: crisisReply[currentLang] || crisisReply.en,
        },
      ]);
      setTimeout(() => onTriggerCrisis(), 800);
      supportApi.sendChatMessage(text, sessionId, currentLang).catch(() => {});
      return;
    }

    // Interactive response with dynamic guidance fallback
    setIsTyping(true);
    try {
      // 2.2s timeout race to guarantee fast, non-blocking interaction
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 2200)
      );

      const apiPromise = supportApi.sendChatMessage(text, sessionId, currentLang);
      const res = await Promise.race([apiPromise, timeoutPromise]);

      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        timestamp: 'Just now',
        text: res.reply,
        exerciseSuggestion: res.exercise_suggestion
          ? {
              type: res.exercise_suggestion.type as any,
              title: res.exercise_suggestion.title,
              description: res.exercise_suggestion.description,
              buttonLabel: res.exercise_suggestion.buttonLabel || res.exercise_suggestion.button_label || 'Start Exercise',
            }
          : undefined,
      };

      setMessages((prev) => [...prev, botMsg]);

      if (res.crisis_flag) {
        setTimeout(() => {
          onTriggerCrisis();
        }, 1000);
      }
    } catch {
      // Dynamic motivational, trauma-informed guidance fallback tailored to user query
      const dynamicResult = generateDynamicGuidance(text, currentLang);
      const fallbackMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        timestamp: 'Just now',
        text: dynamicResult.text,
        exerciseSuggestion: dynamicResult.exerciseSuggestion,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="anvaya-card rounded-3xl max-w-lg w-full h-[660px] max-h-[94vh] shadow-2xl border border-slate-200 bg-white flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 via-indigo-50/40 to-teal-50/40">
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
                Compassionate Multilingual Companion • Instant Guidance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Exercises Link Button */}
            {onNavigateToExercises && (
              <button
                type="button"
                onClick={() => {
                  onNavigateToExercises();
                  onClose();
                }}
                className="hidden sm:flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer"
                title="Go to Therapeutic Exercises"
              >
                <Wind className="w-3.5 h-3.5 text-teal-600" />
                <span>Exercises</span>
              </button>
            )}

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

        {/* Quick Exercise Launcher Bar */}
        {onNavigateToExercises && (
          <div className="px-3 py-1.5 bg-slate-100/70 border-b border-slate-200/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider pl-1 flex-shrink-0">
              Start Exercise:
            </span>
            <button
              type="button"
              onClick={() => {
                onNavigateToExercises('breathing');
                onClose();
              }}
              className="flex-shrink-0 text-[11px] font-bold text-indigo-700 bg-white hover:bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200 shadow-2xs transition cursor-pointer"
            >
              🌬️ 4-7-8 Breath
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigateToExercises('grounding');
                onClose();
              }}
              className="flex-shrink-0 text-[11px] font-bold text-teal-700 bg-white hover:bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200 shadow-2xs transition cursor-pointer"
            >
              🧘 5-4-3-2-1 Grounding
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigateToExercises('journal');
                onClose();
              }}
              className="flex-shrink-0 text-[11px] font-bold text-amber-700 bg-white hover:bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200 shadow-2xs transition cursor-pointer"
            >
              📝 Worry Journal
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigateToExercises('sounds');
                onClose();
              }}
              className="flex-shrink-0 text-[11px] font-bold text-blue-700 bg-white hover:bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200 shadow-2xs transition cursor-pointer"
            >
              🎧 Soundscapes
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigateToExercises('muscle');
                onClose();
              }}
              className="flex-shrink-0 text-[11px] font-bold text-purple-700 bg-white hover:bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200 shadow-2xs transition cursor-pointer"
            >
              💪 Muscle Relax
            </button>
          </div>
        )}

        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-slate-50/40">
          <div className="text-center">
            <span className="inline-block text-[10px] font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Confidential trauma-informed companion • Fast response & dynamic guidance
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
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-bold shadow-xs">
                    A
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed relative ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tr-xs shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-900 shadow-xs rounded-tl-xs'
                  }`}
                >
                  <p className={isUser ? 'text-white' : 'text-slate-900'}>{msg.text}</p>

                  {/* Interactive Exercise Action Card */}
                  {msg.exerciseSuggestion && (
                    <div className="mt-3 p-3 rounded-xl bg-gradient-to-br from-indigo-50/90 to-teal-50/90 border border-indigo-200/80 shadow-2xs space-y-2">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs text-sm">
                          {msg.exerciseSuggestion.type === 'breathing' && '🌬️'}
                          {msg.exerciseSuggestion.type === 'grounding' && '🧘'}
                          {msg.exerciseSuggestion.type === 'journal' && '📝'}
                          {msg.exerciseSuggestion.type === 'sounds' && '🎧'}
                          {msg.exerciseSuggestion.type === 'muscle' && '💪'}
                          {msg.exerciseSuggestion.type === 'emdr' && '👁️'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-slate-900">
                              {msg.exerciseSuggestion.title}
                            </span>
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/90 px-1.5 py-0.2 rounded">
                              Calming Exercise
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                            {msg.exerciseSuggestion.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (onNavigateToExercises && msg.exerciseSuggestion) {
                              onNavigateToExercises(msg.exerciseSuggestion.type);
                              onClose();
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow transition cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>{msg.exerciseSuggestion.buttonLabel || 'Start Exercise'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (onNavigateToExercises) {
                              onNavigateToExercises();
                              onClose();
                            }
                          }}
                          className="py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
                          title="View all activities in Activities tab"
                        >
                          All Exercises
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/50">
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
            <div className="flex items-start gap-2.5 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-700 flex items-center justify-center text-white text-xs shadow-xs flex-shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5 max-w-[220px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.18s]"></span>
                  <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce [animation-delay:0.36s]"></span>
                  <span className="text-[11px] font-bold text-slate-500 ml-1.5">Thinking...</span>
                </div>
                <div className="w-28 h-2 rounded-full skeleton-box animate-shimmer" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Strip */}
        <div className="px-3 py-2 border-t border-slate-200 bg-white flex gap-1.5 overflow-x-auto no-scrollbar">
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
              placeholder="Share what is on your mind or ask for guidance..."
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
