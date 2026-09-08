export interface TranslationDictionary {
  [langCode: string]: {
    name: string;
    nativeName: string;
    appTitle: string;
    appSubtitle: string;
    helplineText: string;
    sosButton: string;
    startCheckin: string;
    takesTime: string;
    selectLanguage: string;
    whoIsThisFor: string;
    forMyself: string;
    forMyselfSub: string;
    forSomeoneElse: string;
    forSomeoneElseSub: string;
    basicDetails: string;
    enterName: string;
    enterPhone: string;
    selectState: string;
    selectDistrict: string;
    caseType: string;
    caseOptions: { [key: string]: string };
    next: string;
    back: string;
    skip: string;
    submit: string;
    listenQuestion: string;
    voiceCheckinPrompt: string;
    recordVoice: string;
    recording: string;
    stopRecord: string;
    analyzingVoice: string;
    crisisTitle: string;
    crisisSub: string;
    crisisCallNow: string;
    counsellorReachingOut: string;
    resultGreeting: string;
    resultBody: string;
    talkToCounsellor: string;
    breathingExercise: string;
    hopeWall: string;
    dailyAffirmation: string;
    questions: {
      [qId: number]: {
        title: string;
        options: { [optId: string]: string };
      };
    };
  };
}

export const translations: TranslationDictionary = {
  en: {
    name: 'English',
    nativeName: 'English',
    appTitle: 'ANVAYA • अन्वय',
    appSubtitle: 'Empathetic AI Mental Health & Distress Monitoring Platform | MoSJE',
    helplineText: 'National Atrocity Helpline: 14566 (24x7 Toll-Free)',
    sosButton: 'Immediate SOS',
    startCheckin: 'Begin Gentle Check-in',
    takesTime: 'Takes ~2 minutes • Soft, tap-friendly tiles',
    selectLanguage: 'Choose Your Preferred Language',
    whoIsThisFor: 'Who are you checking in for today?',
    forMyself: 'I need support for myself',
    forMyselfSub: 'A safe, tranquil space to understand how you feel',
    forSomeoneElse: 'Reporting for someone else',
    forSomeoneElseSub: 'Family member, witness or community caregiver',
    basicDetails: 'Identity & Context Setup',
    enterName: 'Your Name or Alias (Optional)',
    enterPhone: 'Mobile Number (for care updates)',
    selectState: 'Select State',
    selectDistrict: 'Select District',
    caseType: 'Case Context (SC/ST PoA Act & Relief)',
    caseOptions: {
      caste_violence: 'Caste-based Atrocity / Violence',
      grievous_hurt: 'Physical Trauma & Medical Strain',
      arson: 'Property Damage / Arson Loss',
      sexual_violence: 'Gender-based / Sexual Trauma',
      witness_intimidation: 'Witness Intimidation & Fear',
      compensation_delay: 'Compensation / Relief Fund Delay',
      other: 'Other Legal / Social Hardship',
    },
    next: 'Continue',
    back: 'Back',
    skip: 'Skip question',
    submit: 'Complete Check-in',
    listenQuestion: 'Listen to Question',
    voiceCheckinPrompt: 'Optional 20-second voice check-in: Share how you feel in your own words.',
    recordVoice: 'Record Voice Reflection',
    recording: 'Listening gently... (Speak freely)',
    stopRecord: 'Finish Speaking',
    analyzingVoice: 'AI Analyzing Tone & Vocal Balance...',
    crisisTitle: 'You are safe. We are right beside you.',
    crisisSub: 'Our certified health observers and crisis counselors are reaching out immediately. Take a deep breath — help is active.',
    crisisCallNow: 'Direct Helpline Call (14566)',
    counsellorReachingOut: 'A district healthcare nodal officer will connect with you right away.',
    resultGreeting: 'You took a meaningful step forward today.',
    resultBody: 'Your emotional health has been recorded with strict privacy. Based on your inputs, personalized care, relaxation tools, and relief channels are coordinated for you.',
    talkToCounsellor: 'Connect with Counsellor',
    breathingExercise: 'Try 60-Second Calming Breath',
    hopeWall: 'Community Survivor Hope Wall',
    dailyAffirmation: '“You are stronger than the difficult moments you are facing. Dignity, justice, and support stand with you.”',
    questions: {
      1: {
        title: 'How do you look and feel today?',
        options: {
          a: 'I feel okay',
          b: 'A little down',
          c: 'Sad most of time',
          d: 'Very sad, heavy inside',
        },
      },
      2: {
        title: 'How has your mood been lately?',
        options: {
          a: 'Normal ups and downs',
          b: 'Low but gets better',
          c: 'Heavy sadness that stays',
          d: 'Constant pain, no relief',
        },
      },
      3: {
        title: 'How restless or anxious do you feel inside?',
        options: {
          a: 'Calm and at peace',
          b: 'A little on edge',
          c: 'Tense or panicky often',
          d: 'Constant fear & dread',
        },
      },
      4: {
        title: 'How have you been sleeping at night?',
        options: {
          a: 'Sleeping peacefully',
          b: 'Bit hard to sleep',
          c: 'Wake up 2+ times',
          d: 'Barely 2–3 hours total',
        },
      },
      5: {
        title: 'How is your appetite for meals?',
        options: {
          a: 'Eating normal meals',
          b: 'Eating a little less',
          c: 'No real appetite',
          d: 'Need to force food down',
        },
      },
      6: {
        title: 'Can you focus on daily thoughts & tasks?',
        options: {
          a: 'Concentrating well',
          b: 'Sometimes lose focus',
          c: 'Hard to follow talks',
          d: 'Cannot focus at all',
        },
      },
      7: {
        title: 'How much energy do you have today?',
        options: {
          a: 'Normal energy',
          b: 'Takes effort to start',
          c: 'Hard to do basic work',
          d: 'Cannot do anything alone',
        },
      },
      8: {
        title: 'Do you feel connected to people around you?',
        options: {
          a: 'Yes, I care and feel',
          b: 'Less interested lately',
          c: 'Feel distant & detached',
          d: 'Feel numb to everything',
        },
      },
      9: {
        title: 'What kinds of thoughts come to your mind?',
        options: {
          a: 'Mostly hopeful & calm',
          b: 'Sometimes feel down',
          c: 'Often blame myself',
          d: 'Feel hopeless & helpless',
        },
      },
      10: {
        title: 'How do you feel about the future right now?',
        options: {
          a: 'I look forward to life',
          b: 'Life feels tiring',
          c: 'Sometimes wish it would end',
          d: 'I need urgent crisis help',
        },
      },
    },
  },
  hi: {
    name: 'Hindi',
    nativeName: 'हिन्दी',
    appTitle: 'अन्वय • ANVAYA',
    appSubtitle: 'अत्याचार पीड़ितों के लिए एआई-सहानुभूति मानसिक स्वास्थ्य व सुरक्षा प्रणाली | MoSJE',
    helplineText: 'राष्ट्रीय अत्याचार हेल्पलाइन: 14566 (24x7 निःशुल्क)',
    sosButton: 'आपातकालीन SOS',
    startCheckin: 'जांच शुरू करें',
    takesTime: 'लगभग 2 मिनट • सहज और आरामदायक टाइल्स',
    selectLanguage: 'अपनी पसंदीदा भाषा चुनें',
    whoIsThisFor: 'आज आप किसके लिए जानकारी दे रहे हैं?',
    forMyself: 'मैं अपने लिए सहायता चाहता/चाहती हूँ',
    forMyselfSub: 'गोपनीय, सौम्य और शांत मनोस्थिति जांच',
    forSomeoneElse: 'मैं किसी अन्य परिजन के लिए रिपोर्ट कर रहा हूँ',
    forSomeoneElseSub: 'परिवार के सदस्य, गवाह या सहायक',
    basicDetails: 'पहचान और संदर्भ',
    enterName: 'आपका नाम या उपनाम (वैकल्पिक)',
    enterPhone: 'मोबाइल नंबर (सुरक्षा और देखभाल हेतु)',
    selectState: 'राज्य चुनें',
    selectDistrict: 'जिला चुनें',
    caseType: 'मामले का संदर्भ (SC/ST अत्याचार निवारण अधिनियम)',
    caseOptions: {
      caste_violence: 'जातिगत हिंसा / प्रताड़ना',
      grievous_hurt: 'शारीरिक चोट / चिकित्सीय तनाव',
      arson: 'संपत्ति का नुकसान / आगजनी',
      sexual_violence: 'यौन उत्पीड़न / आघात',
      witness_intimidation: 'गवाह को धमकी या भय',
      compensation_delay: 'मुआवजा / पुनर्वास में देरी',
      other: 'अन्य कानूनी या सामाजिक तनाव',
    },
    next: 'आगे बढ़ें',
    back: 'पीछे',
    skip: 'छोड़ें',
    submit: 'पूर्ण करें',
    listenQuestion: 'प्रश्न सुनकर समझें (आवाज़)',
    voiceCheckinPrompt: 'वैकल्पिक 20 सेकंड की आवाज़: अपने शब्दों में बताएं कि आप कैसा महसूस कर रहे हैं।',
    recordVoice: 'आवाज़ रिकॉर्ड करें',
    recording: 'सुन रहे हैं... (स्वाभाविक रूप से बोलें)',
    stopRecord: 'रिकॉर्डिंग समाप्त',
    analyzingVoice: 'एआई आवाज़ और तनाव का विश्लेषण कर रहा है...',
    crisisTitle: 'आप सुरक्षित हैं। हम आपके साथ खड़े हैं।',
    crisisSub: 'हमारे स्वास्थ्य पर्यवेक्षक और परामर्शदाता आपसे तुरंत संपर्क कर रहे हैं। गहरी सांस लें — सहायता उपलब्ध है।',
    crisisCallNow: 'हेल्पलाइन पर सीधे कॉल करें (14566)',
    counsellorReachingOut: 'आपके जिले के प्रमाणित अधिकारी आपसे तुरंत संपर्क करेंगे।',
    resultGreeting: 'आज आपने एक साहसी और महत्वपूर्ण कदम उठाया है।',
    resultBody: 'आपकी मनोस्थिति सुरक्षित रूप से दर्ज कर ली गई है। आपकी स्थिति के अनुसार आवश्यक परामर्श और सहायता समन्वयित की जा रही है।',
    talkToCounsellor: 'परामर्शदाता से बात करें',
    breathingExercise: '60-सेकंड शांत श्वास व्यायाम',
    hopeWall: 'साथियों के प्रेरणादायी संदेश',
    dailyAffirmation: '“आप अपनी वर्तमान परिस्थितियों से कहीं अधिक मजबूत हैं। न्याय और सहायता आपके साथ है।”',
    questions: {
      1: {
        title: 'आज आप कैसा महसूस कर रहे हैं?',
        options: {
          a: 'मैं ठीक महसूस कर रहा हूँ',
          b: 'थोड़ा उदास हूँ',
          c: 'अधिकांश समय उदास',
          d: 'बहुत अधिक उदासी और भारीपन',
        },
      },
      2: {
        title: 'हाल ही में आपका मन कैसा रहा है?',
        options: {
          a: 'सामान्य उतार-चढ़ाव',
          b: 'कभी-कभी मन उदास',
          c: 'लगातार भारीपन',
          d: 'लगातार दर्द, कोई राहत नहीं',
        },
      },
      3: {
        title: 'अंदर से कितनी घबराहट या बेचैनी महसूस होती है?',
        options: {
          a: 'शांत और सामान्य',
          b: 'थोड़ी बेचैनी या तनाव',
          c: 'अक्सर डर या घबराहट',
          d: 'अत्यधिक भय और चिंता',
        },
      },
      4: {
        title: 'रात में आपकी नींद कैसी आ रही है?',
        options: {
          a: 'अच्छी और पूरी नींद',
          b: 'सोने में थोड़ी कठिनाई',
          c: 'रात में बार-बार आँख खुलती है',
          d: 'केवल 2–3 घंटे की नींद',
        },
      },
      5: {
        title: 'खाने-पीने की भूख कैसी है?',
        options: {
          a: 'सामान्य भूख लग रही है',
          b: 'पहले से थोड़ा कम खाना',
          c: 'बिल्कुल भूख नहीं लगती',
          d: 'जबरदस्ती खाना पड़ता है',
        },
      },
      6: {
        title: 'क्या आप दैनिक कार्यों पर ध्यान केंद्रित कर पा रहे हैं?',
        options: {
          a: 'हाँ, ध्यान ठीक लग रहा है',
          b: 'कभी-कभी ध्यान भटकता है',
          c: 'बातों को समझना मुश्किल',
          d: 'बिल्कुल ध्यान नहीं लगता',
        },
      },
      7: {
        title: 'आज आपके शरीर और मन में कितनी ऊर्जा है?',
        options: {
          a: 'सामान्य ऊर्जा',
          b: 'काम शुरू करने में भारी प्रयास',
          c: 'साधारण काम भी मुश्किल',
          d: 'बिना सहारे कुछ नहीं कर सकते',
        },
      },
      8: {
        title: 'क्या आप आसपास के लोगों से जुड़ाव महसूस करते हैं?',
        options: {
          a: 'हाँ, अपनापन महसूस होता है',
          b: 'पहले से कम रुचि है',
          c: 'सब से अलग-थलग भाव',
          d: 'भावनाएं एकदम शून्य हो गई हैं',
        },
      },
      9: {
        title: 'मन में किस तरह के विचार आ रहे हैं?',
        options: {
          a: 'आशावादी और सकारात्मक विचार',
          b: 'कभी-कभी निराशा होती है',
          c: 'अक्सर खुद को दोषी मानना',
          d: 'पूर्णतः निराश और बेसहारा भाव',
        },
      },
      10: {
        title: 'भविष्य को लेकर आपके मन में क्या भाव है?',
        options: {
          a: 'मैं जीवन में आगे बढ़ना चाहता हूँ',
          b: 'जीवन थका देने वाला लगता है',
          c: 'कभी-कभी लगता है सब खत्म हो जाए',
          d: 'मुझे तत्काल आपातकालीन मदद चाहिए',
        },
      },
    },
  },
  bn: {
    name: 'Bengali',
    nativeName: 'বাংলা',
    appTitle: 'অন্বয় • ANVAYA',
    appSubtitle: 'সহিংসতার শিকারদের জন্য এআই মানসিক সুরক্ষা প্ল্যাটফর্ম | MoSJE',
    helplineText: 'জাতীয় হেল্পলাইন: 14566 (২৪x৭ টোল-ফ্রি)',
    sosButton: 'জরুরি SOS',
    startCheckin: 'চেক-ইন শুরু করুন',
    takesTime: 'মাত্র ২ মিনিট • স্পর্শবান্ধব টাইলস',
    selectLanguage: 'পছন্দের ভাষা নির্বাচন করুন',
    whoIsThisFor: 'কার জন্য চেক-ইন করছেন?',
    forMyself: 'নিজের জন্য সাহায্য চাই',
    forMyselfSub: 'গোপনীয় ও নিরাপদ মানসিক মূল্যায়ন',
    forSomeoneElse: 'অন্য কারও জন্য রিপোর্ট করছি',
    forSomeoneElseSub: 'পরিবারের সদস্য বা প্রত্যক্ষদর্শী',
    basicDetails: 'তথ্য ও প্রেক্ষাপট',
    enterName: 'আপনার নাম (ঐচ্ছিক)',
    enterPhone: 'মোবাইল নম্বর',
    selectState: 'রাজ্য নির্বাচন করুন',
    selectDistrict: 'জেলা নির্বাচন করুন',
    caseType: 'মামলার ধরন',
    caseOptions: {
      caste_violence: 'জাতিগত নিপীড়ন ও সহিংসতা',
      grievous_hurt: 'শারীরিক আঘাত ও ট্রমা',
      arson: 'সম্পত্তি নষ্ট বা অগ্নিসংযোগ',
      sexual_violence: 'যৌন হয়রানি / সহিংসতা',
      witness_intimidation: 'সাক্ষীর ওপর হুমকি ও ভীতি',
      compensation_delay: 'ক্ষতিপূরণ / পুনর্বাসনে বিলম্ব',
      other: 'অন্যান্য আইনি ও সামাজিক চাপ',
    },
    next: 'পরবর্তী',
    back: 'পূর্ববর্তী',
    skip: 'এড়িয়ে যান',
    submit: 'সম্পন্ন করুন',
    listenQuestion: 'প্রশ্নটি শুনুন',
    voiceCheckinPrompt: 'ঐচ্ছিক ২০ সেকেন্ডের কণ্ঠস্বর: আপনি কেমন অনুভব করছেন বলুন।',
    recordVoice: 'ভয়েস রেকর্ড করুন',
    recording: 'শুনছি...',
    stopRecord: 'রেকর্ড সমাপ্ত',
    analyzingVoice: 'AI মানসিক অবস্থা বিশ্লেষণ করছে...',
    crisisTitle: 'আপনি সুরক্ষিত। আমরা আপনার পাশে আছি।',
    crisisSub: 'কাউন্সেলিং টিম দ্রুত আপনার সাথে যোগাযোগ করছে।',
    crisisCallNow: 'সরাসরি হেল্পলাইনে ফোন (14566)',
    counsellorReachingOut: 'জেলার সার্টিফাইড কাউন্সেলর শীঘ্রই যোগাযোগ করবেন।',
    resultGreeting: 'আজ আপনি অসাধারণ মানসিক সাহস দেখিয়েছেন।',
    resultBody: 'আপনার অনুভূতি নিরাপদে সংরক্ষিত হয়েছে। আপনার সুস্থতায় প্রয়োজনীয় সব সহায়তা সমন্বয় করা হচ্ছে।',
    talkToCounsellor: 'কাউন্সেলরের সাথে কথা বলুন',
    breathingExercise: '৬০-সেকেন্ড প্রশান্তিদায়ক শ্বাসক্রিয়া',
    hopeWall: 'অনুপ্রেরণামূলক আশা বার্তা',
    dailyAffirmation: '“আপনি বর্তমান পরিস্থিতির চেয়ে অনেক বেশি শক্তিশালী। ন্যায়বিচার আপনার সঙ্গে আছে।”',
    questions: {
      1: {
        title: 'আজ আপনার মন কেমন অনুভব করছে?',
        options: {
          a: 'আমি ভালো আছি',
          b: 'সামান্য মন খারাপ',
          c: 'বেশিরভাগ সময় উদাস',
          d: 'ভীষণ মন খারাপ ও ভেতরে কষ্ট',
        },
      },
      2: {
        title: 'সম্প্রতি আপনার মেজাজ কেমন যাচ্ছে?',
        options: {
          a: 'স্বাভাবিক ভালো-মন্দ',
          b: 'মাঝে মাঝে খারাপ লাগে',
          c: 'টানা দুঃখবোধ লেগেই থাকে',
          d: 'অবিরাম মানসিক যন্ত্রণা',
        },
      },
      3: {
        title: 'ভেতর থেকে কতটা উদ্বেগ বা ভয় অনুভব করেন?',
        options: {
          a: 'শান্ত ও স্বাভাবিক',
          b: 'সামান্য দুশ্চিন্তা',
          c: 'ঘন ঘন আতঙ্ক ও ভয়',
          d: 'অসহ্য আতঙ্ক ও চরম ভয়',
        },
      },
      4: {
        title: 'রাতে কেমন ঘুম হচ্ছে?',
        options: {
          a: 'ভালো এবং পূর্ণ ঘুম',
          b: 'ঘুমাতে একটু দেরি হয়',
          c: 'রাতে বারবার ঘুম ভাঙে',
          d: 'মাত্র ২-৩ ঘণ্টা ঘুম হয়',
        },
      },
      5: {
        title: 'খাবারের প্রতি রুচি কেমন?',
        options: {
          a: 'স্বাভাবিক খাওয়া-দাওয়া',
          b: 'আগের চেয়ে একটু কম',
          c: 'একেবারেই ইচ্ছে নেই',
          d: 'জোর করে খেতে হয়',
        },
      },
      6: {
        title: 'কাজে মনোযোগ দিতে পারছেন কি?',
        options: {
          a: 'হ্যাঁ, মনোযোগ ঠিক আছে',
          b: 'মাঝে মাঝে মন বিচ্ছিন্ন হয়',
          c: 'মনোযোগ দেওয়া কঠিন',
          d: 'একেবারেই মনোযোগ নেই',
        },
      },
      7: {
        title: 'আজ শরীরে কতটা শক্তি আছে?',
        options: {
          a: 'স্বাভাবিক শক্তি',
          b: 'কাজ শুরু করতে কষ্ট',
          c: 'সাধারণ কাজও ভীষণ কঠিন',
          d: 'কারও সাহায্য ছাড়া পারি না',
        },
      },
      8: {
        title: 'আশেপাশের মানুষের সাথে কেমন অনুভব করছেন?',
        options: {
          a: 'হ্যাঁ, ভালো লাগে',
          b: 'আগের চেয়ে আগ্রহ কম',
          c: 'দূরে থাকতে ইচ্ছে করে',
          d: 'কোনো অনুভূতিই নেই',
        },
      },
      9: {
        title: 'মনে কেমন চিন্তাভাবনা আসছে?',
        options: {
          a: 'আশাবাদী চিন্তা',
          b: 'মাঝে মাঝে হতাশ',
          c: 'নিজেকে দোষী মনে হয়',
          d: 'চরম নিরাশা ও অসহায় ভাব',
        },
      },
      10: {
        title: 'ভবিষ্যত নিয়ে আপনি কী ভাবছেন?',
        options: {
          a: 'জীবনে এগিয়ে যেতে চাই',
          b: 'জীবন ক্লান্তিকর লাগে',
          c: 'বেঁচে থাকার ইচ্ছে চলে যায়',
          d: 'জরুরি সাহায্য দরকার',
        },
      },
    },
  },
  ta: {
    name: 'Tamil',
    nativeName: 'தமிழ்',
    appTitle: 'அன்வயா • ANVAYA',
    appSubtitle: 'பாதிக்கப்பட்டோருக்கான மனநல கண்காணிப்பு தளம் | MoSJE',
    helplineText: 'தேசிய உதவி எண்: 14566 (24x7 கட்டணமில்லா எண்)',
    sosButton: 'அவசர SOS',
    startCheckin: 'பரிசோதனையை தொடங்கு',
    takesTime: 'சுமார் 2 நிமிடங்கள்',
    selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    whoIsThisFor: 'யாருக்காக பரிசோதிக்கிறீர்கள்?',
    forMyself: 'எனக்கு உதவி தேவைப்படுகிறது',
    forMyselfSub: 'பாதுகாப்பான மனநல மதிப்பீடு',
    forSomeoneElse: 'மற்றொருவருக்காக பதிவு செய்கிறேன்',
    forSomeoneElseSub: 'குடும்பத்தினர் அல்லது சாட்சி',
    basicDetails: 'அடிப்படை விவரங்கள்',
    enterName: 'பெயர் (விருப்பப்படி)',
    enterPhone: 'கைபேசி எண்',
    selectState: 'மாநிலம்',
    selectDistrict: 'மாவட்டம்',
    caseType: 'வழக்கு வகை',
    caseOptions: {
      caste_violence: 'சாதிய வன்முறை / துன்புறுத்தல்',
      grievous_hurt: 'உடல் காயம் / மன உளைச்சல்',
      arson: 'சொத்து சேதம் / தீ வைப்பு',
      sexual_violence: 'பாலியல் துன்புறுத்தல்',
      witness_intimidation: 'சாட்சிகளுக்கு அச்சுறுத்தல்',
      compensation_delay: 'இழப்பீடு தாமதம்',
      other: 'பிற சிக்கல்கள்',
    },
    next: 'தொடரவும்',
    back: 'பின்னால்',
    skip: 'தவிர்க்கவும்',
    submit: 'முடிக்கவும்',
    listenQuestion: 'கேள்வியைக் கேளுங்கள்',
    voiceCheckinPrompt: 'குரல் பதிவு: நீங்கள் எப்படி உணர்கிறீர்கள் என்று பேசுங்கள்.',
    recordVoice: 'குரல் பதிவு செய்ய',
    recording: 'கேட்கிறது...',
    stopRecord: 'முடிந்தது',
    analyzingVoice: 'AI பகுப்பாய்வு செய்கிறது...',
    crisisTitle: 'நீங்கள் பாதுகாப்பாக உள்ளீர்கள்.',
    crisisSub: 'எங்கள் ஆலோசகர் உடனடியாக உங்களைத் தொடர்புகொள்வார்.',
    crisisCallNow: 'நேரடி அழைப்பு (14566)',
    counsellorReachingOut: 'மாவட்ட ஆலோசகர் விரைவில் அழைப்பார்.',
    resultGreeting: 'நீங்கள் மிகுந்த தைரியத்தை காட்டியுள்ளீர்கள்.',
    resultBody: 'உங்கள் விவரங்கள் பாதுகாப்பாக பதிவு செய்யப்பட்டுள்ளன.',
    talkToCounsellor: 'ஆலோசகரிடம் பேசுங்கள்',
    breathingExercise: 'சுவாசப் பயிற்சி',
    hopeWall: 'நம்பிக்கை செய்திகள்',
    dailyAffirmation: '“நீங்கள் தைரியமானவர். நீதி உங்கள் பக்கம் உள்ளது.”',
    questions: {
      1: {
        title: 'இன்று உங்கள் மனம் எப்படி உள்ளது?',
        options: {
          a: 'நன்றாக உணர்கிறேன்',
          b: 'சற்று வருத்தமாக உள்ளது',
          c: 'அடிக்கடி சோகம்',
          d: 'மிகவும் பாரமான மனநிலை',
        },
      },
      2: {
        title: 'சமீபத்தில் உங்கள் மனநிலை எப்படி இருந்தது?',
        options: {
          a: 'சாதாரண ஏற்ற இறக்கங்கள்',
          b: 'சிறிது சோர்வு',
          c: 'தொடர் சோகம்',
          d: 'கடும் மன வேதனை',
        },
      },
      3: {
        title: 'உங்களுக்குள் எவ்வளவு பயம் உள்ளது?',
        options: {
          a: 'அமைதியாக உள்ளேன்',
          b: 'சிறிது பயம்',
          c: 'அடிக்கடி பதற்றம்',
          d: 'கடும் பயமும் நடுக்கமும்',
        },
      },
      4: {
        title: 'இரவில் தூக்கம் எப்படி இருக்கிறது?',
        options: {
          a: 'நல்ல தூக்கம்',
          b: 'தூங்க சிறிது தாமதம்',
          c: 'இரவில் விழிப்பு',
          d: '2-3 மணி நேரம் மட்டுமே',
        },
      },
      5: {
        title: 'உணவு பசி எப்படி உள்ளது?',
        options: {
          a: 'சாதாரண பசி',
          b: 'சற்று குறைவான உணவு',
          c: 'பசி இல்லை',
          d: 'கட்டாயப்படுத்தி உண்கிறேன்',
        },
      },
      6: {
        title: 'பணிகளில் கவனம் செலுத்த முடிகிறதா?',
        options: {
          a: 'நல்ல கவனம்',
          b: 'சில நேரங்களில் குழப்பம்',
          c: 'கவனம் செலுத்துவது கடினம்',
          d: 'கவனமே செலுத்த முடியவில்லை',
        },
      },
      7: {
        title: 'இன்று உங்கள் உடலில் எவ்வளவு ஆற்றல் உள்ளது?',
        options: {
          a: 'இயல்பான ஆற்றல்',
          b: 'வேலை தொடங்க கடினம்',
          c: 'எளிய வேலைகளும் சுமை',
          d: 'பிறர் உதவியின்றி முடியாது',
        },
      },
      8: {
        title: 'சுற்றியுள்ளவர்களுடன் தொடர்பு எப்படி உள்ளது?',
        options: {
          a: 'அன்புடன் உணர்கிறேன்',
          b: 'சற்று விலகி இருக்கிறேன்',
          c: 'தனிமையாக உணர்கிறேன்',
          d: 'எந்த உணர்வும் இல்லை',
        },
      },
      9: {
        title: 'மனதில் எத்தகைய எண்ணங்கள் வருகின்றன?',
        options: {
          a: 'நம்பிக்கையான எண்ணங்கள்',
          b: 'சில நேரங்களில் சோர்வு',
          c: 'சுய குற்றம் சாட்டுதல்',
          d: 'முழு நம்பிக்கையின்மை',
        },
      },
      10: {
        title: 'எதிர்காலத்தைப் பற்றி என்ன நினைக்கிறீர்கள்?',
        options: {
          a: 'வாழ்க்கையை எதிர்நோக்குகிறேன்',
          b: 'வாழ்க்கை அலுப்பாக உள்ளது',
          c: 'வாழ விருப்பமில்லை',
          d: 'அவசர உதவி தேவை',
        },
      },
    },
  },
  te: {
    name: 'Telugu',
    nativeName: 'తెలుగు',
    appTitle: 'అన్వయ • ANVAYA',
    appSubtitle: 'బాధితుల మానసిక ఆరోగ్య రక్షణ మరియు పర్యవేక్షణ వ్యవస్థ | MoSJE',
    helplineText: 'జాతీయ హెల్ప్‌లైన్: 14566 (24x7 టోల్ ఫ్రీ)',
    sosButton: 'అత్యవసర SOS',
    startCheckin: 'చెకిన్ ప్రారంభించండి',
    takesTime: 'కేవలం 2 నిమిషాలు',
    selectLanguage: 'మీ భాషను ఎంచుకోండి',
    whoIsThisFor: 'ఎవరి కోసం చెకిన్ చేస్తున్నారు?',
    forMyself: 'నా కోసం సహాయం కావాలి',
    forMyselfSub: 'రహస్యమైన మరియు ప్రశాంతమైన పరీక్ష',
    forSomeoneElse: 'వేరొకరి కోసం నమోదు చేస్తున్నాను',
    forSomeoneElseSub: 'కుటుంబ సభ్యుడు లేదా సాక్షి',
    basicDetails: 'ప్రాథమిక వివరాలు',
    enterName: 'పేరు (ఐచ్ఛికం)',
    enterPhone: 'మొబైల్ సంఖ్య',
    selectState: 'రాష్ట్రం',
    selectDistrict: 'జిల్లా',
    caseType: 'కేసు వర్గం',
    caseOptions: {
      caste_violence: 'కుల వివక్ష / దౌర్జన్యం',
      grievous_hurt: 'శారీరక గాయం / తీవ్ర వేదన',
      arson: 'ఆస్తి నష్టం / దహనం',
      sexual_violence: 'లైంగిక వేధింపులు',
      witness_intimidation: 'సాక్షులకు బెదిరింపులు',
      compensation_delay: 'పరిహారం ఆలస్యం',
      other: 'ఇతర ఇబ్బందులు',
    },
    next: 'తరువాత',
    back: 'వెనుకకు',
    skip: 'దాటవేయి',
    submit: 'పూర్తి చేయండి',
    listenQuestion: 'ప్రశ్న వినండి',
    voiceCheckinPrompt: 'వాయిస్ రికార్డ్: మీరు ఎలా ఉన్నారో మీ మాటల్లో చెప్పండి.',
    recordVoice: 'వాయిస్ రికార్డ్',
    recording: 'వింటున్నాము...',
    stopRecord: 'పూర్తయింది',
    analyzingVoice: 'AI విశ్లేషిస్తోంది...',
    crisisTitle: 'మీరు సురక్షితంగా ఉన్నారు.',
    crisisSub: 'మా కౌన్సిలర్ తక్షణమే మిమ్మల్ని సంప్రదిస్తారు.',
    crisisCallNow: 'హెల్ప్‌లైన్‌కు కాల్ (14566)',
    counsellorReachingOut: 'జిల్లా కౌన్సిలర్ త్వరలో కాల్ చేస్తారు.',
    resultGreeting: 'మీరు ఎంతో ధైర్యాన్ని చూపించారు.',
    resultBody: 'మీ వివరాలు భద్రపరచబడ్డాయి.',
    talkToCounsellor: 'కౌన్సిలర్‌తో మాట్లాడండి',
    breathingExercise: 'శ్వాస వ్యాయామం',
    hopeWall: 'ధైర్య సందేశాలు',
    dailyAffirmation: '“మీరు ధైర్యవంతులు. న్యాయం మీ పక్షాన ఉంది.”',
    questions: {
      1: {
        title: 'ఈ రోజు మీ మనస్సు ఎలా ఉంది?',
        options: {
          a: 'బాగానే ఉన్నాను',
          b: 'కొద్దిగా బాధగా ఉంది',
          c: 'ఎక్కువ సమయం విచారం',
          d: 'తీవ్రమైన బాధ & భారం',
        },
      },
      2: {
        title: 'ఇటీవల మీ మానసిక స్థితి ఎలా ఉంది?',
        options: {
          a: 'సాధారణ హెచ్చుతగ్గులు',
          b: 'కొద్దిగా నిరుత్సాహం',
          c: 'నిరంతర విచారం',
          d: 'తీవ్ర వేదన',
        },
      },
      3: {
        title: 'మీలో ఎంతవరకు ఆందోళన ఉంది?',
        options: {
          a: 'ప్రశాంతంగా ఉన్నాను',
          b: 'స్వల్ప ఆందోళన',
          c: 'తరచుగా భయం',
          d: 'తీవ్రమైన భయం & వణుకు',
        },
      },
      4: {
        title: 'రాత్రి నిద్ర ఎలా పడుతోంది?',
        options: {
          a: 'మంచి నిద్ర',
          b: 'నిద్ర పట్టడం కష్టం',
          c: 'రాత్రి మెలకువలు',
          d: 'కేవలం 2-3 గంటలు మాత్రమే',
        },
      },
      5: {
        title: 'ఆహారం మరియు ఆకలి ఎలా ఉంది?',
        options: {
          a: 'సాధారణ ఆకలి',
          b: 'కొద్దిగా తక్కువ',
          c: 'అస్సలు ఆకలి లేదు',
          d: 'బలవంతంగా తింటున్నాను',
        },
      },
      6: {
        title: 'పనులపై దృష్టి కేంద్రీకరించగలుగుతున్నారా?',
        options: {
          a: 'బాగానే దృష్టి ఉంది',
          b: 'కొన్నిసార్లు దృష్టి తప్పుతుంది',
          c: 'దృష్టి పెట్టడం కష్టం',
          d: 'అస్సలు దృష్టి పెట్టలేకపోతున్నాను',
        },
      },
      7: {
        title: 'ఈ రోజు మీలో ఎంత శక్తి ఉంది?',
        options: {
          a: 'సాధారణ శక్తి',
          b: 'పని ప్రారంభించడం కష్టం',
          c: 'చిన్న పనులు కూడా భారం',
          d: 'సహాయం లేకుండా ఏమీ చేయలేను',
        },
      },
      8: {
        title: 'చుట్టూ ఉన్నవారితో అనుబంధం ఎలా ఉంది?',
        options: {
          a: 'ఆప్యాయత ఉంది',
          b: 'ఆసక్తి తగ్గింది',
          c: 'దూరంగా ఉండాలనిపిస్తుంది',
          d: 'ఏ భావనలూ లేవు',
        },
      },
      9: {
        title: 'మనస్సులో ఎటువంటి ఆలోచనలు వస్తున్నాయి?',
        options: {
          a: 'ఆశావాద ఆలోచనలు',
          b: 'కొన్నిసార్లు నిరాశ',
          c: 'స్వీయ నింద',
          d: 'పూర్తి నిస్సహాయత',
        },
      },
      10: {
        title: 'భవిష్యత్తు గురించి మీరు ఎలా భావిస్తున్నారు?',
        options: {
          a: 'ముందుకు సాగాలని ఉంది',
          b: 'జీవితం అలసటగా ఉంది',
          c: 'బతకాలనిపించడం లేదు',
          d: 'అత్యవసర సహాయం కావాలి',
        },
      },
    },
  },
  mr: {
    name: 'Marathi',
    nativeName: 'मराठी',
    appTitle: 'अन्वय • ANVAYA',
    appSubtitle: 'अत्याचार पीडितांसाठी एआई मानसिक आरोग्य व सुरक्षा प्रणाली | MoSJE',
    helplineText: 'राष्ट्रीय हेल्पलाइन: 14566 (24x7 टोल-फ्री)',
    sosButton: 'तातडीचे SOS',
    startCheckin: 'तपासणी सुरू करा',
    takesTime: 'केवळ 2 मिनिटे',
    selectLanguage: 'भाषा निवडा',
    whoIsThisFor: 'कोणासाठी नोंद करत आहात?',
    forMyself: 'मला स्वतःसाठी मदत हवी आहे',
    forMyselfSub: 'गोपनीय आणि शांत मनःस्थिती तपासणी',
    forSomeoneElse: 'मी दुसऱ्या व्यक्तीसाठी नोंदवत आहे',
    forSomeoneElseSub: 'कुटुंबातील सदस्य किंवा साक्षीदार',
    basicDetails: 'मूलभूत तपशील',
    enterName: 'नाव (ऐच्छिक)',
    enterPhone: 'मोबाईल क्रमांक',
    selectState: 'राज्य निवडा',
    selectDistrict: 'जिल्हा निवडा',
    caseType: 'प्रकरणाचा प्रकार',
    caseOptions: {
      caste_violence: 'जातीय अत्याचार / हिंसाचार',
      grievous_hurt: 'शारीरिक दुखापत / आघात',
      arson: 'मालमत्तेचे नुकसान / जाळपोळ',
      sexual_violence: 'लैंगिक छळ / अत्याचार',
      witness_intimidation: 'साक्षीदाराला धमकी किंवा भीती',
      compensation_delay: 'भरपाई / पुनर्वसनात विलंब',
      other: 'इतर कायदेशीर किंवा सामाजिक ताण',
    },
    next: 'पुढे चला',
    back: 'मागे',
    skip: 'वगळा',
    submit: 'पूर्ण करा',
    listenQuestion: 'प्रश्न ऐका',
    voiceCheckinPrompt: 'आवाज नोंदवा: तुम्हाला कसे वाटते ते सांगा.',
    recordVoice: 'आवाज नोंदवा',
    recording: 'ऐकत आहोत...',
    stopRecord: 'पूर्ण',
    analyzingVoice: 'AI विश्लेषण करत आहे...',
    crisisTitle: 'तुम्ही सुरक्षित आहात. आम्ही सोबत आहोत.',
    crisisSub: 'समुपदेशक तुमच्याशी लगेच संपर्क साधतील.',
    crisisCallNow: 'थेट कॉल करा (14566)',
    counsellorReachingOut: 'जिल्ह्यातील समुपदेशक लवकरच संपर्क करतील.',
    resultGreeting: 'आज तुम्ही मोठे धैर्य दाखवले आहे.',
    resultBody: 'माहिती सुरक्षित ठेवली आहे. आवश्यक ती सर्व मदत पुरवली जाईल.',
    talkToCounsellor: 'समुपदेशकाशी बोला',
    breathingExercise: 'श्वसन व्यायाम',
    hopeWall: 'प्रेरणादायी संदेश',
    dailyAffirmation: '“तुम्ही परिस्थितीपेक्षा अधिक सक्षम आहात. न्याय तुमच्या बाजूने आहे.”',
    questions: {
      1: {
        title: 'आज तुम्हाला कसे वाटत आहे?',
        options: {
          a: 'मी ठीक आहे',
          b: 'थोडे उदास',
          c: 'बहुतांश वेळ दुःख',
          d: 'खूप जास्त उदासी आणि जडपणा',
        },
      },
      2: {
        title: 'नुकताच तुमचा मूड कसा राहिला आहे?',
        options: {
          a: 'सामान्य चढ-उतार',
          b: 'कधीकधी उदास',
          c: 'सतत दुःख',
          d: 'सतत वेदना, आराम नाही',
        },
      },
      3: {
        title: 'आतल्या आत किती भीती वाटते?',
        options: {
          a: 'शांत आणि सामान्य',
          b: 'थोडी अस्वस्थता',
          c: 'वारंवार भीती',
          d: 'तीव्र भीती आणि थरकाप',
        },
      },
      4: {
        title: 'रात्री झोप कशी येत आहे?',
        options: {
          a: 'शांत आणि पूर्ण झोप',
          b: 'झोपायला वेळ लागतो',
          c: 'रात्री वारंवार जाग',
          d: 'फक्त 2-3 तास झोप',
        },
      },
      5: {
        title: 'जेवणाची भूक कशी आहे?',
        options: {
          a: 'सामान्य भूक',
          b: 'आधीपेक्षा कमी खाणे',
          c: 'अजिबात भूक नाही',
          d: 'जबरदस्तीने खावे लागते',
        },
      },
      6: {
        title: 'कामांवर लक्ष केंद्रित करू शकता का?',
        options: {
          a: 'होय, लक्ष व्यवस्थित आहे',
          b: 'कधीकधी लक्ष विचलित',
          c: 'लक्ष देणे कठीण',
          d: 'अजिबात लक्ष लागत नाही',
        },
      },
      7: {
        title: 'आज तुमच्यात किती ऊर्जा आहे?',
        options: {
          a: 'सामान्य ऊर्जा',
          b: 'काम सुरू करायला कष्ट',
          c: 'साधे काम करणेही कठीण',
          d: 'मदतीशिवाय काहीच अशक्य',
        },
      },
      8: {
        title: 'आसपासच्या लोकांशी कसे वाटते?',
        options: {
          a: 'आपुलकी वाटते',
          b: 'आवड कमी झाली आहे',
          c: 'सर्वांपासून दूर राहावेसे वाटते',
          d: 'काहीच भावना उरल्या नाहीत',
        },
      },
      9: {
        title: 'मनात कसे विचार येत आहेत?',
        options: {
          a: 'आशावादी विचार',
          b: 'कधीकधी निराशा',
          c: 'स्वतःला दोषी समजणे',
          d: 'पूर्णपणे हताश व असहाय्य',
        },
      },
      10: {
        title: 'भविष्याबद्दल तुम्हाला काय वाटते?',
        options: {
          a: 'मला पुढे जायचे आहे',
          b: 'जीवन थकवणारे वाटते',
          c: 'जगण्याची इच्छा नसते',
          d: 'तातडीची मदत हवी आहे',
        },
      },
    },
  },
};
